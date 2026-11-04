import Foundation

public enum TieInputError: Error {
    case editMissed
}

public enum TieInput {
    public static let file = "tie/minimal.yaml"

    /// The same removal `packages/core/src/terms/terms.review.test.ts` makes, generated from `minimal.yaml`.
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
