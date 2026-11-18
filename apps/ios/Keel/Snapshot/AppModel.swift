import Foundation
import KeelCoreHost

@MainActor
final class AppModel: ObservableObject {
    @Published var rows: [ScreenRow] = []
    @Published var picking = false
    let title: String
    private let copy = Copy.screen
    private let store: SnapshotStore
    private var session: CoreSession?
    private var active: ActiveDocument?
    private var failure: FailureKind?

    init(store: SnapshotStore = SnapshotStore(folder: AppModel.folder(), files: FoundationFiling())) {
        self.store = store
        title = copy.title
        launch()
        reloadStored()
        refresh()
    }

    func finishPick(_ result: Result<[URL], Error>) {
        switch result {
        case .failure(let error):
            let ns = error as NSError
            if ns.domain == NSCocoaErrorDomain && ns.code == NSUserCancelledError { return }
            show(.read)
        case .success(let urls):
            guard let url = urls.first else { return }
            importURL(url)
        }
    }

    private func launch() {
        let count = UserDefaults.standard.integer(forKey: "keel.launch.count") + 1
        UserDefaults.standard.set(count, forKey: "keel.launch.count")
        guard let coreURL = Bundle.main.url(forResource: "core", withExtension: "js"),
              let exampleURL = Bundle.main.url(forResource: "example-autocall", withExtension: "yaml"),
              let bundle = try? ByteRead.data(from: coreURL),
              let example = try? ByteRead.data(from: exampleURL),
              let source = String(data: bundle, encoding: .utf8),
              let exampleText = String(data: example, encoding: .utf8),
              let measured = try? Timing.measure(bundleSource: source, exampleText: exampleText)
        else {
            return
        }
        session = measured.1
        let pid = ProcessInfo.processInfo.processIdentifier
        print(LaunchLog.line(count: count, pid: pid, sample: measured.0))
    }

    private func reloadStored() {
        guard let stored = store.activeTerms(), let text = String(data: stored.bytes, encoding: .utf8) else { return }
        guard let session else {
            active = ActiveDocument(name: stored.name, importedAt: stored.importedAt)
            failure = .core
            return
        }
        do {
            let loaded = try ScreenDecode.load(try session.screenJSON(text: text, file: stored.name))
            switch loaded {
            case .invalid(let diagnostics):
                active = ActiveDocument(name: stored.name, importedAt: stored.importedAt)
                failure = .invalid(diagnostics)
            case .valid(let summary, let schedule):
                active = ActiveDocument(name: stored.name, importedAt: stored.importedAt, summary: summary, schedule: schedule)
                failure = nil
            }
        } catch {
            active = ActiveDocument(name: stored.name, importedAt: stored.importedAt)
            failure = .core
        }
    }

    private func importURL(_ url: URL) {
        guard url.isFileURL else {
            show(.read)
            return
        }
        let started = url.startAccessingSecurityScopedResource()
        defer {
            if started { url.stopAccessingSecurityScopedResource() }
        }
        do {
            let bytes = try ByteRead.data(from: url)
            accept(bytes: bytes, name: url.lastPathComponent)
        } catch {
            show(.read)
        }
    }

    private func accept(bytes: Data, name: String) {
        guard let text = String(data: bytes, encoding: .utf8) else {
            show(.utf8)
            return
        }
        guard let session else {
            show(.core)
            return
        }
        let loaded: EngineLoad
        do {
            loaded = try ScreenDecode.load(try session.screenJSON(text: text, file: name))
        } catch {
            show(.core)
            return
        }
        switch loaded {
        case .invalid(let diagnostics):
            show(.invalid(diagnostics))
        case .valid(let summary, let schedule):
            let importedAt = ISO8601DateFormatter().string(from: Date())
            switch store.importFile(bytes: bytes, name: name, importedAt: importedAt) {
            case .failed:
                show(.store)
            case .stored(let seal):
                active = ActiveDocument(name: name, importedAt: importedAt, summary: summary, schedule: schedule)
                failure = nil
                refresh()
                VerificationLog.record(bytes: bytes, seal: seal)
            }
        }
    }

    private func show(_ kind: FailureKind) {
        failure = kind
        refresh()
        if let stored = store.activeTerms() {
            VerificationLog.record(bytes: stored.bytes, seal: stored.seal)
        }
    }

    private func refresh() {
        rows = ScreenRender.rows(model: ScreenModel(active: active, failure: failure), copy: copy)
    }

    private static func folder() -> URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
        let folder = base.appendingPathComponent("keel", isDirectory: true)
        try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        return folder
    }
}
