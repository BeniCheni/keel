import Foundation
import KeelCoreHost

enum TestError: Error {
    case missing
}

enum Repo {
    static func root() -> URL {
        var url = URL(fileURLWithPath: #filePath)
        let manager = FileManager.default
        while url.path != "/" {
            if manager.fileExists(atPath: url.appendingPathComponent("pnpm-workspace.yaml").path) {
                return url
            }
            url.deleteLastPathComponent()
        }
        fatalError("repo root")
    }
}

enum MemoryError: Error {
    case injected
}

final class MemoryFiling: SnapshotFiling {
    struct Node {
        var data: Data
        var protection = false
        var excluded = false
    }

    var nodes: [String: Node] = [:]
    var failStep: StorageStep?
    var badSeal: StorageStep?

    func write(_ data: Data, to url: URL, step: StorageStep?) throws {
        try gate(step)
        var node = nodes[url.path] ?? Node(data: data)
        node.data = data
        nodes[url.path] = node
    }

    func protect(_ url: URL, step: StorageStep) throws {
        try gate(step)
        nodes[url.path]?.protection = true
    }

    func exclude(_ url: URL, step: StorageStep) throws {
        try gate(step)
        nodes[url.path]?.excluded = true
    }

    func readSeal(_ url: URL, step: StorageStep) throws -> FileSeal {
        try gate(step)
        if badSeal == step {
            return FileSeal(protection: "none", excludedFromBackup: false)
        }
        let node = nodes[url.path]
        let protection = node?.protection == true ? "complete" : "missing"
        return FileSeal(protection: protection, excludedFromBackup: node?.excluded == true)
    }

    func replace(temporary: URL, active: URL, step: StorageStep) throws {
        try gate(step)
        guard let node = nodes[temporary.path] else { throw MemoryError.injected }
        nodes[active.path] = node
        nodes[temporary.path] = nil
    }

    func remove(_ url: URL) throws {
        nodes[url.path] = nil
    }

    func read(_ url: URL) throws -> Data {
        guard let data = nodes[url.path]?.data else { throw MemoryError.injected }
        return data
    }

    func exists(_ url: URL) -> Bool {
        nodes[url.path] != nil
    }

    private func gate(_ step: StorageStep?) throws {
        if let step, step == failStep { throw MemoryError.injected }
    }
}

func sampleCopy() -> ScreenCopy {
    ScreenCopy(
        fileProvider: "The app stores the file only in its own sandbox. It makes no network request and runs no connector. A file picked from a cloud provider such as iCloud Drive may be downloaded by that provider, outside the app, before the app receives it.",
        disclaimer: "keel is information only. It is not investment, tax or legal advice, and it does not recommend buying, selling or holding any security.",
        picker: "Import a terms file",
        title: "Keel",
        noFile: "No terms file is imported yet.",
        about: "About",
        arrived: "One terms file arrived.",
        omitted: "No observation, close or alert arrived with this file, so this screen shows no figure.",
        summaryHeading: "Terms summary",
        verifiedFormat: "%d of %d verified",
        unverifiedHeading: "Unverified paths",
        scheduleHeading: "Observation schedule",
        failureRead: "The file could not be read.",
        failureUTF8: "The bytes are not valid UTF-8.",
        failureCore: "The core failed to run.",
        failureInvalid: "The terms are invalid.",
        failureStore: "The file could not be stored with both attributes.",
        diagnostics: ["missing-required": "A required field is missing"],
        diagnosticFallback: "This code has no message in the app (%@).",
        reasons: [
            "input-unknown": "This input is unknown.",
            "outside-calendar": "This date is outside the calendar.",
            "input-conflict": "This input is in conflict.",
        ],
        reasonFallback: "This reason has no message in the app (%@).",
        importedLabel: "Imported",
        fileLabel: "File"
    )
}
