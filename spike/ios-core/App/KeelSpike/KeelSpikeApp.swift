import SwiftUI

@main
struct KeelSpikeApp: App {
    @StateObject private var model = HarnessModel()

    var body: some Scene {
        WindowGroup {
            HarnessView(model: model)
        }
    }
}
