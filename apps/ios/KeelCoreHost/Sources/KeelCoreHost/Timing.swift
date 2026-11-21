import Foundation

public struct TimingSample: Equatable {
    public var contextMs: Double
    public var loadTermsMs: Double
}

public enum Timing {
    public static func measure(bundleSource: String, exampleText: String) throws -> (TimingSample, CoreSession) {
        let contextStart = CFAbsoluteTimeGetCurrent()
        let session = try CoreSession(bundleSource: bundleSource)
        let contextMs = (CFAbsoluteTimeGetCurrent() - contextStart) * 1000
        let loadStart = CFAbsoluteTimeGetCurrent()
        let line = try session.timeLine(text: exampleText, file: "fixtures/synthetic/terms/valid/example-autocall.yaml")
        let loadTermsMs = (CFAbsoluteTimeGetCurrent() - loadStart) * 1000
        if !line.contains("\"ok\":true") { throw CoreError.exception }
        return (TimingSample(contextMs: contextMs, loadTermsMs: loadTermsMs), session)
    }
}

public enum LaunchLog {
    public static func line(count: Int, pid: Int32, sample: TimingSample) -> String {
        String(format: "KEEL v1 launch=%d pid=%d contextMs=%.3f loadTermsMs=%.3f", count, pid, sample.contextMs, sample.loadTermsMs)
    }
}
