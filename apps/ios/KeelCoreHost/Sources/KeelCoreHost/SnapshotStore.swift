import Foundation

public enum StorageStep: String, CaseIterable {
    case writeTemporary
    case protectTemporary
    case excludeTemporary
    case readTemporary
    case replaceActive
    case protectActive
    case excludeActive
    case readActive
    case writeRecord
    case protectRecord
    case excludeRecord
    case readRecord
}

public protocol SnapshotFiling {
    func write(_ data: Data, to url: URL, step: StorageStep?) throws
    func protect(_ url: URL, step: StorageStep) throws
    func exclude(_ url: URL, step: StorageStep) throws
    func readSeal(_ url: URL, step: StorageStep?) throws -> FileSeal
    func replace(temporary: URL, active: URL, step: StorageStep) throws
    func createDirectory(_ url: URL) throws
    func copy(_ source: URL, to destination: URL) throws
    func move(_ source: URL, to destination: URL) throws
    func remove(_ url: URL) throws
    func read(_ url: URL) throws -> Data
    func exists(_ url: URL) -> Bool
}

public struct StoredTerms: Equatable {
    public var bytes: Data
    public var name: String
    public var importedAt: String
    public var seal: FileSeal
}

public enum StoreOutcome: Equatable {
    case stored(FileSeal)
    case failed
}

public final class SnapshotStore {
    public let folder: URL
    private let files: SnapshotFiling
    private let incoming: URL
    private let active: URL
    private let record: URL
    private let staging: URL
    private let rollback: URL
    private let retired: URL

    public init(folder: URL, files: SnapshotFiling) {
        self.folder = folder
        self.files = files
        incoming = folder.appendingPathComponent("incoming")
        active = folder.appendingPathComponent("active")
        record = folder.appendingPathComponent("record.json")
        staging = folder.appendingPathComponent("staging", isDirectory: true)
        rollback = folder.appendingPathComponent("rollback", isDirectory: true)
        retired = folder.appendingPathComponent("retired", isDirectory: true)
    }

    public func activeTerms() -> StoredTerms? {
        try? files.remove(retired)
        if files.exists(rollback) {
            recoverPrevious()
            guard !files.exists(rollback) else { return nil }
        }
        cleanTemporaryFiles()
        return keepSealedTerms()
    }

    public func importFile(bytes: Data, name: String, importedAt: String) -> StoreOutcome {
        _ = activeTerms()
        guard !files.exists(rollback) else { return .failed }
        // A sealed pair can survive the opening read even if its contents are unavailable.
        let hadPrevious = files.exists(active) && files.exists(record)
        // An orphan record must be removed before a fresh import can replace active.
        guard hadPrevious || !files.exists(record) else { return .failed }
        do {
            try files.write(bytes, to: incoming, step: .writeTemporary)
            try files.protect(incoming, step: .protectTemporary)
            try files.exclude(incoming, step: .excludeTemporary)
            let temporarySeal = try files.readSeal(incoming, step: .readTemporary)
            guard temporarySeal.isExact else { throw StoreError.seal }
            if hadPrevious { try preservePrevious() }
            try files.replace(temporary: incoming, active: active, step: .replaceActive)
            try files.protect(active, step: .protectActive)
            try files.exclude(active, step: .excludeActive)
            let activeSeal = try files.readSeal(active, step: .readActive)
            guard activeSeal.isExact else { throw StoreError.seal }
            let body: [String: String] = ["importedAt": importedAt, "name": name]
            let recordBytes = try JSONSerialization.data(withJSONObject: body, options: [.sortedKeys])
            try files.write(recordBytes, to: record, step: .writeRecord)
            try files.protect(record, step: .protectRecord)
            try files.exclude(record, step: .excludeRecord)
            let recordSeal = try files.readSeal(record, step: .readRecord)
            guard recordSeal.isExact else { throw StoreError.seal }
            // Retiring the rollback directory is the commit point for both files.
            if hadPrevious { try files.move(rollback, to: retired) }
            cleanTemporaryFiles()
            return .stored(activeSeal)
        } catch {
            if files.exists(rollback) {
                recoverPrevious()
                guard !files.exists(rollback) else { return .failed }
            } else if !hadPrevious {
                removeActivePair()
            }
            _ = keepSealedTerms()
            cleanTemporaryFiles()
            return .failed
        }
    }

    private func preservePrevious() throws {
        try files.createDirectory(staging)
        let savedActive = staging.appendingPathComponent("active")
        let savedRecord = staging.appendingPathComponent("record.json")
        try files.copy(active, to: savedActive)
        try files.copy(record, to: savedRecord)
        guard readPairSeal(savedActive, savedRecord) != nil else { throw StoreError.seal }
        // A relaunch sees the rollback directory only after both copies are sealed.
        try files.move(staging, to: rollback)
    }

    private func recoverPrevious() {
        let savedActive = rollback.appendingPathComponent("active")
        let savedRecord = rollback.appendingPathComponent("record.json")
        do {
            // If replacement failed without consuming incoming, the original pair
            // can stay in place provided its bytes and record are still unchanged.
            if try !originalsInPlace(savedActive, savedRecord) {
                try restore(savedActive, to: active)
                try restore(savedRecord, to: record)
            }
            if activePairSeal() == nil {
                try files.remove(record)
                try files.remove(active)
            }
            try files.move(rollback, to: retired)
        } catch {
            // The remaining rollback copies and restored files record where to resume.
        }
    }

    private func originalsInPlace(_ savedActive: URL, _ savedRecord: URL) throws -> Bool {
        guard files.exists(incoming), files.exists(savedActive), files.exists(savedRecord),
              files.exists(active), files.exists(record) else { return false }
        return try files.read(active) == files.read(savedActive) && files.read(record) == files.read(savedRecord)
    }

    private func restore(_ saved: URL, to destination: URL) throws {
        // An absent copy was already renamed during an interrupted rollback.
        guard files.exists(saved) else { return }
        try files.remove(destination)
        try files.move(saved, to: destination)
    }

    private func readPairSeal(_ bytes: URL, _ metadata: URL) -> FileSeal? {
        let activeSeal = try? files.readSeal(bytes, step: nil)
        let recordSeal = try? files.readSeal(metadata, step: nil)
        guard activeSeal?.isExact == true, recordSeal?.isExact == true else { return nil }
        return activeSeal
    }

    private func activePairSeal() -> FileSeal? {
        guard files.exists(active), files.exists(record) else { return nil }
        return readPairSeal(active, record)
    }

    private func keepSealedTerms() -> StoredTerms? {
        guard let seal = activePairSeal() else {
            removeActivePair()
            return nil
        }
        // An exactly sealed file can be unreadable while the device is locked.
        guard let bytes = try? files.read(active), let recordBytes = try? files.read(record),
              let object = try? JSONSerialization.jsonObject(with: recordBytes) as? [String: Any],
              let name = object["name"] as? String, let importedAt = object["importedAt"] as? String else {
            return nil
        }
        return StoredTerms(bytes: bytes, name: name, importedAt: importedAt, seal: seal)
    }

    private func removeActivePair() {
        try? files.remove(record)
        try? files.remove(active)
    }

    private func cleanTemporaryFiles() {
        try? files.remove(incoming)
        try? files.remove(staging)
        try? files.remove(retired)
    }
}

private enum StoreError: Error {
    case seal
}
