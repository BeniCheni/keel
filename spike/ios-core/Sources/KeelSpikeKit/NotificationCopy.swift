import Foundation

public struct TermsDate: Equatable {
    public enum Form: Equatable {
        case single(String)
        case estimated(String)
        case conflict([String])
    }

    public var form: Form

    public init(form: Form) {
        self.form = form
    }

    public var values: [String] {
        switch form {
        case .single(let value), .estimated(let value):
            return [value]
        case .conflict(let values):
            return values
        }
    }
}

public struct SeriesClose: Equatable {
    public var name: String
    public var latestClose: String?

    public init(name: String, latestClose: String?) {
        self.name = name
        self.latestClose = latestClose
    }
}

public struct ImportedSnapshot: Equatable {
    public var hasObservation: Bool
    public var observationDate: TermsDate
    public var maturityDate: TermsDate
    public var firstObservationDate: TermsDate
    public var series: [SeriesClose]

    public init(
        hasObservation: Bool,
        observationDate: TermsDate,
        maturityDate: TermsDate,
        firstObservationDate: TermsDate,
        series: [SeriesClose]
    ) {
        self.hasObservation = hasObservation
        self.observationDate = observationDate
        self.maturityDate = maturityDate
        self.firstObservationDate = firstObservationDate
        self.series = series
    }
}

public struct NotificationText: Equatable {
    public var title: String
    public var subtitle: String
    public var body: String

    public init(title: String, subtitle: String, body: String) {
        self.title = title
        self.subtitle = subtitle
        self.body = body
    }

    public var parts: [String] { [title, subtitle, body] }
}

public enum ReminderKind: Equatable {
    case a3
    case a5
    case a8
    case a9
}

public enum NotificationCopy {
    public static func text(kind: ReminderKind, snapshot: ImportedSnapshot) -> NotificationText {
        let applicable = applicablePhrase(kind: kind, snapshot: snapshot)
        let title = openingLine(hasObservation: snapshot.hasObservation, applicable: applicable)
        let subtitle = subtitleLine(kind: kind, snapshot: snapshot, applicable: applicable)
        let body = bodyLine(kind: kind)
        return NotificationText(title: title, subtitle: subtitle, body: body)
    }

    public static func detailPage(notification: NotificationText, disclaimer: String) -> String {
        "\(notification.title)\n\(notification.subtitle)\n\(notification.body)\n\n\(disclaimer)"
    }

    static func openingLine(hasObservation: Bool, applicable: String) -> String {
        let prefix = "From the imported snapshot."
        if hasObservation {
            return "\(prefix) \(applicable)."
        }
        return "\(prefix) No observation date is present."
    }

    private static func subtitleLine(kind: ReminderKind, snapshot: ImportedSnapshot, applicable: String) -> String {
        if snapshot.hasObservation {
            return "Dates recorded in the imported snapshot."
        }
        if kind == .a8 {
            return "\(applicable)."
        }
        return "\(applicable)."
    }

    private static func bodyLine(kind: ReminderKind) -> String {
        switch kind {
        case .a3:
            return "The observation date is the one recorded in the imported terms."
        case .a5:
            return "The maturity date is the one recorded in the imported terms."
        case .a8:
            return "The closes named are the ones in that snapshot."
        case .a9:
            return "The terms were unverified in that snapshot."
        }
    }

    private static func applicablePhrase(kind: ReminderKind, snapshot: ImportedSnapshot) -> String {
        switch kind {
        case .a3:
            return datePhrase("Observation date", snapshot.observationDate)
        case .a5:
            return datePhrase("Maturity date", snapshot.maturityDate)
        case .a9:
            return datePhrase("First observation date", snapshot.firstObservationDate)
        case .a8:
            return seriesPhrase(snapshot.series)
        }
    }

    private static func datePhrase(_ label: String, _ date: TermsDate) -> String {
        switch date.form {
        case .single(let value):
            return "\(label) \(value)"
        case .estimated(let value):
            return "\(label) \(value), estimated"
        case .conflict(let values):
            return "\(label) in conflict: \(values.joined(separator: ", "))"
        }
    }

    private static func seriesPhrase(_ series: [SeriesClose]) -> String {
        if series.isEmpty { return "No series close is in the snapshot" }
        return series.map { item in
            if let close = item.latestClose {
                return "Latest close \(item.name) \(close)"
            }
            return "No close for \(item.name)"
        }.joined(separator: ". ")
    }
}

public enum SnapshotReader {
    public static func fromTermsLine(_ line: String) -> ImportedSnapshot? {
        guard let data = line.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let result = object["result"] as? [String: Any],
              let terms = result["terms"] as? [String: Any],
              let dates = terms["dates"] as? [String: Any],
              let observation = dateValue(dates["first_call_observation"]),
              let maturity = dateValue(dates["maturity"]),
              let trade = dateValue(dates["trade"]),
              let underlyings = terms["underlyings"] as? [String: Any],
              let members = underlyings["members"] as? [[String: Any]]
        else { return nil }
        let tickers = members.compactMap { $0["ticker"] as? String }
        guard tickers.count >= 2, let close = trade.values.first else { return nil }
        return ImportedSnapshot(
            hasObservation: true,
            observationDate: observation,
            maturityDate: maturity,
            firstObservationDate: observation,
            series: [
                SeriesClose(name: tickers[0], latestClose: close),
                SeriesClose(name: tickers[1], latestClose: nil),
            ]
        )
    }

    private static func dateValue(_ raw: Any?) -> TermsDate? {
        guard let object = raw as? [String: Any] else { return nil }
        let status = object["status"] as? String ?? ""
        if status == "conflict" {
            let candidates = object["candidates"] as? [[String: Any]] ?? []
            let values = candidates.compactMap { $0["value"] as? String }
            guard values.count >= 2 else { return nil }
            return TermsDate(form: .conflict(values))
        }
        guard let value = object["value"] as? String else { return nil }
        if status == "estimate" { return TermsDate(form: .estimated(value)) }
        return TermsDate(form: .single(value))
    }
}
