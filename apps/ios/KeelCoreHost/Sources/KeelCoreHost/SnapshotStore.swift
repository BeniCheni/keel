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
    func readSeal(_ url: URL, step: StorageStep) throws -> FileSeal
    func replace(temporary: URL, active: URL, step: StorageStep) throws
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

    public init(folder: URL, files: SnapshotFiling) {
        self.folder = folder
        self.files = files
        incoming = folder.appendingPathComponent("incoming")
        active = folder.appendingPathComponent("active")
        record = folder.appendingPathComponent("record.json")
    }

    public func activeTerms() -> StoredTerms? {
        guard files.exists(active), files.exists(record) else { return nil }
        guard let bytes = try? files.read(active), let recordBytes = try? files.read(record) else { return nil }
        guard let object = try? JSONSerialization.jsonObject(with: recordBytes) as? [String: Any] else { return nil }
        guard let name = object["name"] as? String, let importedAt = object["importedAt"] as? String else { return nil }
        let seal = (try? files.readSeal(active, step: .readActive)) ?? FileSeal(protection: "missing", excludedFromBackup: false)
        return StoredTerms(bytes: bytes, name: name, importedAt: importedAt, seal: seal)
    }

    public func importFile(bytes: Data, name: String, importedAt: String) -> StoreOutcome {
        let previousBytes = files.exists(active) ? try? files.read(active) : nil
        let previousRecord = files.exists(record) ? try? files.read(record) : nil
        do {
            try files.write(bytes, to: incoming, step: .writeTemporary)
            try files.protect(incoming, step: .protectTemporary)
            try files.exclude(incoming, step: .excludeTemporary)
            let temporarySeal = try files.readSeal(incoming, step: .readTemporary)
            guard temporarySeal.isExact else { throw StoreError.seal }
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
            if files.exists(incoming) { try? files.remove(incoming) }
            return .stored(activeSeal)
        } catch {
            restore(previousBytes: previousBytes, previousRecord: previousRecord)
            return .failed
        }
    }

    private func restore(previousBytes: Data?, previousRecord: Data?) {
        if files.exists(incoming) { try? files.remove(incoming) }
        if let previousBytes {
            try? files.write(previousBytes, to: active, step: nil)
        } else if files.exists(active) {
            try? files.remove(active)
        }
        if let previousRecord {
            try? files.write(previousRecord, to: record, step: nil)
        } else if files.exists(record) {
            try? files.remove(record)
        }
    }
}

private enum StoreError: Error {
    case seal
}
