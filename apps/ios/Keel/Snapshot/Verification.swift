import Foundation
import KeelCoreHost

enum VerificationLog {
    static let hashes: Set<String> = [
        "200ba5951b9a09853cbe6ff8e7c879d29bc8b7870ee377c30c6ebe7fd1ee5665",
        "6215ee32b0fb9c3fc262bac8bdcd8b17050a4df5b47690d35ad79997b370c302",
        "57429d2148ace259202ced2324a84c48843dc87126f26f83d3f491e8ae62d99b",
    ]

    static func record(bytes: Data, seal: FileSeal) {
        #if VERIFICATION
        if let line = DigestLog.line(bytes: bytes, seal: seal, allowed: hashes, configuration: .verification) {
            print(line)
        }
        #endif
    }
}
