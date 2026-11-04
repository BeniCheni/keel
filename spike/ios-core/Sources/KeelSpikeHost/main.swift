import Foundation
import KeelSpikeKit

struct HostArgs {
    var command = ""
    var root = ""
    var variant = "compile"
    var list = ""
    var edges = ""
    var reversed = false
}

enum HostExit: Error {
    case usage
    case failed
}

func parseArgs() -> HostArgs {
    let raw = Array(CommandLine.arguments.dropFirst())
    var index = 0
    var cleaned: [String] = []
    while index < raw.count {
        let arg = raw[index]
        if arg == "-AppleLanguages" || arg == "-AppleLocale" {
            index += 2
            continue
        }
        cleaned.append(arg)
        index += 1
    }
    var args = HostArgs()
    var cursor = 0
    func take() -> String? {
        guard cursor < cleaned.count else { return nil }
        let value = cleaned[cursor]
        cursor += 1
        return value
    }
    args.command = take() ?? ""
    while let flag = take() {
        switch flag {
        case "--root":
            args.root = take() ?? ""
        case "--variant":
            args.variant = take() ?? ""
        case "--list":
            args.list = take() ?? ""
        case "--edges":
            args.edges = take() ?? ""
        case "--reversed":
            args.reversed = true
        default:
            break
        }
    }
    return args
}

func readKeepingPrefix(_ url: URL) throws -> String {
    let data = try Data(contentsOf: url)
    return String(decoding: data, as: UTF8.self)
}

func filesFromList(_ root: URL, _ list: String) throws -> [FixtureFile] {
    let text = try readKeepingPrefix(URL(fileURLWithPath: list))
    var files: [FixtureFile] = []
    for line in text.split(separator: "\n", omittingEmptySubsequences: true) {
        let file = String(line)
        let body: String
        if file == TieInput.file {
            let minimal = try readKeepingPrefix(root.appending(path: "fixtures/synthetic/terms/valid/minimal.yaml"))
            body = try TieInput.text(from: minimal)
        } else {
            let url = file.hasPrefix("/") ? URL(fileURLWithPath: file) : root.appending(path: file)
            body = try readKeepingPrefix(url)
        }
        files.append(FixtureFile(file: file, text: body))
    }
    return files
}

func emitLocale(engine: String, variant: String, locale: String) {
    print("KEEL_SPIKE v1 locale engine=\(engine) variant=\(variant) locale=\(locale)")
}

func runParity(_ args: HostArgs) throws {
    let root = URL(fileURLWithPath: args.root)
    let files = try SpikeFiles.fromRepo(root: root)
    let source = try files.source(variant: args.variant)
    let session = try CoreSession(bundleSource: source, reversedComparator: args.reversed)
    let locale = try session.locale()
    emitLocale(engine: "jscontext", variant: args.variant, locale: locale)
    let selected = try filesFromList(root, args.list)
    for fixture in selected {
        let line = try session.line(text: fixture.text, file: fixture.file)
        print(line)
    }
}

func runEdges(_ args: HostArgs) throws {
    let root = URL(fileURLWithPath: args.root)
    let files = try SpikeFiles.fromRepo(root: root)
    let source = try files.source(variant: args.variant)
    let session = try CoreSession(bundleSource: source)
    let dir = URL(fileURLWithPath: args.edges)
    let names = try String(contentsOf: dir.appendingPathComponent("names.txt"), encoding: .utf8)
    for name in names.split(separator: "\n", omittingEmptySubsequences: true) {
        let url = dir.appendingPathComponent(String(name))
        let text = try readKeepingPrefix(url)
        do {
            let line = try session.line(text: text, file: "edge/\(name)")
            print("\(name)\t\(line)")
        } catch {
            print("\(name)\tEDGE-EXCEPTION")
        }
    }
}

func runTime(_ args: HostArgs) throws {
    let root = URL(fileURLWithPath: args.root)
    let files = try SpikeFiles.fromRepo(root: root)
    let source = try files.source(variant: args.variant)
    let sample = try Timing.measure(bundleSource: source, exampleText: files.example)
    let pid = ProcessInfo.processInfo.processIdentifier
    print(
        "KEEL_SPIKE v1 timing variant=\(args.variant) kind=fresh pid=\(pid) contextMs=\(formatMilliseconds(sample.contextMs)) loadTermsMs=\(formatMilliseconds(sample.loadTermsMs))"
    )
}

let args = parseArgs()
do {
    switch args.command {
    case "parity":
        try runParity(args)
    case "edges":
        try runEdges(args)
    case "time":
        try runTime(args)
    default:
        fputs("usage: keel-spike-host parity|edges|time --root PATH\n", stderr)
        exit(2)
    }
} catch {
    fputs("keel-spike-host failed\n", stderr)
    exit(1)
}
