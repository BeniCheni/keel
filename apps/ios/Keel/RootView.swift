import KeelCoreHost
import SwiftUI
import UniformTypeIdentifiers

struct RootView: View {
    @ObservedObject var model: AppModel

    var body: some View {
        NavigationStack {
            List {
                ForEach(leading) { row in
                    line(row)
                }
                Section {
                    ForEach(aboutBody) { row in
                        Text(row.text)
                    }
                } header: {
                    Text(aboutTitle)
                }
            }
            .navigationTitle(model.title)
            .fileImporter(
                isPresented: $model.picking,
                allowedContentTypes: [termsType],
                allowsMultipleSelection: false,
                onCompletion: model.finishPick
            )
        }
    }

    private var termsType: UTType {
        UTType("app.keel.yaml") ?? .plainText
    }

    private var leading: [ScreenRow] {
        model.rows.filter { $0.role != "about" }
    }

    private var aboutBody: [ScreenRow] {
        model.rows.filter { $0.role == "about" }.dropFirst().map { $0 }
    }

    private var aboutTitle: String {
        model.rows.first { $0.role == "about" }?.text ?? ""
    }

    @ViewBuilder
    private func line(_ row: ScreenRow) -> some View {
        if row.role == "picker" {
            Button(action: { model.picking = true }) {
                Text(row.text)
            }
        } else {
            Text(row.text)
        }
    }
}
