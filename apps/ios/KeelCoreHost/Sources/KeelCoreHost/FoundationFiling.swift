import Foundation

public final class FoundationFiling: SnapshotFiling {
    public init() {}

    public func write(_ data: Data, to url: URL, step: StorageStep?) throws {
        try data.write(to: url, options: .atomic)
    }

    public func protect(_ url: URL, step: StorageStep) throws {
        let item = url as NSURL
        try item.setResourceValue(URLFileProtection.complete, forKey: .fileProtectionKey)
    }

    public func exclude(_ url: URL, step: StorageStep) throws {
        var target = url
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try target.setResourceValues(values)
    }

    public func readSeal(_ url: URL, step: StorageStep?) throws -> FileSeal {
        // Foundation caches resource values on a URL after it has been queried.
        let fresh = URL(fileURLWithPath: url.path)
        let values = try fresh.resourceValues(forKeys: [.fileProtectionKey, .isExcludedFromBackupKey])
        let protection = values.fileProtection == .complete ? "complete" : (values.fileProtection?.rawValue ?? "missing")
        return FileSeal(protection: protection, excludedFromBackup: values.isExcludedFromBackup ?? false)
    }

    public func replace(temporary: URL, active: URL, step: StorageStep) throws {
        if FileManager.default.fileExists(atPath: active.path) {
            _ = try FileManager.default.replaceItemAt(active, withItemAt: temporary, options: .usingNewMetadataOnly)
        } else {
            try FileManager.default.moveItem(at: temporary, to: active)
        }
    }

    public func createDirectory(_ url: URL) throws {
        try FileManager.default.createDirectory(at: url, withIntermediateDirectories: false)
    }

    public func copy(_ source: URL, to destination: URL) throws {
        try FileManager.default.copyItem(at: source, to: destination)
    }

    public func move(_ source: URL, to destination: URL) throws {
        try FileManager.default.moveItem(at: source, to: destination)
    }

    public func remove(_ url: URL) throws {
        if FileManager.default.fileExists(atPath: url.path) {
            try FileManager.default.removeItem(at: url)
        }
    }

    public func read(_ url: URL) throws -> Data {
        try ByteRead.data(from: url)
    }

    public func exists(_ url: URL) -> Bool {
        FileManager.default.fileExists(atPath: url.path)
    }
}
