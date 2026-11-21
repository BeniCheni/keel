import Foundation
import KeelCoreHost

struct HostArgs {
    var command = ""
    var bundle = ""
    var inputs = ""
    var reversed = false
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
        case "--bundle":
            args.bundle = take() ?? ""
        case "--inputs":
            args.inputs = take() ?? ""
        case "--reversed":
            args.reversed = true
        default:
            break
        }
    }
    return args
}

func runParity(_ args: HostArgs) throws {
    let source = String(decoding: try ByteRead.data(from: URL(fileURLWithPath: args.bundle)), as: UTF8.self)
    let payload = try ByteRead.data(from: URL(fileURLWithPath: args.inputs))
    guard let rows = try JSONSerialization.jsonObject(with: payload) as? [[String: Any]] else {
        throw CoreError.exception
    }
    let session = try CoreSession(bundleSource: source, reversedComparator: args.reversed)
    let locale = try session.locale()
    print("KEEL v1 locale=\(locale)")
    for row in rows {
        guard let file = row["file"] as? String, let text = row["text"] as? String else { throw CoreError.exception }
        print(try session.parityLine(text: text, file: file))
    }
}

let args = parseArgs()
do {
    if args.command == "parity" {
        try runParity(args)
    } else {
        fputs("usage: keel-ios-host parity --bundle PATH --inputs PATH\n", stderr)
        exit(2)
    }
} catch {
    fputs("keel-ios-host failed\n", stderr)
    exit(1)
}
