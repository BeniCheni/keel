import XCTest
import KeelSpikeKit

final class BundleLoadTests: XCTestCase {
    func testBundlesLoadAndExportFunctions() throws {
        let root = try XCTUnwrap(SpikeFiles.repoRoot())
        let files = try SpikeFiles.fromRepo(root: root)
        for variant in ["compile", "standalone"] {
            let session = try CoreSession(bundleSource: try files.source(variant: variant))
            XCTAssertEqual(session.shims, [], "shims \(variant)")
            print("globals variant=\(variant) \(session.globals.descriptionLine) shims=0")
            XCTAssertEqual(session.globals.fetch, "undefined")
            XCTAssertEqual(session.globals.xmlHttpRequest, "undefined")
            XCTAssertEqual(session.globals.webSocket, "undefined")
            let kinds = try session.kinds()
            XCTAssertEqual(kinds["dateFlags"], "function")
            XCTAssertEqual(kinds["loadTerms"], "function")
            XCTAssertEqual(kinds["verificationSummary"], "function")
            let line = try session.line(
                text: files.example,
                file: "fixtures/synthetic/terms/valid/example-autocall.yaml"
            )
            XCTAssertTrue(line.contains("\"ok\":true"))
            let invalid = try XCTUnwrap(files.fixtures.first { $0.file.contains("/invalid/") })
            let rejected = try session.line(text: invalid.text, file: invalid.file)
            XCTAssertTrue(rejected.contains("\"ok\":false"))
            let reversed = try CoreSession(bundleSource: try files.source(variant: variant), reversedComparator: true)
            XCTAssertEqual(reversed.shims, [], "reversed shims \(variant)")
            let reversedLine = try reversed.line(
                text: files.example,
                file: "fixtures/synthetic/terms/valid/example-autocall.yaml"
            )
            XCTAssertTrue(reversedLine.contains("\"ok\":true"))
        }
    }
}
