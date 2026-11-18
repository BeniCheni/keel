import XCTest
import KeelCoreHost

final class SnapshotStoreTests: XCTestCase {
    func testEachStorageStepFailureKeepsThePreviousFile() throws {
        let folder = URL(fileURLWithPath: "/synthetic/keel", isDirectory: true)
        let files = MemoryFiling()
        let store = SnapshotStore(folder: folder, files: files)
        let first = Data("first".utf8)
        XCTAssertEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "2026-01-01T00:00:00Z"), .stored(FileSeal(protection: "complete", excludedFromBackup: true)))
        for step in StorageStep.allCases {
            files.failStep = step
            let outcome = store.importFile(bytes: Data("second".utf8), name: "two.yaml", importedAt: "2026-02-02T00:00:00Z")
            XCTAssertEqual(outcome, .failed, step.rawValue)
            let reopened = SnapshotStore(folder: folder, files: files)
            let active = reopened.activeTerms()
            XCTAssertEqual(active?.bytes, first, step.rawValue)
            XCTAssertEqual(active?.name, "one.yaml", step.rawValue)
            XCTAssertEqual(active?.importedAt, "2026-01-01T00:00:00Z", step.rawValue)
            XCTAssertNil(files.nodes[folder.appendingPathComponent("incoming").path], step.rawValue)
            files.failStep = nil
        }
    }

    func testASealThatIsNotExactKeepsThePreviousFile() {
        let folder = URL(fileURLWithPath: "/synthetic/keel", isDirectory: true)
        let files = MemoryFiling()
        let store = SnapshotStore(folder: folder, files: files)
        let first = Data("first".utf8)
        XCTAssertNotEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "2026-01-01T00:00:00Z"), .failed)
        for step in [StorageStep.readTemporary, .readActive, .readRecord] {
            files.badSeal = step
            XCTAssertEqual(store.importFile(bytes: Data("second".utf8), name: "two.yaml", importedAt: "2026-02-02T00:00:00Z"), .failed)
            let active = SnapshotStore(folder: folder, files: files).activeTerms()
            XCTAssertEqual(active?.bytes, first)
            XCTAssertEqual(active?.name, "one.yaml")
            XCTAssertEqual(active?.importedAt, "2026-01-01T00:00:00Z")
            files.badSeal = nil
        }
    }
}
