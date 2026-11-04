import Foundation

public struct TimingSample: Equatable {
    public var contextMs: Double
    public var loadTermsMs: Double
}

public enum Timing {
    public static func measure(bundleSource: String, exampleText: String) throws -> TimingSample {
        let contextStart = CFAbsoluteTimeGetCurrent()
        let session = try CoreSession(bundleSource: bundleSource)
        let contextMs = (CFAbsoluteTimeGetCurrent() - contextStart) * 1000
        let loadStart = CFAbsoluteTimeGetCurrent()
        let line = try session.line(text: exampleText, file: "fixtures/synthetic/terms/valid/example-autocall.yaml")
        let loadTermsMs = (CFAbsoluteTimeGetCurrent() - loadStart) * 1000
        if !line.contains("\"ok\":true") { throw CoreError.exception }
        return TimingSample(contextMs: contextMs, loadTermsMs: loadTermsMs)
    }
}
