import XCTest
import KeelCoreHost

final class RenderModelTests: XCTestCase {
    private let copy = sampleCopy()

    func testFirstRunPlacesFileProviderTextBeforePickerAction() {
        let rows = ScreenRender.rows(model: ScreenModel(), copy: copy)
        let provider = rows.firstIndex { $0.role == "fileProvider" }
        let picker = rows.firstIndex { $0.role == "picker" }
        XCTAssertNotNil(provider)
        XCTAssertNotNil(picker)
        XCTAssertLessThan(provider ?? 0, picker ?? 0)
        XCTAssertEqual(rows.first { $0.role == "fileProvider" }?.text, copy.fileProvider)
        XCTAssertTrue(rows.contains { $0.text.contains("may be downloaded by that provider, outside the app") })
    }

    func testFirstRunRowsAndAboutHoldTheDisclaimer() {
        let rows = ScreenRender.rows(model: ScreenModel(), copy: copy)
        XCTAssertTrue(rows.contains { $0.role == "disclaimer" && $0.text.contains("keel is information only") })
        XCTAssertTrue(rows.contains { $0.role == "about" && $0.text == "About" })
        XCTAssertTrue(rows.contains { $0.role == "about" && $0.text.contains("keel is information only") })
        XCTAssertTrue(rows.contains { $0.role == "empty" && $0.text == copy.noFile })
    }

    func testCopySwiftContainsTheFileProviderTextAndTheDisclaimer() throws {
        let url = Repo.root().appendingPathComponent("apps/ios/Keel/Copy.swift")
        let source = String(decoding: try ByteRead.data(from: url), as: UTF8.self)
        XCTAssertTrue(source.contains("may be downloaded by that provider, outside the app"))
        XCTAssertTrue(source.contains("keel is information only"))
        XCTAssertTrue(source.contains("The file could not be read."))
        XCTAssertTrue(source.contains("The bytes are not valid UTF-8."))
        XCTAssertTrue(source.contains("The core failed to run."))
        XCTAssertTrue(source.contains("The terms are invalid."))
        XCTAssertTrue(source.contains("The file could not be stored with both attributes."))
    }

    func testGeneratedRowCarriesEstimate() {
        let entry = ScheduleEntry(date: "2026-12-01", status: "estimate", label: "ESTIMATE", rule: "Generated from the stated first call observation, every 3 months, with closed days moved to the next open day on calendar nyse-rules-1.", origin: "generated")
        let rows = scheduleRows(.estimated(entries: [entry]))
        XCTAssertTrue(rows.contains { $0.text.contains("ESTIMATE") })
        XCTAssertTrue(rows.contains { $0.text.contains("2026-12-01") })
        XCTAssertTrue(rows.contains { $0.text.contains("every 3 months") })
    }

    func testListedNullDateShowsNoDate() {
        let unknown = ScheduleEntry(date: nil, status: "unknown", origin: "listed")
        let conflict = ScheduleEntry(date: nil, status: "conflict", origin: "listed")
        let dated = ScheduleEntry(date: "2026-09-01", status: "primary", origin: "listed")
        let rows = scheduleRows(.listed(entries: [dated, unknown, conflict]))
        let texts = rows.map(\.text)
        XCTAssertTrue(texts.contains("2026-09-01 primary"))
        XCTAssertTrue(texts.contains("unknown"))
        XCTAssertTrue(texts.contains("conflict"))
        let undated = texts.filter { $0 == "unknown" || $0 == "conflict" }
        XCTAssertEqual(undated.count, 2)
        for text in undated {
            XCTAssertNil(text.range(of: #"\d{4}-\d{2}-\d{2}"#, options: .regularExpression))
        }
    }

    func testUnavailableReasonsStayInOrderWithPathOrDate() {
        let reasons = [
            UnavailableItem(code: "input-unknown", path: "dates.maturity"),
            UnavailableItem(code: "input-conflict", path: "call.frequency"),
            UnavailableItem(code: "outside-calendar", date: "2061-01-30"),
        ]
        let rows = scheduleRows(.unavailable(reasons: reasons)).filter { $0.text != copy.scheduleHeading }
        XCTAssertEqual(rows.count, 3)
        XCTAssertTrue(rows[0].text.contains("This input is unknown."))
        XCTAssertTrue(rows[0].text.contains("dates.maturity"))
        XCTAssertTrue(rows[1].text.contains("This input is in conflict."))
        XCTAssertTrue(rows[1].text.contains("call.frequency"))
        XCTAssertTrue(rows[2].text.contains("This date is outside the calendar."))
        XCTAssertTrue(rows[2].text.contains("2061-01-30"))
        XCTAssertLessThan(rows[0].text.firstIndex(of: "T") ?? rows[0].text.startIndex, rows[2].text.endIndex)
    }

    func testEachFailureKindHasItsMessage() {
        let cases: [(FailureKind, String)] = [
            (.read, copy.failureRead),
            (.utf8, copy.failureUTF8),
            (.core, copy.failureCore),
            (.store, copy.failureStore),
            (.invalid([DiagnosticLine(line: 4, code: "missing-required")]), copy.failureInvalid),
        ]
        for item in cases {
            let rows = ScreenRender.rows(model: ScreenModel(failure: item.0), copy: copy)
            XCTAssertTrue(rows.contains { $0.role == "failure" && $0.text.contains(item.1) }, item.1)
        }
        let invalid = ScreenRender.rows(
            model: ScreenModel(failure: .invalid([
                DiagnosticLine(line: 4, code: "missing-required"),
                DiagnosticLine(line: 9, code: "not-a-code"),
            ])),
            copy: copy
        )
        XCTAssertTrue(invalid.contains { $0.text.contains("4 A required field is missing") })
        XCTAssertTrue(invalid.contains { $0.text.contains("9 This code has no message in the app (not-a-code).") })
    }

    func testDecodeDropsNoUnavailableReasonAndNoListedDate() throws {
        let json = """
        {"ok":true,"summary":{"verified":1,"total":2,"unverified":["dates.maturity"]},"schedule":{"kind":"listed","entries":[{"index":0,"date":"2026-09-01","term":{"value":"2026-09-01","status":"primary"}},{"index":1,"date":null,"term":{"status":"conflict","candidates":[{"value":"2027-06-02","status":"primary"},{"value":"2027-06-01","status":"user"}]}}]}}
        """
        let loaded = try ScreenDecode.load(json)
        guard case .valid(_, let schedule) = loaded, case .listed(let entries) = schedule else {
            return XCTFail("listed")
        }
        XCTAssertEqual(entries.map(\.date), ["2026-09-01", nil])
        XCTAssertEqual(entries.map(\.status), ["primary", "conflict"])
        let rows = scheduleRows(schedule)
        XCTAssertFalse(rows.contains { $0.text.contains("2027-06-02") })
        XCTAssertFalse(rows.contains { $0.text.contains("2027-06-01") })
    }

    private func scheduleRows(_ schedule: ScheduleBody) -> [ScreenRow] {
        let model = ScreenModel(active: ActiveDocument(name: "note.yaml", importedAt: "2026-01-01T00:00:00Z", summary: SummaryModel(verified: 1, total: 2, unverified: ["dates.maturity"]), schedule: schedule))
        return ScreenRender.rows(model: model, copy: copy).filter { $0.role == "schedule" }
    }
}
