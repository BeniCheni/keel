import Foundation
import JavaScriptCore

public struct HostGlobals: Equatable {
    public var console: String
    public var url: String
    public var function: String
    public var fetch: String
    public var xmlHttpRequest: String
    public var webSocket: String
    public var process: String

    public var descriptionLine: String {
        "console=\(console) url=\(url) function=\(function) fetch=\(fetch) xmlHttpRequest=\(xmlHttpRequest) webSocket=\(webSocket) process=\(process)"
    }
}

public enum CoreError: Error, Equatable {
    case noContext
    case exception
    case missingExport
}

/// JavaScriptCore already provides `console` and `Function` here. `URL` is absent.
/// This host adds no shim. `fetch`, `XMLHttpRequest`, and `WebSocket` stay undefined.
public final class CoreSession {
    public let shims: [String]
    public let globals: HostGlobals
    private let context: JSContext

    public init(bundleSource: String) throws {
        guard let context = JSContext() else { throw CoreError.noContext }
        self.context = context
        self.shims = []
        self.globals = Self.readGlobals(context)
        context.exceptionHandler = { _, _ in }
        context.evaluateScript(bundleSource)
        if context.exception != nil {
            context.exception = nil
            throw CoreError.exception
        }
        context.evaluateScript(Self.helper)
        if context.exception != nil {
            context.exception = nil
            throw CoreError.exception
        }
        let exported = context.objectForKeyedSubscript("KeelCore")
        if exported == nil || exported?.isUndefined == true {
            throw CoreError.missingExport
        }
    }

    public func kinds() throws -> [String: String] {
        let raw = try evalString("keelSpikeKinds()")
        let data = Data(raw.utf8)
        let object = try JSONSerialization.jsonObject(with: data)
        guard let map = object as? [String: String] else { throw CoreError.exception }
        return map
    }

    public func locale() throws -> String {
        try evalString("keelSpikeLocale()")
    }

    public func line(text: String, file: String) throws -> String {
        context.exception = nil
        let function = context.objectForKeyedSubscript("keelSpikeLine")
        let value = function?.call(withArguments: [text, file])
        if context.exception != nil {
            context.exception = nil
            throw CoreError.exception
        }
        guard let value, value.isString, let line = value.toString() else { throw CoreError.exception }
        return line
    }

    private func evalString(_ source: String) throws -> String {
        context.exception = nil
        let value = context.evaluateScript(source)
        if context.exception != nil {
            context.exception = nil
            throw CoreError.exception
        }
        guard let value, let text = value.toString(), !value.isUndefined else { throw CoreError.exception }
        return text
    }

    private static func readGlobals(_ context: JSContext) -> HostGlobals {
        func kind(_ name: String) -> String {
            context.evaluateScript("typeof \(name)")?.toString() ?? "undefined"
        }
        return HostGlobals(
            console: kind("console"),
            url: kind("URL"),
            function: kind("Function"),
            fetch: kind("fetch"),
            xmlHttpRequest: kind("XMLHttpRequest"),
            webSocket: kind("WebSocket"),
            process: kind("process")
        )
    }

    private static let helper = """
    function keelSpikeLine(text, file) {
      const result = KeelCore.loadTerms(text, file);
      const line = { file: file, result: result };
      if (result && result.ok) line.summary = KeelCore.verificationSummary(result.terms);
      return JSON.stringify(line);
    }
    function keelSpikeLocale() {
      return new Intl.Collator().resolvedOptions().locale;
    }
    function keelSpikeKinds() {
      return JSON.stringify({
        dateFlags: typeof KeelCore.dateFlags,
        loadTerms: typeof KeelCore.loadTerms,
        verificationSummary: typeof KeelCore.verificationSummary
      });
    }
    """
}
