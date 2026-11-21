import CryptoKit
import Foundation

public enum AppConfiguration: Equatable {
    case verification
    case other
}

public struct FileSeal: Equatable {
    public var protection: String
    public var excludedFromBackup: Bool

    public init(protection: String, excludedFromBackup: Bool) {
        self.protection = protection
        self.excludedFromBackup = excludedFromBackup
    }

    public var isExact: Bool {
        protection == "complete" && excludedFromBackup
    }
}

public enum DigestLog {
    public static func sha256Hex(_ data: Data) -> String {
        SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }

    public static func line(bytes: Data, seal: FileSeal, allowed: Set<String>, configuration: AppConfiguration) -> String? {
        guard configuration == .verification else { return nil }
        let digest = sha256Hex(bytes)
        if allowed.contains(digest) {
            return "KEEL v1 import sha256=\(digest) protection=\(seal.protection) backupExcluded=\(seal.excludedFromBackup)"
        }
        return "KEEL v1 import fixture=no"
    }
}
