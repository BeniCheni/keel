import Foundation
import XCTest
import KeelCoreHost

/// The screen's rows from the committed bundle: the core's JSON, through the decoder, through the render model.
/// The expected rows are read from the same JSON the parity test compares with Node, never from the decoder.
final class ScreenFromCoreTests: XCTestCase {
    private let copy = sampleCopy()

    func testEveryValueTheCoreReturnsReachesTheScreen() throws {
        let root = Repo.root()
        let session = try CoreSession(bundleSource: try text(root, "apps/ios/Keel/Resources/core.js"))
        let minimal = try text(root, "fixtures/synthetic/terms/valid/minimal.yaml")
        let inputs: [(file: String, text: String)] = [
            ("minimal.yaml", minimal),
            ("example-autocall.yaml", try text(root, "fixtures/synthetic/terms/valid/example-autocall.yaml")),
            ("missing-required-top.yaml", try text(root, "fixtures/synthetic/terms/invalid/missing-required-top.yaml")),
            ("listed.yaml", listed(minimal)),
            ("weekend.yaml", dated(minimal, first: "2026-07-04", maturity: "2026-07-04")),
            ("outside.yaml", dated(minimal, first: "2060-11-02", maturity: "2061-03-01")),
        ]
        var seen = Set<String>()
        for input in inputs {
            let core = try object(try session.parityLine(text: input.text, file: input.file))
            let result = try XCTUnwrap(core["result"] as? [String: Any], input.file)
            switch try ScreenDecode.load(try session.screenJSON(text: input.text, file: input.file)) {
            case .invalid(let diagnostics):
                XCTAssertEqual(result["ok"] as? Bool, false, input.file)
                let errors = try XCTUnwrap(result["errors"] as? [[String: Any]], input.file)
                XCTAssertFalse(errors.isEmpty, input.file)
                let expected = [copy.failureInvalid] + errors.map { error -> String in
                    let code = error["code"] as? String ?? ""
                    return "\(integer(error["line"])) \(copy.diagnostics[code] ?? String(format: copy.diagnosticFallback, code))"
                }
                let rows = ScreenRender.rows(model: ScreenModel(failure: .invalid(diagnostics)), copy: copy)
                XCTAssertEqual(rows.filter { $0.role == "failure" }.map(\.text), expected, input.file)
                seen.insert("invalid")
            case .valid(let summary, let schedule):
                XCTAssertEqual(result["ok"] as? Bool, true, input.file)
                let active = ActiveDocument(name: input.file, importedAt: "2026-01-01T00:00:00Z", summary: summary, schedule: schedule)
                let rows = ScreenRender.rows(model: ScreenModel(active: active), copy: copy)
                let summaryObject = try XCTUnwrap(core["summary"] as? [String: Any], input.file)
                let verified = integer(summaryObject["verified"])
                let total = integer(summaryObject["total"])
                let unverified = try XCTUnwrap(summaryObject["unverified"] as? [String], input.file)
                XCTAssertEqual(
                    rows.filter { $0.role == "summary" }.map(\.text),
                    [copy.summaryHeading, "\(verified) of \(total) verified", copy.unverifiedHeading] + unverified,
                    input.file
                )
                if verified < total, !unverified.isEmpty { seen.insert("summary below its total") }
                let scheduleObject = try XCTUnwrap(core["schedule"] as? [String: Any], input.file)
                let expected = try scheduleTexts(scheduleObject, file: input.file, seen: &seen)
                XCTAssertEqual(rows.filter { $0.role == "schedule" }.map(\.text), [copy.scheduleHeading] + expected, input.file)
            }
        }
        XCTAssertEqual(seen, [
            "invalid",
            "summary below its total",
            "generated",
            "stated",
            "stated with a flag",
            "listed with a date",
            "listed without a date",
            "unavailable with a path",
            "unavailable with a date",
        ])
    }

    private func scheduleTexts(_ schedule: [String: Any], file: String, seen: inout Set<String>) throws -> [String] {
        let kind = try XCTUnwrap(schedule["kind"] as? String, file)
        if kind == "unavailable" {
            let reasons = try XCTUnwrap(schedule["reasons"] as? [[String: Any]], file)
            XCTAssertFalse(reasons.isEmpty, file)
            return reasons.map { reason in
                let code = reason["code"] as? String ?? ""
                var text = copy.reasons[code] ?? String(format: copy.reasonFallback, code)
                if let path = reason["path"] as? String {
                    text += " \(path)"
                    seen.insert("unavailable with a path")
                }
                if let date = reason["date"] as? String {
                    text += " \(date)"
                    seen.insert("unavailable with a date")
                }
                return text
            }
        }
        let entries = try XCTUnwrap(schedule["entries"] as? [[String: Any]], file)
        XCTAssertFalse(entries.isEmpty, file)
        if kind == "estimated" {
            return try entries.map { entry in
                let date = try XCTUnwrap(entry["date"] as? String, file)
                if entry["origin"] as? String == "generated" {
                    XCTAssertEqual(entry["label"] as? String, "ESTIMATE", file)
                    let rule = try XCTUnwrap(entry["rule"] as? String, file)
                    seen.insert("generated")
                    return "\(date) ESTIMATE \(rule)"
                }
                let status = try XCTUnwrap(entry["status"] as? String, file)
                let flags = entry["flags"] as? [String] ?? []
                seen.insert(flags.isEmpty ? "stated" : "stated with a flag")
                return ([date, status] + flags).joined(separator: " ")
            }
        }
        XCTAssertEqual(kind, "listed", file)
        return try entries.map { entry in
            let term = try XCTUnwrap(entry["term"] as? [String: Any], file)
            let status = try XCTUnwrap(term["status"] as? String, file)
            if let date = entry["date"] as? String {
                seen.insert("listed with a date")
                return "\(date) \(status)"
            }
            seen.insert("listed without a date")
            return status
        }
    }

    private func text(_ root: URL, _ path: String) throws -> String {
        String(decoding: try ByteRead.data(from: root.appendingPathComponent(path)), as: UTF8.self)
    }

    private func object(_ json: String) throws -> [String: Any] {
        try XCTUnwrap(try JSONSerialization.jsonObject(with: Data(json.utf8)) as? [String: Any])
    }

    private func integer(_ value: Any?) -> Int {
        (value as? NSNumber)?.intValue ?? -1
    }
}
