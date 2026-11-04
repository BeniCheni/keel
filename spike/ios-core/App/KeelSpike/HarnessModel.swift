import Foundation
import KeelSpikeKit
import Security
import UserNotifications

@MainActor
final class HarnessModel: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    @Published var lines: [String] = []
    @Published var nextVariant: String
    @Published var showImporter = false
    @Published var showDetail = false
    @Published var detailText = ""
    private var started = false
    private let snapshotURL: URL

    override init() {
        let stored = UserDefaults.standard.string(forKey: "keel.spike.next-variant") ?? "compile"
        nextVariant = stored == "standalone" ? "standalone" : "compile"
        let base = (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true))
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        snapshotURL = base.appendingPathComponent("keel-spike", isDirectory: true).appendingPathComponent("snapshot.yaml")
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }

    func startIfNeeded() {
        guard !started else { return }
        started = true
        let variant = launchValue("-KeelVariant") ?? nextVariant
        emit("KEEL_SPIKE v1 process pid=\(ProcessInfo.processInfo.processIdentifier)")
        guard let files = try? SpikeFiles.from(bundle: .main) else {
            emit("KEEL_SPIKE v1 error subject=bundle")
            return
        }
        guard let source = try? files.source(variant: variant) else {
            emit("KEEL_SPIKE v1 error subject=variant")
            return
        }
        if launchValue("-KeelProbe") != nil {
            emitLocales(files)
            return
        }
        if let sample = try? Timing.measure(bundleSource: source, exampleText: files.example) {
            emit(
                "KEEL_SPIKE v1 timing variant=\(variant) kind=fresh pid=\(ProcessInfo.processInfo.processIdentifier) contextMs=\(formatMilliseconds(sample.contextMs)) loadTermsMs=\(formatMilliseconds(sample.loadTermsMs))"
            )
        } else {
            emit("KEEL_SPIKE v1 error subject=timing")
        }
        emitParity(files)
    }

    private func emitLocales(_ files: SpikeFiles) {
        for name in ["compile", "standalone"] {
            guard let bundle = try? files.source(variant: name),
                  let session = try? CoreSession(bundleSource: bundle),
                  let locale = try? session.locale()
            else {
                emit("KEEL_SPIKE v1 error subject=locale")
                continue
            }
            emit("KEEL_SPIKE v1 locale engine=jscontext variant=\(name) locale=\(locale)")
        }
    }

    private func emitParity(_ files: SpikeFiles) {
        let inputs = parityInputs(files)
        for name in ["compile", "standalone"] {
            guard let bundle = try? files.source(variant: name) else {
                emit("KEEL_SPIKE v1 error subject=parity")
                continue
            }
            for reversed in [false, true] {
                guard let session = try? CoreSession(bundleSource: bundle, reversedComparator: reversed) else {
                    emit("KEEL_SPIKE v1 error subject=parity")
                    continue
                }
                let locale = (try? session.locale()) ?? "unknown"
                let comparator = reversed ? "reversed" : "identity"
                if !reversed {
                    emit("KEEL_SPIKE v1 locale engine=jscontext variant=\(name) locale=\(locale)")
                }
                for fixture in inputs {
                    guard let line = try? session.line(text: fixture.text, file: fixture.file) else {
                        emit("KEEL_SPIKE v1 error subject=parity")
                        continue
                    }
                    emit(parityRecord(variant: name, locale: locale, comparator: comparator, file: fixture.file, jsonLine: line))
                }
            }
        }
    }

    private func parityInputs(_ files: SpikeFiles) -> [FixtureFile] {
        guard let minimal = files.fixtures.first(where: { $0.file.hasSuffix("/valid/minimal.yaml") }),
              let tie = try? TieInput.text(from: minimal.text)
        else {
            emit("KEEL_SPIKE v1 error subject=tie")
            return files.fixtures
        }
        return files.fixtures + [FixtureFile(file: TieInput.file, text: tie)]
    }

    func saveNextVariant() {
        let value = nextVariant == "standalone" ? "standalone" : "compile"
        UserDefaults.standard.set(value, forKey: "keel.spike.next-variant")
        emit("KEEL_SPIKE v1 q5 subject=next-variant value=\(value)")
    }

    func runWarmSet() {
        guard let files = try? SpikeFiles.from(bundle: .main) else { return }
        let variant = nextVariant == "standalone" ? "standalone" : "compile"
        guard let source = try? files.source(variant: variant) else { return }
        var context: [Double] = []
        var load: [Double] = []
        for _ in 0 ..< 20 {
            guard let sample = try? Timing.measure(bundleSource: source, exampleText: files.example) else { continue }
            context.append(sample.contextMs)
            load.append(sample.loadTermsMs)
        }
        emit(
            "KEEL_SPIKE v1 timing variant=\(variant) kind=warm-context count=\(context.count) medianMs=\(formatMilliseconds(median(context))) worstMs=\(formatMilliseconds(worst(context)))"
        )
        emit(
            "KEEL_SPIKE v1 timing variant=\(variant) kind=warm-load count=\(load.count) medianMs=\(formatMilliseconds(median(load))) worstMs=\(formatMilliseconds(worst(load)))"
        )
    }

    func noteUnreadableImport() {
        emit("KEEL_SPIKE v1 q5 subject=import result=unreadable")
    }

    func importFile(_ url: URL) {
        let access = url.startAccessingSecurityScopedResource()
        defer { if access { url.stopAccessingSecurityScopedResource() } }
        guard let data = try? Data(contentsOf: url), let text = String(data: data, encoding: .utf8) else {
            emit("KEEL_SPIKE v1 q5 subject=import result=unreadable")
            return
        }
        guard let files = try? SpikeFiles.from(bundle: .main),
              let session = try? CoreSession(bundleSource: files.compile),
              let line = try? session.line(text: text, file: "export.yaml"),
              let dataLine = line.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: dataLine) as? [String: Any],
              let result = object["result"] as? [String: Any]
        else {
            emit("KEEL_SPIKE v1 q5 subject=import result=unreadable")
            return
        }
        let existed = FileManager.default.fileExists(atPath: snapshotURL.path)
        if result["ok"] as? Bool != true {
            let errors = result["errors"] as? [[String: Any]] ?? []
            let first = errors.first
            let lineNo = first?["line"] as? Int ?? 0
            let column = first?["column"] as? Int ?? 0
            emit("KEEL_SPIKE v1 q5 subject=import result=rejected count=\(errors.count) line=\(lineNo) column=\(column) kept-previous=\(existed)")
            return
        }
        do {
            try FileManager.default.createDirectory(at: snapshotURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            try data.write(to: snapshotURL, options: [.atomic, .completeFileProtection])
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
            var written = snapshotURL
            try written.setResourceValues(values)
            let read = try snapshotURL.resourceValues(forKeys: [.isExcludedFromBackupKey, .fileProtectionKey])
            let excluded = read.isExcludedFromBackup == true
            let protection = read.fileProtection?.rawValue ?? "absent"
            emit("KEEL_SPIKE v1 q5 subject=import result=stored backup-excluded=\(excluded) protection=\(protection)")
        } catch {
            emit("KEEL_SPIKE v1 q5 subject=import result=unreadable")
        }
    }

    func readBackupFlag() {
        guard FileManager.default.fileExists(atPath: snapshotURL.path) else {
            emit("KEEL_SPIKE v1 q5 subject=backup-exclusion value=absent")
            return
        }
        let read = try? snapshotURL.resourceValues(forKeys: [.isExcludedFromBackupKey, .fileProtectionKey])
        let excluded = read?.isExcludedFromBackup == true
        let protection = read?.fileProtection?.rawValue ?? "absent"
        emit("KEEL_SPIKE v1 q5 subject=backup-exclusion value=\(excluded) protection=\(protection)")
    }

    func scheduleTwoMinutes() async {
        guard let note = exampleNote(kind: .a3) else { return }
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        if settings.authorizationStatus == .notDetermined {
            _ = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
        }
        let updated = await center.notificationSettings()
        emit("KEEL_SPIKE v1 q5 subject=notification-auth status=\(authName(updated.authorizationStatus)) alert=\(updated.alertSetting.rawValue)")
        let content = content(from: note)
        let date = Date().addingTimeInterval(120)
        let parts = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
        let trigger = UNCalendarNotificationTrigger(dateMatching: parts, repeats: false)
        let request = UNNotificationRequest(identifier: "keel-spike-two-minute", content: content, trigger: trigger)
        do {
            try await center.add(request)
            emit("KEEL_SPIKE v1 q5 subject=scheduled-notification fire-in-seconds=120")
        } catch {
            emit("KEEL_SPIKE v1 q5 subject=scheduled-notification result=denied")
        }
    }

    func requestSeventy() async {
        guard let note = exampleNote(kind: .a5) else { return }
        let center = UNUserNotificationCenter.current()
        _ = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
        let content = content(from: note)
        for index in 0 ..< 70 {
            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 3600 + Double(index), repeats: false)
            let request = UNNotificationRequest(identifier: "keel-spike-pending-\(index)", content: content, trigger: trigger)
            try? await center.add(request)
        }
        let pending = await center.pendingNotificationRequests()
        let kept = pending.filter { $0.identifier.hasPrefix("keel-spike-pending-") }.count
        emit("KEEL_SPIKE v1 q5 subject=pending-kept count=\(kept) total=\(pending.count)")
    }

    func addRepeating() async {
        guard let note = exampleNote(kind: .a9) else { return }
        let center = UNUserNotificationCenter.current()
        _ = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 60, repeats: true)
        let request = UNNotificationRequest(identifier: "keel-spike-repeating", content: content(from: note), trigger: trigger)
        try? await center.add(request)
        let pending = await center.pendingNotificationRequests()
        let kept = pending.filter { $0.identifier == "keel-spike-repeating" }.count
        emit("KEEL_SPIKE v1 q5 subject=repeating-pending count=\(kept)")
    }

    func keychainRoundTrip() {
        let service = "dev.keel.spike"
        let account = "synthetic"
        let secret = Data("synthetic-token".utf8)
        let base: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(base as CFDictionary)
        var add = base
        add[kSecValueData as String] = secret
        let added = SecItemAdd(add as CFDictionary, nil)
        var query = base
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?
        let copied = SecItemCopyMatching(query as CFDictionary, &item)
        let matches = (item as? Data) == secret
        let deleted = SecItemDelete(base as CFDictionary)
        let ok = added == errSecSuccess && copied == errSecSuccess && matches && deleted == errSecSuccess
        emit("KEEL_SPIKE v1 q5 subject=keychain result=\(ok ? "added-read-deleted" : "failed")")
    }

    func openDetail() {
        guard FileManager.default.fileExists(atPath: snapshotURL.path) else {
            detailText = "No snapshot is stored."
            showDetail = true
            emit("KEEL_SPIKE v1 q5 subject=detail state=empty")
            return
        }
        do {
            _ = try Data(contentsOf: snapshotURL)
            let disclaimer = (try? SpikeFiles.from(bundle: .main).disclaimer) ?? ""
            let note = exampleNote(kind: .a8)
            let page = NotificationCopy.detailPage(
                notification: note ?? NotificationText(title: "", subtitle: "", body: ""),
                disclaimer: disclaimer
            )
            detailText = page
            showDetail = true
            let present = disclaimer.isEmpty ? "absent" : "present"
            emit("KEEL_SPIKE v1 q5 subject=detail state=readable disclaimer=\(present)")
        } catch {
            detailText = "Waiting for unlock before the snapshot can be read."
            showDetail = true
            emit("KEEL_SPIKE v1 q5 subject=detail state=waiting-for-unlock")
        }
    }

    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        await openDetail()
    }

    private func exampleNote(kind: ReminderKind) -> NotificationText? {
        guard let files = try? SpikeFiles.from(bundle: .main),
              let session = try? CoreSession(bundleSource: files.compile),
              let line = try? session.line(text: files.example, file: "fixtures/synthetic/terms/valid/example-autocall.yaml"),
              let snapshot = SnapshotReader.fromTermsLine(line)
        else { return nil }
        return NotificationCopy.text(kind: kind, snapshot: snapshot)
    }

    private func content(from note: NotificationText) -> UNMutableNotificationContent {
        let content = UNMutableNotificationContent()
        content.title = note.title
        content.subtitle = note.subtitle
        content.body = note.body
        return content
    }

    private func authName(_ status: UNAuthorizationStatus) -> String {
        switch status {
        case .authorized: return "authorized"
        case .denied: return "denied"
        case .notDetermined: return "not-determined"
        case .provisional: return "provisional"
        case .ephemeral: return "ephemeral"
        @unknown default: return "unknown"
        }
    }

    private func launchValue(_ flag: String) -> String? {
        let args = CommandLine.arguments
        guard let index = args.firstIndex(of: flag), index + 1 < args.count else { return nil }
        return args[index + 1]
    }

    private func emit(_ line: String) {
        lines.append(line)
        FileHandle.standardOutput.write(Data((line + "\n").utf8))
        try? FileHandle.standardOutput.synchronize()
    }
}
