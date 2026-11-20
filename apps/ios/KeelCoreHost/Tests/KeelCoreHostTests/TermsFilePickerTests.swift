import Foundation
import KeelCoreHost
import UniformTypeIdentifiers
import XCTest

final class TermsFilePickerTests: XCTestCase {
    func testTermsPickerAcceptsOnlyYAML() throws {
        let allowedTypes = TermsFilePicker.allowedContentTypes
        let yaml = try XCTUnwrap(UTType(filenameExtension: "yaml"))
        XCTAssertTrue(allowedTypes.contains { yaml.conforms(to: $0) }, ".yaml must pass the picker filter")

        if let yml = UTType(filenameExtension: "yml"), !yml.isDynamic {
            XCTAssertTrue(allowedTypes.contains { yml.conforms(to: $0) }, ".yml must pass the picker filter when mapped")
        }

        XCTAssertEqual(allowedTypes, [.yaml], "The picker must use only public.yaml")
    }

    func testAppDoesNotDeclareYAMLFilenameExtensions() throws {
        let url = Repo.root().appendingPathComponent("apps/ios/Keel/Info.plist")
        let data = try ByteRead.data(from: url)
        let value = try PropertyListSerialization.propertyList(from: data, format: nil)
        let plist = try XCTUnwrap(value as? [String: Any])
        let yamlExtensions: Set<String> = ["yaml", "yml"]

        for key in ["UTImportedTypeDeclarations", "UTExportedTypeDeclarations"] {
            guard let entry = plist[key] else { continue }
            let declarations = try XCTUnwrap(entry as? [[String: Any]])
            for declaration in declarations {
                let tags = declaration["UTTypeTagSpecification"] as? [String: Any]
                let tag = tags?["public.filename-extension"]
                let extensions = tag as? [String] ?? (tag as? String).map { [$0] } ?? []
                let claims = yamlExtensions.intersection(extensions.map { $0.lowercased() })
                XCTAssertTrue(claims.isEmpty, "\(key) claims \(claims.sorted().joined(separator: ", "))")
            }
        }
    }
}
