import XCTest
import KeelCoreHost

/// A filing double that acts as the disk does wherever the store relies on it. An atomic write
/// makes a new file with neither attribute, a copy keeps both, and a move or a copy onto a name
/// that exists fails. Its whole state is one value, so a test can keep the state before each
/// change and open a new store on it, which is what a stop followed by a relaunch leaves.
private final class LedgerFiling: SnapshotFiling {
    struct File {
        var data: Data
        var protected = false
        var excluded = false
        var id: Int
    }

    struct State {
        var files: [String: File] = [:]
        var folders: Set<String> = []
        var nextID = 1
    }

    enum Fault: Error {
        case injected
        case missing
        case exists
    }

    var state: State
    var failStep: StorageStep?
    var onFailure: (() -> Void)?
    var beforeChange: ((State) -> Void)?
    var copyKeepsAttributes = true
    var stopOnCopyOf: String?
    private(set) var interruptedCopy: State?
    var sealReadThrowsFor: String?
    var readThrowsOnceFor: String?
    private(set) var failed = false
    private(set) var writesAfterFailure = 0
    private(set) var sealReadsAfterFailure: Set<String> = []

    init(_ state: State = State()) {
        self.state = state
    }

    private func gate(_ step: StorageStep?) throws {
        guard let step, step == failStep, !failed else { return }
        failed = true
        onFailure?()
        throw Fault.injected
    }

    private func newID() -> Int {
        defer { state.nextID += 1 }
        return state.nextID
    }

    private func inside(_ folder: String) -> [String] {
        state.files.keys.filter { $0.hasPrefix(folder + "/") }
    }

    func write(_ data: Data, to url: URL, step: StorageStep?) throws {
        try gate(step)
        beforeChange?(state)
        if failed { writesAfterFailure += 1 }
        state.files[url.path] = File(data: data, id: newID())
    }

    func protect(_ url: URL, step: StorageStep) throws {
        try gate(step)
        beforeChange?(state)
        guard state.files[url.path] != nil else { throw Fault.missing }
        state.files[url.path]?.protected = true
    }

    func exclude(_ url: URL, step: StorageStep) throws {
        try gate(step)
        beforeChange?(state)
        guard state.files[url.path] != nil else { throw Fault.missing }
        state.files[url.path]?.excluded = true
    }

    func readSeal(_ url: URL, step: StorageStep?) throws -> FileSeal {
        try gate(step)
        if failed { sealReadsAfterFailure.insert(url.path) }
        if sealReadThrowsFor == url.path { throw Fault.injected }
        guard let file = state.files[url.path] else { throw Fault.missing }
        return FileSeal(protection: file.protected ? "complete" : "none", excludedFromBackup: file.excluded)
    }

    func replace(temporary: URL, active: URL, step: StorageStep) throws {
        try gate(step)
        beforeChange?(state)
        guard let file = state.files.removeValue(forKey: temporary.path) else { throw Fault.missing }
        state.files[active.path] = file
    }

    func createDirectory(_ url: URL) throws {
        beforeChange?(state)
        guard !exists(url) else { throw Fault.exists }
        state.folders.insert(url.path)
    }

    func copy(_ source: URL, to destination: URL) throws {
        beforeChange?(state)
        guard let file = state.files[source.path] else { throw Fault.missing }
        guard !exists(destination) else { throw Fault.exists }
        if stopOnCopyOf == source.path {
            // A partial destination exists, with neither seal attribute yet applied.
            state.files[destination.path] = File(data: Data(file.data.prefix(1)), id: newID())
            interruptedCopy = state
            throw Fault.injected
        }
        var made = File(data: file.data, id: newID())
        if copyKeepsAttributes {
            made.protected = file.protected
            made.excluded = file.excluded
        }
        state.files[destination.path] = made
    }

    func move(_ source: URL, to destination: URL) throws {
        beforeChange?(state)
        guard !exists(destination) else { throw Fault.exists }
        if state.folders.remove(source.path) != nil {
            state.folders.insert(destination.path)
            for key in inside(source.path) {
                state.files[destination.path + key.dropFirst(source.path.count)] = state.files.removeValue(forKey: key)
            }
        } else {
            guard let file = state.files.removeValue(forKey: source.path) else { throw Fault.missing }
            state.files[destination.path] = file
        }
    }

    func remove(_ url: URL) throws {
        beforeChange?(state)
        state.files[url.path] = nil
        if state.folders.remove(url.path) != nil {
            for key in inside(url.path) { state.files[key] = nil }
        }
    }

    func read(_ url: URL) throws -> Data {
        if readThrowsOnceFor == url.path {
            readThrowsOnceFor = nil
            throw Fault.injected
        }
        guard let file = state.files[url.path] else { throw Fault.missing }
        return file.data
    }

    func exists(_ url: URL) -> Bool {
        state.files[url.path] != nil || state.folders.contains(url.path)
    }
}

/// The store's recovery rules on the double above. These need no real file, so they also run
/// where the host cannot give a file complete protection and the real-file tests are skipped.
final class SnapshotRecoveryTests: XCTestCase {
    private enum Shown: Equatable {
        case previous
        case new
        case nothing
    }

    private let folder = URL(fileURLWithPath: "/synthetic/keel", isDirectory: true)
    private let exact = FileSeal(protection: "complete", excludedFromBackup: true)
    private let first = Data("first".utf8)
    private let second = Data("second".utf8)
    private var active: URL { folder.appendingPathComponent("active") }
    private var record: URL { folder.appendingPathComponent("record.json") }

    private func store(on files: LedgerFiling, withPrevious: Bool) -> SnapshotStore {
        let store = SnapshotStore(folder: folder, files: files)
        if withPrevious {
            XCTAssertEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "t1"), .stored(exact))
        }
        return store
    }

    private func importSecond(_ store: SnapshotStore) -> StoreOutcome {
        store.importFile(bytes: second, name: "two.yaml", importedAt: "t2")
    }

    private func names(_ state: LedgerFiling.State) -> [String] {
        (Array(state.files.keys) + Array(state.folders)).map { String($0.dropFirst(folder.path.count + 1)) }.sorted()
    }

    private func ids(_ files: LedgerFiling) -> [Int?] {
        [active, record].map { files.state.files[$0.path]?.id }
    }

    private func assertSealed(_ state: LedgerFiling.State, _ label: String, line: UInt = #line) {
        for url in [active, record] {
            XCTAssertEqual(state.files[url.path]?.protected, true, label, line: line)
            XCTAssertEqual(state.files[url.path]?.excluded, true, label, line: line)
        }
    }

    /// Opens a new store on this state, as a relaunch does. Whatever it shows has to be one whole
    /// import with both attributes on both files, or nothing, and no other file may be left.
    private func relaunch(_ state: LedgerFiling.State, _ label: String, line: UInt = #line) -> Shown? {
        let files = LedgerFiling(state)
        guard let terms = SnapshotStore(folder: folder, files: files).activeTerms() else {
            XCTAssertEqual(names(files.state), [], label, line: line)
            return .nothing
        }
        XCTAssertEqual(names(files.state), ["active", "record.json"], label, line: line)
        assertSealed(files.state, label, line: line)
        if terms.bytes == first, terms.name == "one.yaml", terms.importedAt == "t1" { return .previous }
        if terms.bytes == second, terms.name == "two.yaml", terms.importedAt == "t2" { return .new }
        XCTFail("\(label): \(String(decoding: terms.bytes, as: UTF8.self)) under \(terms.name) at \(terms.importedAt)", line: line)
        return nil
    }

    /// Imports the second file and keeps the state before each change, then the state at the end.
    private func stops(withPrevious: Bool, failing step: StorageStep?) -> (states: [LedgerFiling.State], outcome: StoreOutcome) {
        let files = LedgerFiling()
        let store = store(on: files, withPrevious: withPrevious)
        var states: [LedgerFiling.State] = []
        files.beforeChange = { states.append($0) }
        files.failStep = step
        let outcome = importSecond(store)
        states.append(files.state)
        return (states, outcome)
    }

    func testASecondImportReplacesTheFirstAndLeavesNoOtherFile() {
        let files = LedgerFiling()
        let store = store(on: files, withPrevious: true)
        XCTAssertEqual(importSecond(store), .stored(exact))
        XCTAssertEqual(names(files.state), ["active", "record.json"])
        assertSealed(files.state, "after the second import")
        XCTAssertEqual(relaunch(files.state, "after the second import"), .new)
    }

    func testAStopBeforeAnyChangeOfAReplacementShowsThePreviousImportThenTheNewOne() {
        let run = stops(withPrevious: true, failing: nil)
        XCTAssertEqual(run.outcome, .stored(exact))
        XCTAssertGreaterThanOrEqual(run.states.count, StorageStep.allCases.count)
        let shown = run.states.enumerated().map { relaunch($1, "stop \($0)") }
        XCTAssertFalse(shown.contains(nil))
        XCTAssertFalse(shown.contains(.nothing))
        XCTAssertEqual(shown.first, .previous)
        XCTAssertEqual(shown.last, .new)
        // Once a relaunch shows the new import, no later stop goes back to the previous one.
        let firstNew = shown.firstIndex(of: .new) ?? shown.endIndex
        XCTAssertTrue(shown[firstNew...].allSatisfy { $0 == .new })
    }

    func testAStopBeforeAnyChangeOfAFirstImportShowsNothingThenTheImport() {
        let run = stops(withPrevious: false, failing: nil)
        XCTAssertEqual(run.outcome, .stored(exact))
        let shown = run.states.enumerated().map { relaunch($1, "stop \($0)") }
        XCTAssertFalse(shown.contains(nil))
        XCTAssertFalse(shown.contains(.previous))
        XCTAssertEqual(shown.first, .nothing)
        XCTAssertEqual(shown.last, .new)
        let firstNew = shown.firstIndex(of: .new) ?? shown.endIndex
        XCTAssertTrue(shown[firstNew...].allSatisfy { $0 == .new })
    }

    func testAStopAnywhereInAFailedReplacementStillShowsThePreviousImport() {
        for step in StorageStep.allCases {
            let run = stops(withPrevious: true, failing: step)
            XCTAssertEqual(run.outcome, .failed, step.rawValue)
            for (index, state) in run.states.enumerated() {
                XCTAssertEqual(relaunch(state, "\(step.rawValue) stop \(index)"), .previous, "\(step.rawValue) stop \(index)")
            }
        }
    }

    func testAFailedFirstImportStoresNothing() {
        for step in StorageStep.allCases {
            let run = stops(withPrevious: false, failing: step)
            XCTAssertEqual(run.outcome, .failed, step.rawValue)
            XCTAssertEqual(names(run.states.last ?? LedgerFiling.State()), [], step.rawValue)
            let shown = run.states.enumerated().map { relaunch($1, "\(step.rawValue) stop \($0)") }
            XCTAssertFalse(shown.contains(nil), step.rawValue)
            XCTAssertFalse(shown.contains(.previous), step.rawValue)
            XCTAssertEqual(shown.last, .nothing, step.rawValue)
        }
    }

    func testAFailureLeavesUntouchedFilesInPlaceAndNeverWritesThePreviousFileAgain() {
        for step in StorageStep.allCases {
            let files = LedgerFiling()
            let store = store(on: files, withPrevious: true)
            let before = ids(files)
            files.failStep = step
            XCTAssertEqual(importSecond(store), .failed, step.rawValue)
            XCTAssertTrue(files.failed, step.rawValue)
            XCTAssertEqual(files.writesAfterFailure, 0, step.rawValue)
            XCTAssertEqual(names(files.state), ["active", "record.json"], step.rawValue)
            assertSealed(files.state, step.rawValue)
            XCTAssertEqual(relaunch(files.state, step.rawValue), .previous, step.rawValue)
            switch step {
            case .writeTemporary, .protectTemporary, .excludeTemporary, .readTemporary, .replaceActive:
                XCTAssertEqual(ids(files), before, step.rawValue)
            default:
                // Replacing had begun, so both names now belong to the sealed copies.
                for (now, was) in zip(ids(files), before) { XCTAssertNotEqual(now, was, step.rawValue) }
            }
        }
    }

    func testAReadBackThatIsNotExactRemovesBothFiles() {
        let damage: [(String, (LedgerFiling, URL) -> Void)] = [
            ("rewritten", { files, url in try? files.write((try? files.read(url)) ?? Data(), to: url, step: nil) }),
            ("unprotected", { files, url in files.state.files[url.path]?.protected = false }),
            ("backed up", { files, url in files.state.files[url.path]?.excluded = false }),
            ("unreadable", { files, url in files.sealReadThrowsFor = url.path }),
        ]
        for (kind, apply) in damage {
            for url in [active, record] {
                let label = "\(url.lastPathComponent) \(kind)"
                let files = LedgerFiling()
                let store = store(on: files, withPrevious: true)
                files.failStep = .writeTemporary
                // The damage arrives with the failure, after the import's opening read.
                files.onFailure = { apply(files, url) }
                XCTAssertEqual(importSecond(store), .failed, label)
                XCTAssertEqual(files.sealReadsAfterFailure, [active.path, record.path], label)
                XCTAssertEqual(names(files.state), [], label)
                XCTAssertEqual(relaunch(files.state, label), .nothing, label)
            }
        }
    }

    func testATransientReadFailureLeavesBothSealedFilesForTheNextRead() {
        for url in [active, record] {
            let files = LedgerFiling()
            let store = store(on: files, withPrevious: true)
            let previous = store.activeTerms()
            XCTAssertNotNil(previous)
            let previousIDs = ids(files)
            files.readThrowsOnceFor = url.path

            XCTAssertNil(store.activeTerms(), url.lastPathComponent)
            XCTAssertEqual(names(files.state), ["active", "record.json"], url.lastPathComponent)
            XCTAssertEqual(ids(files), previousIDs, url.lastPathComponent)
            assertSealed(files.state, url.lastPathComponent)
            XCTAssertEqual(store.activeTerms(), previous, url.lastPathComponent)
        }
    }

    func testAnUndecodableRecordLeavesBothSealedFiles() throws {
        let files = LedgerFiling()
        let store = store(on: files, withPrevious: true)
        let previous = try XCTUnwrap(store.activeTerms())
        let previousIDs = ids(files)
        let recordBytes = try files.read(record)
        files.state.files[record.path]?.data = Data("{".utf8)

        XCTAssertNil(store.activeTerms())
        XCTAssertEqual(names(files.state), ["active", "record.json"])
        XCTAssertEqual(ids(files), previousIDs)
        assertSealed(files.state, "undecodable record")

        files.state.files[record.path]?.data = recordBytes
        XCTAssertEqual(store.activeTerms(), previous)
    }

    func testFailedImportClearsRemovedFileRowsAndKeepsRowsForASealedFile() {
        let files = LedgerFiling()
        let store = store(on: files, withPrevious: true)
        let copy = sampleCopy()
        let document = ActiveDocument(
            name: "one.yaml",
            importedAt: "t1",
            summary: SummaryModel(verified: 1, total: 2, unverified: ["dates.maturity"]),
            schedule: .listed(entries: [ScheduleEntry(date: "2027-01-01", status: "primary", origin: "listed")])
        )
        let documentRoles: Set<String> = ["arrived", "summary", "schedule"]
        var screen = ScreenModel(active: document)
        let previousRows = ScreenRender.rows(model: screen, copy: copy)
        XCTAssertEqual(Set(previousRows.map(\.role)).intersection(documentRoles), documentRoles)

        screen.showFailure(.read, storedTerms: store.activeTerms())
        let keptRows = ScreenRender.rows(model: screen, copy: copy)
        XCTAssertEqual(screen.active, document)
        XCTAssertEqual(keptRows.filter { documentRoles.contains($0.role) }.map(\.text),
                       previousRows.filter { documentRoles.contains($0.role) }.map(\.text))
        XCTAssertFalse(keptRows.contains { $0.role == "empty" })

        files.failStep = .writeTemporary
        files.onFailure = { files.sealReadThrowsFor = self.active.path }
        XCTAssertEqual(importSecond(store), .failed)
        let stored = store.activeTerms()
        XCTAssertNil(stored)

        screen.showFailure(.store, storedTerms: stored)
        let rows = ScreenRender.rows(model: screen, copy: copy)
        XCTAssertNil(screen.active)
        XCTAssertEqual(rows.filter { $0.role == "empty" }.map(\.text), [copy.noFile])
        XCTAssertEqual(rows.filter { $0.role == "failure" }.map(\.text), [copy.failureStore])
        XCTAssertFalse(rows.contains { documentRoles.contains($0.role) })
    }

    func testACopyThatLosesItsAttributesFailsTheImportBeforeThePreviousFileIsTouched() {
        let files = LedgerFiling()
        let store = store(on: files, withPrevious: true)
        let before = ids(files)
        files.copyKeepsAttributes = false
        XCTAssertEqual(importSecond(store), .failed)
        XCTAssertEqual(ids(files), before)
        XCTAssertEqual(names(files.state), ["active", "record.json"])
        XCTAssertEqual(relaunch(files.state, "after the failed import"), .previous)
    }

    func testAStopInsideEitherRollbackCopyLeavesThePreviousImportWhole() throws {
        for url in [active, record] {
            let files = LedgerFiling()
            let store = store(on: files, withPrevious: true)
            files.stopOnCopyOf = url.path
            XCTAssertEqual(importSecond(store), .failed, url.lastPathComponent)
            let stopped = try XCTUnwrap(files.interruptedCopy, url.lastPathComponent)
            XCTAssertEqual(relaunch(stopped, url.lastPathComponent), .previous, url.lastPathComponent)
            XCTAssertEqual(relaunch(files.state, url.lastPathComponent), .previous, url.lastPathComponent)
        }
    }

    func testImportingTheSameFileAgainAndFailingLateKeepsTheSealedPair() {
        for step in [StorageStep.protectActive, .writeRecord, .protectRecord, .excludeRecord, .readRecord] {
            let files = LedgerFiling()
            let store = store(on: files, withPrevious: true)
            files.failStep = step
            XCTAssertEqual(store.importFile(bytes: first, name: "one.yaml", importedAt: "t1"), .failed, step.rawValue)
            XCTAssertEqual(names(files.state), ["active", "record.json"], step.rawValue)
            assertSealed(files.state, step.rawValue)
            XCTAssertEqual(relaunch(files.state, step.rawValue), .previous, step.rawValue)
        }
    }

    func testAnImportOverAPairThatNoLongerReadsBackExactlyStoresTheNewFile() throws {
        for url in [active, record] {
            let files = LedgerFiling()
            let store = store(on: files, withPrevious: true)
            try files.write(try files.read(url), to: url, step: nil)
            XCTAssertEqual(importSecond(store), .stored(exact), url.lastPathComponent)
            XCTAssertEqual(names(files.state), ["active", "record.json"], url.lastPathComponent)
            XCTAssertEqual(relaunch(files.state, url.lastPathComponent), .new, url.lastPathComponent)
        }
    }
}
