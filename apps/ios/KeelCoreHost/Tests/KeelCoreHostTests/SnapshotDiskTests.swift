import XCTest
import KeelCoreHost

private final class ObservedFiling: SnapshotFiling {
    let disk = FoundationFiling()
    var before: ((StorageStep) throws -> Void)?
    var after: (() throws -> Void)?
    var onSeal: ((URL, StorageStep?) throws -> Void)?
    var onWrite: ((URL) -> Void)?
    var onCopy: ((URL) throws -> Void)?

    private func perform(_ step: StorageStep?, _ operation: () throws -> Void) throws {
        if let step { try before?(step) }
        try operation()
        try after?()
    }

    func write(_ data: Data, to url: URL, step: StorageStep?) throws {
        try perform(step) {
            onWrite?(url)
            try disk.write(data, to: url, step: step)
        }
    }

    func protect(_ url: URL, step: StorageStep) throws {
        try perform(step) { try disk.protect(url, step: step) }
    }

    func exclude(_ url: URL, step: StorageStep) throws {
        try perform(step) { try disk.exclude(url, step: step) }
    }

    func readSeal(_ url: URL, step: StorageStep?) throws -> FileSeal {
        try onSeal?(url, step)
        if let step { try before?(step) }
        let seal = try disk.readSeal(url, step: step)
        try after?()
        return seal
    }

    func replace(temporary: URL, active: URL, step: StorageStep) throws {
        try perform(step) { try disk.replace(temporary: temporary, active: active, step: step) }
    }

    func createDirectory(_ url: URL) throws {
        try perform(nil) { try disk.createDirectory(url) }
    }

    func copy(_ source: URL, to destination: URL) throws {
        try perform(nil) {
            try disk.copy(source, to: destination)
            try onCopy?(destination)
        }
    }

    func move(_ source: URL, to destination: URL) throws {
        try perform(nil) { try disk.move(source, to: destination) }
    }

    func remove(_ url: URL) throws {
        try perform(nil) { try disk.remove(url) }
    }

    func read(_ url: URL) throws -> Data { try disk.read(url) }
    func exists(_ url: URL) -> Bool { disk.exists(url) }
}

final class SnapshotDiskTests: XCTestCase {
    private let exact = FileSeal(protection: "complete", excludedFromBackup: true)
    private let first = Data("first".utf8)
    private let second = Data("second".utf8)

    private func withFolder(_ body: (URL) throws -> Void) throws {
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent("keel-store-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: false)
        defer { try? FileManager.default.removeItem(at: folder) }
        try body(folder)
    }

    private func files(in folder: URL) -> [URL] {
        ["active", "record.json"].map { folder.appendingPathComponent($0) }
    }

    private func inode(_ url: URL) throws -> NSNumber {
        try XCTUnwrap(FileManager.default.attributesOfItem(atPath: url.path)[.systemFileNumber] as? NSNumber)
    }

    private func verifyPrevious(_ terms: StoredTerms?, _ label: String) {
        XCTAssertEqual(terms?.bytes, first, label)
        XCTAssertEqual(terms?.name, "one.yaml", label)
        XCTAssertEqual(terms?.importedAt, "t1", label)
    }

    func testFailedImportPreservesBothSealsAndLeavesUntouchedFilesInPlace() throws {
        for failure in StorageStep.allCases {
            try withFolder { folder in
                let filing = ObservedFiling()
                let store = SnapshotStore(folder: folder, files: filing)
                XCTAssertEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "t1"), .stored(exact))
                let urls = files(in: folder)
                let before = try urls.map(inode)
                var failed = false
                var writesAfterFailure = 0
                var savedInodes: [String: NSNumber] = [:]
                filing.onWrite = { _ in
                    if failed { writesAfterFailure += 1 }
                }
                filing.onCopy = { saved in
                    savedInodes[saved.lastPathComponent] = try self.inode(saved)
                }
                filing.before = { step in
                    if step == failure && !failed {
                        failed = true
                        throw MemoryError.injected
                    }
                }

                XCTAssertEqual(store.importFile(bytes: second, name: "two.yaml", importedAt: "t2"), .failed, failure.rawValue)
                XCTAssertTrue(failed, failure.rawValue)
                XCTAssertEqual(writesAfterFailure, 0, failure.rawValue)
                for (index, url) in urls.enumerated() {
                    let fresh = URL(fileURLWithPath: url.path)
                    XCTAssertEqual(try filing.disk.readSeal(fresh, step: .readActive), exact, failure.rawValue)
                    switch failure {
                    case .writeTemporary, .protectTemporary, .excludeTemporary, .readTemporary, .replaceActive:
                        XCTAssertEqual(try inode(fresh), before[index], failure.rawValue)
                    default:
                        XCTAssertEqual(try inode(fresh), savedInodes[fresh.lastPathComponent], failure.rawValue)
                    }
                }
                verifyPrevious(SnapshotStore(folder: folder, files: filing.disk).activeTerms(), failure.rawValue)
                XCTAssertEqual(FileManager.default.enumerator(atPath: folder.path)?.allObjects.compactMap { $0 as? String }.sorted(), ["active", "record.json"])
            }
        }
    }

    func testFailedReadBackRemovesBothFiles() throws {
        for damagedIndex in [0, 1] {
            try withFolder { folder in
                let filing = ObservedFiling()
                let store = SnapshotStore(folder: folder, files: filing)
                XCTAssertEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "t1"), .stored(exact))
                let urls = files(in: folder)
                var failed = false
                var readAfterFailure: Set<String> = []
                filing.before = { step in
                    if step == .writeTemporary && !failed {
                        // Atomic replacement drops the backup flag on the stored inode.
                        let url = urls[damagedIndex]
                        try filing.disk.write(filing.disk.read(url), to: url, step: nil)
                        failed = true
                        throw MemoryError.injected
                    }
                }
                filing.onSeal = { url, _ in
                    if failed { readAfterFailure.insert(url.path) }
                }
                XCTAssertEqual(store.importFile(bytes: second, name: "two.yaml", importedAt: "t2"), .failed)
                XCTAssertEqual(readAfterFailure, Set(urls.map(\.path)))
                XCTAssertTrue(urls.allSatisfy { !filing.disk.exists($0) })
                XCTAssertNil(SnapshotStore(folder: folder, files: filing.disk).activeTerms())
            }
        }
    }

    func testAThrownSealReadChecksBothFilesAndRendersNoFileWithTheStoreError() throws {
        try withFolder { folder in
            let filing = ObservedFiling()
            let store = SnapshotStore(folder: folder, files: filing)
            XCTAssertEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "t1"), .stored(exact))
            let urls = files(in: folder)
            var failed = false
            var readBack: Set<String> = []
            filing.before = { step in
                if step == .writeTemporary {
                    failed = true
                    throw MemoryError.injected
                }
            }
            filing.onSeal = { url, _ in
                guard failed else { return }
                readBack.insert(url.path)
                if url.path == urls[0].path { throw MemoryError.injected }
            }
            XCTAssertEqual(store.importFile(bytes: second, name: "two.yaml", importedAt: "t2"), .failed)
            XCTAssertEqual(readBack, Set(urls.map(\.path)))
            let stored = SnapshotStore(folder: folder, files: filing.disk).activeTerms()
            XCTAssertNil(stored)
            XCTAssertTrue(urls.allSatisfy { !filing.disk.exists($0) })
            let active = stored.map { ActiveDocument(name: $0.name, importedAt: $0.importedAt) }
            let copy = sampleCopy()
            let rows = ScreenRender.rows(model: ScreenModel(active: active, failure: .store), copy: copy)
            XCTAssertTrue(rows.contains { $0.text == copy.noFile })
            XCTAssertTrue(rows.contains { $0.text == copy.failureStore })
        }
    }

    func testSealReadIgnoresAURLValueCachedBeforeAtomicReplacement() throws {
        try withFolder { folder in
            let filing = FoundationFiling()
            let url = folder.appendingPathComponent("example")
            try filing.write(first, to: url, step: nil)
            try filing.protect(url, step: .protectActive)
            try filing.exclude(url, step: .excludeActive)
            XCTAssertEqual(try filing.readSeal(url, step: .readActive), exact)
            // Keep the resource values cached on the URL used by the next read.
            XCTAssertEqual(try url.resourceValues(forKeys: [.isExcludedFromBackupKey]).isExcludedFromBackup, true)
            try filing.write(second, to: url, step: nil)
            XCTAssertFalse(try filing.readSeal(URL(fileURLWithPath: url.path), step: .readActive).excludedFromBackup)
            XCTAssertFalse(try filing.readSeal(url, step: .readActive).excludedFromBackup)
        }
    }

    func testRelaunchAfterEachStorageStepShowsAWholeImportOrNothing() throws {
        try withFolder { work in
            let live = work.appendingPathComponent("live", isDirectory: true)
            let manager = FileManager.default
            try manager.createDirectory(at: live, withIntermediateDirectories: false)
            let filing = ObservedFiling()
            let store = SnapshotStore(folder: live, files: filing)
            XCTAssertEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "t1"), .stored(exact))
            var checkpoints: [URL] = []
            // Keep a real filesystem image after each operation, with attributes preserved.
            let checkpoint = {
                let image = work.appendingPathComponent("checkpoint-\(checkpoints.count)", isDirectory: true)
                try manager.copyItem(at: live, to: image)
                checkpoints.append(image)
            }
            filing.after = checkpoint
            XCTAssertEqual(store.importFile(bytes: second, name: "two.yaml", importedAt: "t2"), .stored(exact))
            XCTAssertGreaterThanOrEqual(checkpoints.count, StorageStep.allCases.count)

            for image in checkpoints {
                let label = image.lastPathComponent
                let reopened = SnapshotStore(folder: image, files: FoundationFiling())
                guard let terms = reopened.activeTerms() else {
                    XCTAssertTrue(files(in: image).allSatisfy { !filing.disk.exists($0) }, label)
                    continue
                }
                if terms.bytes == first {
                    verifyPrevious(terms, label)
                } else {
                    XCTAssertEqual(terms.bytes, second, label)
                    XCTAssertEqual(terms.name, "two.yaml", label)
                    XCTAssertEqual(terms.importedAt, "t2", label)
                }
                for url in files(in: image) {
                    XCTAssertEqual(try filing.disk.readSeal(URL(fileURLWithPath: url.path), step: .readActive), exact, label)
                }
            }
        }
    }
}
