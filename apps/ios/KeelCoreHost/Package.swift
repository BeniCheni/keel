// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "KeelCoreHost",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
    ],
    products: [
        .library(name: "KeelCoreHost", targets: ["KeelCoreHost"]),
        .executable(name: "keel-ios-host", targets: ["KeelIOSHost"]),
    ],
    targets: [
        .target(name: "KeelCoreHost"),
        .executableTarget(name: "KeelIOSHost", dependencies: ["KeelCoreHost"]),
        .testTarget(name: "KeelCoreHostTests", dependencies: ["KeelCoreHost", "KeelIOSHost"]),
    ]
)
