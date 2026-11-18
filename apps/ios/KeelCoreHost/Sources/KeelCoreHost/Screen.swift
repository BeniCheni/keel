import Foundation

public struct DiagnosticLine: Equatable {
    public var line: Int
    public var code: String

    public init(line: Int, code: String) {
        self.line = line
        self.code = code
    }
}

public struct SummaryModel: Equatable {
    public var verified: Int
    public var total: Int
    public var unverified: [String]

    public init(verified: Int, total: Int, unverified: [String]) {
        self.verified = verified
        self.total = total
        self.unverified = unverified
    }
}

public struct ScheduleEntry: Equatable {
    public var date: String?
    public var status: String
    public var flags: [String]
    public var label: String?
    public var rule: String?
    public var origin: String

    public init(date: String?, status: String, flags: [String] = [], label: String? = nil, rule: String? = nil, origin: String) {
        self.date = date
        self.status = status
        self.flags = flags
        self.label = label
        self.rule = rule
        self.origin = origin
    }
}

public struct UnavailableItem: Equatable {
    public var code: String
    public var path: String?
    public var date: String?

    public init(code: String, path: String? = nil, date: String? = nil) {
        self.code = code
        self.path = path
        self.date = date
    }
}

public enum ScheduleBody: Equatable {
    case estimated(entries: [ScheduleEntry])
    case listed(entries: [ScheduleEntry])
    case unavailable(reasons: [UnavailableItem])
}

public enum FailureKind: Equatable {
    case read
    case utf8
    case core
    case invalid([DiagnosticLine])
    case store
}

public struct ActiveDocument: Equatable {
    public var name: String
    public var importedAt: String
    public var summary: SummaryModel?
    public var schedule: ScheduleBody?

    public init(name: String, importedAt: String, summary: SummaryModel? = nil, schedule: ScheduleBody? = nil) {
        self.name = name
        self.importedAt = importedAt
        self.summary = summary
        self.schedule = schedule
    }
}

public struct ScreenModel: Equatable {
    public var active: ActiveDocument?
    public var failure: FailureKind?

    public init(active: ActiveDocument? = nil, failure: FailureKind? = nil) {
        self.active = active
        self.failure = failure
    }
}

public struct ScreenCopy: Equatable, Sendable {
    public var fileProvider: String
    public var disclaimer: String
    public var picker: String
    public var title: String
    public var noFile: String
    public var about: String
    public var arrived: String
    public var omitted: String
    public var summaryHeading: String
    public var verifiedFormat: String
    public var unverifiedHeading: String
    public var scheduleHeading: String
    public var failureRead: String
    public var failureUTF8: String
    public var failureCore: String
    public var failureInvalid: String
    public var failureStore: String
    public var diagnostics: [String: String]
    public var diagnosticFallback: String
    public var reasons: [String: String]
    public var reasonFallback: String
    public var importedLabel: String
    public var fileLabel: String

    public init(
        fileProvider: String,
        disclaimer: String,
        picker: String,
        title: String,
        noFile: String,
        about: String,
        arrived: String,
        omitted: String,
        summaryHeading: String,
        verifiedFormat: String,
        unverifiedHeading: String,
        scheduleHeading: String,
        failureRead: String,
        failureUTF8: String,
        failureCore: String,
        failureInvalid: String,
        failureStore: String,
        diagnostics: [String: String],
        diagnosticFallback: String,
        reasons: [String: String],
        reasonFallback: String,
        importedLabel: String,
        fileLabel: String
    ) {
        self.fileProvider = fileProvider
        self.disclaimer = disclaimer
        self.picker = picker
        self.title = title
        self.noFile = noFile
        self.about = about
        self.arrived = arrived
        self.omitted = omitted
        self.summaryHeading = summaryHeading
        self.verifiedFormat = verifiedFormat
        self.unverifiedHeading = unverifiedHeading
        self.scheduleHeading = scheduleHeading
        self.failureRead = failureRead
        self.failureUTF8 = failureUTF8
        self.failureCore = failureCore
        self.failureInvalid = failureInvalid
        self.failureStore = failureStore
        self.diagnostics = diagnostics
        self.diagnosticFallback = diagnosticFallback
        self.reasons = reasons
        self.reasonFallback = reasonFallback
        self.importedLabel = importedLabel
        self.fileLabel = fileLabel
    }
}

public struct ScreenRow: Equatable, Identifiable, Sendable {
    public var id: String
    public var role: String
    public var text: String

    public init(id: String, role: String, text: String) {
        self.id = id
        self.role = role
        self.text = text
    }
}

public enum ScreenDecodeError: Error {
    case malformed
}

public enum ScreenDecode {
    public static func load(_ json: String) throws -> EngineLoad {
        guard let data = json.data(using: .utf8),
              let object = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { throw ScreenDecodeError.malformed }
        if object["core"] as? Bool == true { throw ScreenDecodeError.malformed }
        if object["ok"] as? Bool != true {
            guard let rows = object["errors"] as? [[String: Any]] else { throw ScreenDecodeError.malformed }
            let diagnostics = try rows.map { row -> DiagnosticLine in
                guard let line = integer(row["line"]), let code = row["code"] as? String else {
                    throw ScreenDecodeError.malformed
                }
                return DiagnosticLine(line: line, code: code)
            }
            return .invalid(diagnostics)
        }
        guard let summaryObject = object["summary"] as? [String: Any],
              let verified = integer(summaryObject["verified"]),
              let total = integer(summaryObject["total"]),
              let unverified = summaryObject["unverified"] as? [String],
              let scheduleObject = object["schedule"] as? [String: Any],
              let kind = scheduleObject["kind"] as? String
        else { throw ScreenDecodeError.malformed }
        let summary = SummaryModel(verified: verified, total: total, unverified: unverified)
        return .valid(summary, try schedule(kind: kind, object: scheduleObject))
    }

    private static func schedule(kind: String, object: [String: Any]) throws -> ScheduleBody {
        if kind == "unavailable" {
            guard let rows = object["reasons"] as? [[String: Any]] else { throw ScreenDecodeError.malformed }
            let reasons = try rows.map { row -> UnavailableItem in
                guard let code = row["code"] as? String else { throw ScreenDecodeError.malformed }
                return UnavailableItem(code: code, path: row["path"] as? String, date: row["date"] as? String)
            }
            return .unavailable(reasons: reasons)
        }
        guard let rows = object["entries"] as? [[String: Any]] else { throw ScreenDecodeError.malformed }
        if kind == "estimated" {
            return .estimated(entries: try rows.map(estimatedEntry))
        }
        if kind == "listed" {
            return .listed(entries: try rows.map(listedEntry))
        }
        throw ScreenDecodeError.malformed
    }

    private static func integer(_ value: Any?) -> Int? {
        (value as? NSNumber)?.intValue
    }

    private static func estimatedEntry(_ row: [String: Any]) throws -> ScheduleEntry {
        guard let origin = row["origin"] as? String, let status = row["status"] as? String else {
            throw ScreenDecodeError.malformed
        }
        let flags = row["flags"] as? [String] ?? []
        return ScheduleEntry(
            date: row["date"] as? String,
            status: status,
            flags: flags,
            label: row["label"] as? String,
            rule: row["rule"] as? String,
            origin: origin
        )
    }

    private static func listedEntry(_ row: [String: Any]) throws -> ScheduleEntry {
        guard let term = row["term"] as? [String: Any], let status = term["status"] as? String else {
            throw ScreenDecodeError.malformed
        }
        let date = row["date"] as? String
        return ScheduleEntry(date: date, status: status, origin: "listed")
    }
}

public enum EngineLoad: Equatable {
    case invalid([DiagnosticLine])
    case valid(SummaryModel, ScheduleBody)
}

public enum ScreenRender {
    public static func rows(model: ScreenModel, copy: ScreenCopy) -> [ScreenRow] {
        var rows: [ScreenRow] = []
        func add(_ role: String, _ text: String) {
            rows.append(ScreenRow(id: "\(role)-\(rows.count)", role: role, text: text))
        }
        add("fileProvider", copy.fileProvider)
        add("picker", copy.picker)
        if let failure = model.failure {
            for line in failureLines(failure, copy: copy) {
                add("failure", line)
            }
        }
        if let active = model.active {
            add("arrived", copy.arrived)
            add("arrived", "\(copy.fileLabel) \(active.name)")
            add("arrived", "\(copy.importedLabel) \(active.importedAt)")
            add("arrived", copy.omitted)
            if let summary = active.summary {
                add("summary", copy.summaryHeading)
                add("summary", String(format: copy.verifiedFormat, summary.verified, summary.total))
                add("summary", copy.unverifiedHeading)
                for path in summary.unverified {
                    add("summary", path)
                }
            }
            if let schedule = active.schedule {
                add("schedule", copy.scheduleHeading)
                rows += scheduleRows(schedule, copy: copy, start: rows.count)
            }
        } else {
            add("empty", copy.noFile)
            add("disclaimer", copy.disclaimer)
        }
        add("about", copy.about)
        add("about", copy.disclaimer)
        return rows
    }

    private static func failureLines(_ failure: FailureKind, copy: ScreenCopy) -> [String] {
        switch failure {
        case .read:
            return [copy.failureRead]
        case .utf8:
            return [copy.failureUTF8]
        case .core:
            return [copy.failureCore]
        case .store:
            return [copy.failureStore]
        case .invalid(let diagnostics):
            var lines = [copy.failureInvalid]
            for item in diagnostics {
                let message = copy.diagnostics[item.code] ?? String(format: copy.diagnosticFallback, item.code)
                lines.append("\(item.line) \(message)")
            }
            return lines
        }
    }

    private static func scheduleRows(_ schedule: ScheduleBody, copy: ScreenCopy, start: Int) -> [ScreenRow] {
        var rows: [ScreenRow] = []
        func add(_ text: String) {
            rows.append(ScreenRow(id: "schedule-\(start + rows.count)", role: "schedule", text: text))
        }
        switch schedule {
        case .estimated(let entries):
            for entry in entries {
                if entry.origin == "generated" {
                    add([entry.date ?? "", entry.label ?? "", entry.rule ?? ""].filter { !$0.isEmpty }.joined(separator: " "))
                } else {
                    let flags = entry.flags.joined(separator: " ")
                    add([entry.date ?? "", entry.status, flags].filter { !$0.isEmpty }.joined(separator: " "))
                }
            }
        case .listed(let entries):
            for entry in entries {
                if let date = entry.date {
                    add("\(date) \(entry.status)")
                } else {
                    add(entry.status)
                }
            }
        case .unavailable(let reasons):
            for item in reasons {
                let message = copy.reasons[item.code] ?? String(format: copy.reasonFallback, item.code)
                var text = message
                if let path = item.path { text += " \(path)" }
                if let date = item.date { text += " \(date)" }
                add(text)
            }
        }
        return rows
    }
}
