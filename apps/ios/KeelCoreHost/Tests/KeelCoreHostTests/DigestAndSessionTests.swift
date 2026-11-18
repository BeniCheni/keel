import XCTest
import KeelCoreHost

final class DigestAndSessionTests: XCTestCase {
    func testDigestGateLogsTheThreeFixturesAndNoOtherBytes() throws {
        let root = Repo.root()
        let names = [
            "fixtures/synthetic/terms/valid/minimal.yaml",
            "fixtures/synthetic/terms/valid/example-autocall.yaml",
            "fixtures/synthetic/terms/invalid/missing-required-top.yaml",
        ]
        var allowed = Set<String>()
        var fixtures: [Data] = []
        for name in names {
            let bytes = try ByteRead.data(from: root.appendingPathComponent(name))
            fixtures.append(bytes)
            allowed.insert(DigestLog.sha256Hex(bytes))
        }
        let seal = FileSeal(protection: "complete", excludedFromBackup: true)
        for bytes in fixtures {
            let line = DigestLog.line(bytes: bytes, seal: seal, allowed: allowed, configuration: .verification)
            XCTAssertTrue(line?.contains("sha256=\(DigestLog.sha256Hex(bytes))") == true)
            XCTAssertTrue(line?.contains("protection=complete") == true)
            XCTAssertTrue(line?.contains("backupExcluded=true") == true)
        }
        var other = fixtures[0]
        other += Data([0x23, 0x0A])
        let quiet = DigestLog.line(bytes: other, seal: seal, allowed: allowed, configuration: .verification)
        XCTAssertEqual(quiet, "KEEL v1 import fixture=no")
        XCTAssertFalse(quiet?.contains("sha256=") == true)
        XCTAssertNil(DigestLog.line(bytes: fixtures[0], seal: seal, allowed: allowed, configuration: .other))
    }

    func testVerificationSourceLogsOnlyInsideThatConfiguration() throws {
        let root = Repo.root()
        let source = String(decoding: try ByteRead.data(from: root.appendingPathComponent("apps/ios/Keel/Snapshot/Verification.swift")), as: UTF8.self)
        guard let start = source.range(of: "#if VERIFICATION"), let end = source.range(of: "#endif") else {
            return XCTFail("verification gate")
        }
        let gated = source[start.lowerBound..<end.upperBound]
        XCTAssertTrue(gated.contains("DigestLog.line"))
        let outside = source.replacingOccurrences(of: String(gated), with: "")
        XCTAssertFalse(outside.contains("DigestLog.line"))
        let hashes = [
            "200ba5951b9a09853cbe6ff8e7c879d29bc8b7870ee377c30c6ebe7fd1ee5665",
            "6215ee32b0fb9c3fc262bac8bdcd8b17050a4df5b47690d35ad79997b370c302",
            "57429d2148ace259202ced2324a84c48843dc87126f26f83d3f491e8ae62d99b",
        ]
        for hash in hashes {
            let bytes = try ByteRead.data(from: root.appendingPathComponent(hash == hashes[0]
                ? "fixtures/synthetic/terms/valid/minimal.yaml"
                : hash == hashes[1]
                    ? "fixtures/synthetic/terms/valid/example-autocall.yaml"
                    : "fixtures/synthetic/terms/invalid/missing-required-top.yaml"))
            XCTAssertEqual(DigestLog.sha256Hex(bytes), hash)
            XCTAssertTrue(source.contains(hash))
        }
    }

    func testContextHasNoFetchXMLHttpRequestOrWebSocket() throws {
        let bundle = try ByteRead.data(from: Repo.root().appendingPathComponent("apps/ios/Keel/Resources/core.js"))
        let source = try XCTUnwrap(String(data: bundle, encoding: .utf8))
        let session = try CoreSession(bundleSource: source)
        XCTAssertEqual(session.globals.fetch, "undefined")
        XCTAssertEqual(session.globals.xmlHttpRequest, "undefined")
        XCTAssertEqual(session.globals.webSocket, "undefined")
        XCTAssertEqual(session.shims, [])
    }

    func testTimingMeasureReturnsBothClocks() throws {
        let root = Repo.root()
        let bundle = try ByteRead.data(from: root.appendingPathComponent("apps/ios/Keel/Resources/core.js"))
        let example = try ByteRead.data(from: root.appendingPathComponent("fixtures/synthetic/terms/valid/example-autocall.yaml"))
        let source = try XCTUnwrap(String(data: bundle, encoding: .utf8))
        let text = try XCTUnwrap(String(data: example, encoding: .utf8))
        let measured = try Timing.measure(bundleSource: source, exampleText: text)
        XCTAssertGreaterThan(measured.0.contextMs, 0)
        XCTAssertGreaterThan(measured.0.loadTermsMs, 0)
        let line = LaunchLog.line(count: 3, pid: 99, sample: measured.0)
        XCTAssertTrue(line.hasPrefix("KEEL v1 launch=3 pid=99 contextMs="))
        XCTAssertTrue(line.contains("loadTermsMs="))
    }
}
