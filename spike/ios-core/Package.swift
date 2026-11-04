// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "KeelSpike",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
    ],
    products: [
        .library(name: "KeelSpikeKit", targets: ["KeelSpikeKit"]),
        .executable(name: "keel-spike-host", targets: ["KeelSpikeHost"]),
    ],
    targets: [
        .target(name: "KeelSpikeKit"),
        .executableTarget(name: "KeelSpikeHost", dependencies: ["KeelSpikeKit"]),
        .testTarget(name: "KeelSpikeTests", dependencies: ["KeelSpikeKit", "KeelSpikeHost"]),
    ]
)
