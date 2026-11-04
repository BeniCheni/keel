import XCTest
import KeelSpikeKit

final class LoadTimeTests: XCTestCase {
    func testFreshLaunchesAndWarmSet() throws {
        let root = try XCTUnwrap(SpikeFiles.repoRoot())
        let files = try SpikeFiles.fromRepo(root: root)
        let host = try XCTUnwrap(findHost(package: root.appendingPathComponent("spike/ios-core")), "host binary is missing")
        for variant in ["compile", "standalone"] {
            var context: [Double] = []
            var load: [Double] = []
            var pids = Set<String>()
            for _ in 0 ..< 5 {
                let output = try runHost(host, root: root, variant: variant)
                let line = try XCTUnwrap(output.split(separator: "\n").first { $0.contains("kind=fresh") })
                context.append(try value(String(line), key: "contextMs"))
                load.append(try value(String(line), key: "loadTermsMs"))
                let pid = try token(String(line), key: "pid")
                XCTAssertTrue(pids.insert(pid).inserted, "fresh launch reused pid \(pid)")
            }
            print(
                "macOS fresh variant=\(variant) launches=5 contextMedianMs=\(formatMilliseconds(median(context))) contextWorstMs=\(formatMilliseconds(worst(context))) loadMedianMs=\(formatMilliseconds(median(load))) loadWorstMs=\(formatMilliseconds(worst(load)))"
            )
            var warmContext: [Double] = []
            var warmLoad: [Double] = []
            let source = try files.source(variant: variant)
            for _ in 0 ..< 20 {
                let sample = try Timing.measure(bundleSource: source, exampleText: files.example)
                warmContext.append(sample.contextMs)
                warmLoad.append(sample.loadTermsMs)
            }
            print(
                "macOS warm variant=\(variant) count=20 contextMedianMs=\(formatMilliseconds(median(warmContext))) contextWorstMs=\(formatMilliseconds(worst(warmContext))) loadMedianMs=\(formatMilliseconds(median(warmLoad))) loadWorstMs=\(formatMilliseconds(worst(warmLoad)))"
            )
            XCTAssertEqual(context.count, 5)
            XCTAssertEqual(load.count, 5)
            XCTAssertFalse(median(context).isNaN)
            XCTAssertFalse(median(load).isNaN)
        }
    }

    private func runHost(_ host: URL, root: URL, variant: String) throws -> String {
        let process = Process()
        process.executableURL = host
        process.arguments = ["time", "--root", root.path, "--variant", variant]
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = Pipe()
        try process.run()
        process.waitUntilExit()
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let text = String(decoding: data, as: UTF8.self)
        XCTAssertEqual(process.terminationStatus, 0, text)
        return text
    }

    private func value(_ line: String, key: String) throws -> Double {
        let token = try token(line, key: key)
        return try XCTUnwrap(Double(token))
    }

    private func token(_ line: String, key: String) throws -> String {
        let parts = line.split(separator: " ")
        let match = parts.first { $0.hasPrefix("\(key)=") }
        return try String(XCTUnwrap(match).dropFirst("\(key)=".count))
    }

    private func findHost(package: URL) -> URL? {
        let build = package.appendingPathComponent(".build")
        guard let enumerator = FileManager.default.enumerator(at: build, includingPropertiesForKeys: [.isRegularFileKey]) else {
            return nil
        }
        for case let url as URL in enumerator {
            if url.lastPathComponent == "keel-spike-host", !url.path.contains(".dSYM") {
                return url
            }
        }
        return nil
    }
}
