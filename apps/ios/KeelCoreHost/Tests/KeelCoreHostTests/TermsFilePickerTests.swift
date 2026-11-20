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
}
