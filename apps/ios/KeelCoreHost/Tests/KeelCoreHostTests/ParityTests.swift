import Foundation
import XCTest
import KeelCoreHost

final class ParityTests: XCTestCase {
    func testJavaScriptCoreMatchesTheNodeOracle() throws {
        let root = Repo.root()
        let inputs = try parityInputs(root: root)
        let nodeEN = try nodeLines(root: root, inputs: inputs, locale: "en_US.UTF-8")
        let nodeSV = try nodeLines(root: root, inputs: inputs, locale: "sv_SE.UTF-8")
        XCTAssertTrue(nodeEN.locale.hasPrefix("en"), nodeEN.locale)
        XCTAssertTrue(nodeSV.locale.hasPrefix("sv"), nodeSV.locale)
        XCTAssertNotEqual(nodeEN.locale, nodeSV.locale)
        let host = try hostBinary()
        let bundle = root.appendingPathComponent("apps/ios/Keel/Resources/core.js")
        let jscEN = try hostLines(host: host, bundle: bundle, inputs: inputs, language: "en-US", region: "en_US", reversed: false)
        let jscSV = try hostLines(host: host, bundle: bundle, inputs: inputs, language: "sv", region: "sv_SE", reversed: false)
        XCTAssertTrue(jscEN.locale.hasPrefix("en"), jscEN.locale)
        XCTAssertTrue(jscSV.locale.hasPrefix("sv"), jscSV.locale)
        XCTAssertNotEqual(jscEN.locale, jscSV.locale)
        XCTAssertTrue(parityMatches(oracle: nodeEN.payload, engine: jscEN.payload), firstDifference(nodeEN.payload, jscEN.payload))
        XCTAssertTrue(parityMatches(oracle: nodeEN.payload, engine: jscSV.payload), firstDifference(nodeEN.payload, jscSV.payload))
        XCTAssertTrue(parityMatches(oracle: nodeEN.payload, engine: nodeSV.payload), firstDifference(nodeEN.payload, nodeSV.payload))
        let reversed = try hostLines(host: host, bundle: bundle, inputs: inputs, language: "en-US", region: "en_US", reversed: true)
        XCTAssertTrue(reversed.locale.hasPrefix("en"), reversed.locale)
        XCTAssertTrue(parityMatches(oracle: nodeEN.payload, engine: reversed.payload), firstDifference(nodeEN.payload, reversed.payload))
        XCTAssertGreaterThan(nodeEN.payload.count, 40)
        var planted = nodeEN.payload
        let index = planted.index(planted.startIndex, offsetBy: 40)
        planted[index] = planted[index] == 0x61 ? 0x62 : 0x61
        XCTAssertEqual(planted.count, nodeEN.payload.count)
        XCTAssertFalse(parityMatches(oracle: planted, engine: jscEN.payload))
    }

    func testParityComparesBytesNotCanonicallyEquivalentText() {
        let composed = "\u{00E9}"
        let decomposed = "e\u{0301}"
        XCTAssertEqual(composed, decomposed)
        XCTAssertNotEqual(Data(composed.utf8), Data(decomposed.utf8))
        XCTAssertFalse(parityMatches(oracle: Data(composed.utf8), engine: Data(decomposed.utf8)))
        XCTAssertTrue(parityMatches(oracle: Data(composed.utf8), engine: Data(composed.utf8)))
    }

    func testLocaleCompareScratchBundleDiffersOnTieInput() throws {
        let root = Repo.root()
        let minimal = String(decoding: try ByteRead.data(from: root.appendingPathComponent("fixtures/synthetic/terms/valid/minimal.yaml")), as: UTF8.self)
        let tie = try TieInput.text(from: minimal)
        let inputs = [["file": TieInput.file, "text": tie]]
        let node = try nodeLines(root: root, inputs: inputs, locale: "en_US.UTF-8")
        let scratch = FileManager.default.temporaryDirectory.appendingPathComponent("keel-localecompare-\(UUID().uuidString).js")
        let build = Process()
        build.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        build.arguments = ["node", "apps/ios/bundle/build.mjs"]
        build.currentDirectoryURL = root
        var env = ProcessInfo.processInfo.environment
        env["KEEL_IOS_DEDUPE"] = "localeCompare"
        env["KEEL_IOS_BUNDLE_OUT"] = scratch.path
        build.environment = env
        let pipe = Pipe()
        build.standardOutput = pipe
        build.standardError = pipe
        try build.run()
        build.waitUntilExit()
        XCTAssertEqual(build.terminationStatus, 0)
        let built = String(decoding: try ByteRead.data(from: scratch), as: UTF8.self)
        XCTAssertTrue(built.contains("localeCompare"))
        let host = try hostLines(host: try hostBinary(), bundle: scratch, inputs: inputs, language: "en-US", region: "en_US", reversed: true)
        XCTAssertNotEqual(host.payload, node.payload)
        XCTAssertTrue(String(decoding: host.payload, as: UTF8.self).contains(TieInput.file))
    }

    /// Byte for byte. Swift compares String values by canonical equivalence, so text is never compared here.
    private func parityMatches(oracle: Data, engine: Data) -> Bool {
        oracle == engine
    }

    private func firstDifference(_ oracle: Data, _ engine: Data) -> String {
        let left = oracle.split(separator: 0x0A, omittingEmptySubsequences: false)
        let right = engine.split(separator: 0x0A, omittingEmptySubsequences: false)
        for index in 0..<max(left.count, right.count) {
            let a = index < left.count ? Data(left[index]) : Data()
            let b = index < right.count ? Data(right[index]) : Data()
            if a != b {
                return "line \(index + 1): oracle \(String(decoding: a.prefix(200), as: UTF8.self)) engine \(String(decoding: b.prefix(200), as: UTF8.self))"
            }
        }
        return "no difference"
    }
}

private struct EngineLines {
    var locale: String
    var payload: Data
}

private func parityInputs(root: URL) throws -> [[String: String]] {
    var inputs: [[String: String]] = []
    let terms = root.appendingPathComponent("fixtures/synthetic/terms")
    var files: [URL] = []
    let enumerator = FileManager.default.enumerator(at: terms, includingPropertiesForKeys: nil)
    while let url = enumerator?.nextObject() as? URL {
        if url.pathExtension == "yaml" || url.pathExtension == "yml" { files.append(url) }
    }
    files.sort { $0.path < $1.path }
    XCTAssertEqual(files.count, 33)
    for url in files {
        let text = String(decoding: try ByteRead.data(from: url), as: UTF8.self)
        let file = url.path.replacingOccurrences(of: root.path + "/", with: "")
        inputs.append(["file": file, "text": text])
    }
    let minimal = String(decoding: try ByteRead.data(from: root.appendingPathComponent("fixtures/synthetic/terms/valid/minimal.yaml")), as: UTF8.self)
    inputs.append(["file": TieInput.file, "text": try TieInput.text(from: minimal)])
    inputs.append(["file": "memory/listed.yaml", "text": listed(minimal)])
    let cases = [
        ("memory/weekend-2026-07-04.yaml", "2026-07-04", "2026-07-04"),
        ("memory/holiday-2026-11-26.yaml", "2026-11-26", "2026-11-26"),
        ("memory/holiday-2026-07-03.yaml", "2026-07-03", "2026-07-03"),
        ("memory/holiday-2027-07-05.yaml", "2027-07-05", "2027-07-05"),
        ("memory/weekend-2028-01-01.yaml", "2028-01-01", "2028-01-01"),
        ("memory/outside-2025-12-25.yaml", "2025-12-25", "2025-12-25"),
        ("memory/outside-2025-12-27.yaml", "2025-12-27", "2025-12-27"),
        ("memory/outside-2061-01-03.yaml", "2061-01-03", "2061-01-03"),
    ]
    for item in cases {
        inputs.append(["file": item.0, "text": dated(minimal, first: item.1, maturity: item.2)])
    }
    return inputs
}

func listed(_ minimal: String) -> String {
    minimal.replacingOccurrences(
        of: "underlyings:\n",
        with: """
          observation_schedule:
            - value: 2026-09-01
              status: primary
              source: supplement
            - value: null
              status: unknown
            - status: conflict
              candidates:
                - value: 2027-06-01
                  status: primary
                  source: supplement
                - value: 2027-06-02
                  status: primary
                  source: supplement
        underlyings:

        """
    )
}

func dated(_ minimal: String, first: String, maturity: String) -> String {
    minimal
        .replacingOccurrences(of: "value: 2026-09-01\n    status: primary\n    source: supplement\nunderlyings:", with: "value: \(first)\n    status: primary\n    source: supplement\nunderlyings:")
        .replacingOccurrences(of: "value: 2031-03-03\n    status: primary\n    source: supplement\n  first_call_observation:", with: "value: \(maturity)\n    status: primary\n    source: supplement\n  first_call_observation:")
        .replacingOccurrences(of: "value: \"quarterly\"", with: "value: \"monthly\"")
}

private func nodeLines(root: URL, inputs: [[String: String]], locale: String) throws -> EngineLines {
    let file = FileManager.default.temporaryDirectory.appendingPathComponent("keel-inputs-\(UUID().uuidString).json")
    try JSONSerialization.data(withJSONObject: inputs).write(to: file)
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
    process.arguments = ["node", "apps/ios/bundle/oracle.mjs", root.path, file.path]
    process.currentDirectoryURL = root
    var env = ProcessInfo.processInfo.environment
    env["LC_ALL"] = locale
    env["LANG"] = locale
    process.environment = env
    return try collected(process)
}

private func hostLines(host: URL, bundle: URL, inputs: [[String: String]], language: String, region: String, reversed: Bool) throws -> EngineLines {
    let file = FileManager.default.temporaryDirectory.appendingPathComponent("keel-inputs-\(UUID().uuidString).json")
    try JSONSerialization.data(withJSONObject: inputs).write(to: file)
    let process = Process()
    process.executableURL = host
    var arguments = ["-AppleLanguages", "(\(language))", "-AppleLocale", region, "parity", "--bundle", bundle.path, "--inputs", file.path]
    if reversed { arguments.append("--reversed") }
    process.arguments = arguments
    return try collected(process)
}

private func collected(_ process: Process) throws -> EngineLines {
    let out = Pipe()
    let err = Pipe()
    process.standardOutput = out
    process.standardError = err
    try process.run()
    let stdout = out.fileHandleForReading.readDataToEndOfFile()
    let stderr = err.fileHandleForReading.readDataToEndOfFile()
    process.waitUntilExit()
    XCTAssertEqual(process.terminationStatus, 0, String(decoding: stderr, as: UTF8.self))
    guard let newline = stdout.firstIndex(of: 0x0A) else {
        XCTFail(String(decoding: stdout, as: UTF8.self))
        return EngineLines(locale: "", payload: stdout)
    }
    let header = String(decoding: stdout[stdout.startIndex..<newline], as: UTF8.self)
    guard header.hasPrefix("KEEL v1 locale=") else {
        XCTFail(String(decoding: stdout, as: UTF8.self))
        return EngineLines(locale: "", payload: stdout)
    }
    let locale = String(header.dropFirst("KEEL v1 locale=".count))
    return EngineLines(locale: locale, payload: Data(stdout[stdout.index(after: newline)...]))
}

private func hostBinary() throws -> URL {
    let build = Repo.root().appendingPathComponent("apps/ios/KeelCoreHost/.build")
    guard let enumerator = FileManager.default.enumerator(at: build, includingPropertiesForKeys: [.isExecutableKey]) else {
        throw TestError.missing
    }
    for case let url as URL in enumerator {
        if url.lastPathComponent == "keel-ios-host", !url.path.contains(".dSYM") {
            let executable = try url.resourceValues(forKeys: [.isExecutableKey]).isExecutable
            if executable == true { return url }
        }
    }
    throw TestError.missing
}
