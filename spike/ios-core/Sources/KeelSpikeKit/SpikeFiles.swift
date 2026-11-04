import CryptoKit
import Foundation

public struct FixtureFile: Equatable {
    public let file: String
    public let text: String

    public init(file: String, text: String) {
        self.file = file
        self.text = text
    }
}

public struct SpikeFiles {
    public let compile: String
    public let standalone: String
    public let fixtures: [FixtureFile]
    public let disclaimer: String
    public let example: String

    public init(compile: String, standalone: String, fixtures: [FixtureFile], disclaimer: String) throws {
        self.compile = compile
        self.standalone = standalone
        self.fixtures = fixtures
        self.disclaimer = disclaimer
        guard let example = fixtures.first(where: { $0.file.hasSuffix("/example-autocall.yaml") }) else {
            throw SpikeFileError.missingExample
        }
        self.example = example.text
    }

    public func source(variant: String) throws -> String {
        switch variant {
        case "compile": return compile
        case "standalone": return standalone
        default: throw SpikeFileError.unknownVariant
        }
    }

    public static func fromRepo(root: URL) throws -> SpikeFiles {
        let dist = root.appending(path: "spike/ios-core/dist")
        let compile = try String(contentsOf: dist.appending(path: "compile.js"), encoding: .utf8)
        let standalone = try String(contentsOf: dist.appending(path: "standalone.js"), encoding: .utf8)
        let terms = root.appending(path: "fixtures/synthetic/terms")
        let fixtures = try loadFixtures(terms: terms, prefix: "fixtures/synthetic/terms")
        let disclaimer = try String(contentsOf: root.appending(path: "DISCLAIMER.md"), encoding: .utf8)
        return try SpikeFiles(compile: compile, standalone: standalone, fixtures: fixtures, disclaimer: disclaimer)
    }

    public static func from(bundle: Bundle) throws -> SpikeFiles {
        func text(_ name: String, _ ext: String) throws -> String {
            guard let url = bundle.url(forResource: name, withExtension: ext) else { throw SpikeFileError.missingResource }
            return try String(contentsOf: url, encoding: .utf8)
        }
        let compile = try text("compile", "js")
        let standalone = try text("standalone", "js")
        guard let terms = bundle.url(forResource: "terms", withExtension: nil) else { throw SpikeFileError.missingResource }
        let fixtures = try loadFixtures(terms: terms, prefix: "fixtures/synthetic/terms")
        let disclaimer = try text("DISCLAIMER", "md")
        return try SpikeFiles(compile: compile, standalone: standalone, fixtures: fixtures, disclaimer: disclaimer)
    }

    public static func repoRoot(from file: String = #filePath) -> URL? {
        var url = URL(fileURLWithPath: file).deletingLastPathComponent()
        let manager = FileManager.default
        for _ in 0 ..< 8 {
            if manager.fileExists(atPath: url.appending(path: "fixtures/synthetic/terms").path) {
                return url
            }
            url.deleteLastPathComponent()
        }
        return nil
    }
}

public enum SpikeFileError: Error {
    case missingExample
    case unknownVariant
    case missingResource
}

func loadFixtures(terms: URL, prefix: String) throws -> [FixtureFile] {
    let manager = FileManager.default
    var found: [FixtureFile] = []
    let folders = ["valid", "invalid"]
    for folder in folders {
        let dir = terms.appendingPathComponent(folder, isDirectory: true)
        let names = try manager.contentsOfDirectory(atPath: dir.path)
        for name in names where name.hasSuffix(".yaml") {
            let url = dir.appendingPathComponent(name)
            let text = try String(contentsOf: url, encoding: .utf8)
            found.append(FixtureFile(file: "\(prefix)/\(folder)/\(name)", text: text))
        }
    }
    found.sort { $0.file < $1.file }
    return found
}

public func sha256Hex(_ text: String) -> String {
    SHA256.hash(data: Data(text.utf8)).map { String(format: "%02x", $0) }.joined()
}

public func formatMilliseconds(_ value: Double) -> String {
    String(format: "%.3f", locale: Locale(identifier: "en_US_POSIX"), value)
}

public func parityRecord(variant: String, locale: String, comparator: String, file: String, jsonLine: String) -> String {
    "KEEL_SPIKE v1 parity variant=\(variant) locale=\(locale) comparator=\(comparator) file=\(file) sha256=\(sha256Hex(jsonLine))"
}

public func median(_ values: [Double]) -> Double {
    let sorted = values.sorted()
    guard !sorted.isEmpty else { return .nan }
    return sorted[sorted.count / 2]
}

public func worst(_ values: [Double]) -> Double {
    values.max() ?? .nan
}
