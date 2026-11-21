import Foundation

public enum ByteRead {
    public static func data(from url: URL) throws -> Data {
        let handle = try FileHandle(forReadingFrom: url)
        defer { try? handle.close() }
        return try handle.readToEnd() ?? Data()
    }
}

public enum TieInputError: Error {
    case editMissed
}

public enum TieInput {
    public static let file = "tie/minimal.yaml"

    public static func text(from minimal: String) throws -> String {
        var text = minimal
        let patterns = [
            "call:\n[\\s\\S]*?(?=premium:)",
            "barrier:\n[\\s\\S]*?(?=economics:)",
            "economics:\n[\\s\\S]*?(?=sources:)",
        ]
        for pattern in patterns {
            let regex = try NSRegularExpression(pattern: pattern)
            let range = NSRange(text.startIndex..., in: text)
            let next = regex.stringByReplacingMatches(in: text, range: range, withTemplate: "")
            if next == text { throw TieInputError.editMissed }
            text = next
        }
        return text
    }
}
