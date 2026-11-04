import XCTest
import KeelSpikeKit

final class NotificationWordingTests: XCTestCase {
    private let prefix = "From the imported snapshot."
    private let absent = "No observation date is present."
    private let bannedClaims = [
        "still ahead",
        "not called",
        "on the desktop",
        "still unverified",
        "current rating",
    ]

    func testWordingFollowsTheSnapshotRule() throws {
        let snapshot = try snapshotFromExample()
        let absentSnapshot = ImportedSnapshot(
            hasObservation: false,
            observationDate: snapshot.observationDate,
            maturityDate: snapshot.maturityDate,
            firstObservationDate: snapshot.firstObservationDate,
            series: snapshot.series
        )
        let estimated = ImportedSnapshot(
            hasObservation: true,
            observationDate: TermsDate(form: .estimated(snapshot.observationDate.values[0])),
            maturityDate: snapshot.maturityDate,
            firstObservationDate: snapshot.firstObservationDate,
            series: snapshot.series
        )

        for kind in [ReminderKind.a3, .a5, .a8, .a9] {
            for sample in [snapshot, absentSnapshot] {
                let note = NotificationCopy.text(kind: kind, snapshot: sample)
                XCTAssertTrue(note.title.hasPrefix(prefix), note.title)
                XCTAssertEqual(note.title.contains(absent), !sample.hasObservation)
                for part in note.parts {
                    XCTAssertFalse(part.contains(absent) && sample.hasObservation)
                    assertNoCurrentClaim(part)
                    assertCopyWords(part)
                }
            }
        }

        let conflict = NotificationCopy.text(kind: .a5, snapshot: snapshot)
        for value in snapshot.maturityDate.values {
            XCTAssertTrue(conflict.title.contains(value), conflict.title)
        }
        XCTAssertTrue(conflict.title.contains("in conflict:"))

        let quiet = NotificationCopy.text(kind: .a5, snapshot: absentSnapshot)
        XCTAssertTrue(quiet.title.contains(absent))
        XCTAssertFalse(quiet.title.contains(snapshot.maturityDate.values[0]))
        for value in snapshot.maturityDate.values {
            XCTAssertTrue(quiet.subtitle.contains(value), quiet.subtitle)
        }

        let estimatedNote = NotificationCopy.text(kind: .a3, snapshot: estimated)
        XCTAssertTrue(estimatedNote.title.contains("estimated"))
        XCTAssertTrue(estimatedNote.title.contains(snapshot.observationDate.values[0]))

        let stale = NotificationCopy.text(kind: .a8, snapshot: snapshot)
        XCTAssertTrue(stale.title.contains("Latest close"))
        XCTAssertTrue(stale.title.contains("No close for"))
        let staleAbsent = NotificationCopy.text(kind: .a8, snapshot: absentSnapshot)
        XCTAssertTrue(staleAbsent.title.contains(absent))
        XCTAssertTrue(staleAbsent.subtitle.contains("Latest close") || staleAbsent.subtitle.contains("No close for"))

        let unverified = NotificationCopy.text(kind: .a9, snapshot: snapshot)
        XCTAssertTrue(unverified.body.contains("unverified in that snapshot"))
        XCTAssertFalse(unverified.body.contains("still unverified"))
        XCTAssertTrue(unverified.title.contains(snapshot.firstObservationDate.values[0]))
        let unverifiedAbsent = NotificationCopy.text(kind: .a9, snapshot: absentSnapshot)
        XCTAssertTrue(unverifiedAbsent.title.contains(absent))
        XCTAssertTrue(unverifiedAbsent.subtitle.contains(snapshot.firstObservationDate.values[0]))

        let root = try XCTUnwrap(SpikeFiles.repoRoot())
        let disclaimer = try String(contentsOf: root.appendingPathComponent("DISCLAIMER.md"), encoding: .utf8)
        let page = NotificationCopy.detailPage(notification: conflict, disclaimer: disclaimer)
        XCTAssertTrue(page.contains(disclaimer))
        XCTAssertFalse(conflict.parts.joined(separator: "\n").contains("information only"))
    }

    private func snapshotFromExample() throws -> ImportedSnapshot {
        let root = try XCTUnwrap(SpikeFiles.repoRoot())
        let files = try SpikeFiles.fromRepo(root: root)
        let session = try CoreSession(bundleSource: files.compile)
        let line = try session.line(text: files.example, file: "fixtures/synthetic/terms/valid/example-autocall.yaml")
        let data = Data(line.utf8)
        let object = try XCTUnwrap(try JSONSerialization.jsonObject(with: data) as? [String: Any])
        let result = try XCTUnwrap(object["result"] as? [String: Any])
        let terms = try XCTUnwrap(result["terms"] as? [String: Any])
        let dates = try XCTUnwrap(terms["dates"] as? [String: Any])
        let observation = try dateValue(dates["first_call_observation"])
        let maturity = try dateValue(dates["maturity"])
        let trade = try dateValue(dates["trade"])
        let underlyings = try XCTUnwrap(terms["underlyings"] as? [String: Any])
        let members = try XCTUnwrap(underlyings["members"] as? [[String: Any]])
        let tickers = members.compactMap { $0["ticker"] as? String }
        XCTAssertGreaterThanOrEqual(tickers.count, 2)
        let series = [
            SeriesClose(name: tickers[0], latestClose: trade.values[0]),
            SeriesClose(name: tickers[1], latestClose: nil),
        ]
        return ImportedSnapshot(
            hasObservation: true,
            observationDate: observation,
            maturityDate: maturity,
            firstObservationDate: observation,
            series: series
        )
    }

    private func dateValue(_ raw: Any?) throws -> TermsDate {
        let object = try XCTUnwrap(raw as? [String: Any])
        let status = object["status"] as? String ?? ""
        if status == "conflict" {
            let candidates = try XCTUnwrap(object["candidates"] as? [[String: Any]])
            let values = candidates.compactMap { $0["value"] as? String }
            XCTAssertGreaterThanOrEqual(values.count, 2)
            return TermsDate(form: .conflict(values))
        }
        let value = try XCTUnwrap(object["value"] as? String)
        if status == "estimate" { return TermsDate(form: .estimated(value)) }
        return TermsDate(form: .single(value))
    }

    private func assertNoCurrentClaim(_ text: String) {
        for claim in bannedClaims {
            XCTAssertFalse(text.localizedCaseInsensitiveContains(claim), text)
        }
    }

    private func assertCopyWords(_ text: String) {
        let pattern = #"(?:^|[^A-Za-z])(should|buy|sell|hold)(?![A-Za-z])"#
        let range = text.range(of: pattern, options: [.regularExpression, .caseInsensitive])
        XCTAssertNil(range, text)
    }
}
