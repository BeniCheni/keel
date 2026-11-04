import SwiftUI
import UniformTypeIdentifiers

struct HarnessView: View {
    @ObservedObject var model: HarnessModel

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 12) {
                Picker("Next launch variant", selection: $model.nextVariant) {
                    Text("compile").tag("compile")
                    Text("standalone").tag("standalone")
                }
                .pickerStyle(.segmented)
                .onChange(of: model.nextVariant) { _, _ in
                    model.saveNextVariant()
                }
                control("Run warm set", model.runWarmSet)
                control("Import export") { model.showImporter = true }
                control("Schedule in 2 minutes") { Task { await model.scheduleTwoMinutes() } }
                control("Request 70") { Task { await model.requestSeventy() } }
                control("Add repeating trigger") { Task { await model.addRepeating() } }
                control("Keychain round trip", model.keychainRoundTrip)
                control("Read backup flag", model.readBackupFlag)
                control("Show snapshot detail", model.openDetail)
                ScrollView {
                    Text(model.lines.joined(separator: "\n"))
                        .font(.system(.footnote, design: .monospaced))
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding()
            .navigationTitle("Keel spike")
            .onAppear { model.startIfNeeded() }
            .fileImporter(isPresented: $model.showImporter, allowedContentTypes: importTypes) { result in
                if case .success(let url) = result { model.importFile(url) }
                if case .failure = result { model.noteUnreadableImport() }
            }
            .sheet(isPresented: $model.showDetail) {
                ScrollView {
                    Text(model.detailText)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                }
            }
        }
    }

    private var importTypes: [UTType] {
        var types: [UTType] = [.plainText, .data]
        if let yaml = UTType(filenameExtension: "yaml") { types.insert(yaml, at: 0) }
        return types
    }

    private func control(_ title: String, _ action: @escaping () -> Void) -> some View {
        Button(title, action: action)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}
