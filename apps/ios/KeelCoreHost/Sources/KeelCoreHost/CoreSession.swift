import Foundation
import JavaScriptCore

public struct HostGlobals: Equatable {
    public var fetch: String
    public var xmlHttpRequest: String
    public var webSocket: String
}

public enum CoreError: Error, Equatable {
    case noContext
    case exception
    case missingExport
}

public final class CoreSession {
    public let shims: [String]
    public let globals: HostGlobals
    private let context: JSContext

    public init(bundleSource: String, reversedComparator: Bool = false) throws {
        guard let context = JSContext() else { throw CoreError.noContext }
        self.context = context
        self.shims = []
        context.exceptionHandler = { _, _ in }
        if reversedComparator {
            context.evaluateScript(Self.reversedComparator)
            if context.exception != nil {
                context.exception = nil
                throw CoreError.exception
            }
        }
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
        self.globals = Self.readGlobals(context)
    }

    public func locale() throws -> String {
        try evalString("keelLocale()")
    }

    public func parityLine(text: String, file: String) throws -> String {
        try call("keelParityLine", text, file)
    }

    public func timeLine(text: String, file: String) throws -> String {
        try call("keelTimeLine", text, file)
    }

    public func screenJSON(text: String, file: String) throws -> String {
        try call("keelScreen", text, file)
    }

    private func call(_ name: String, _ text: String, _ file: String) throws -> String {
        context.exception = nil
        let function = context.objectForKeyedSubscript(name)
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
            fetch: kind("fetch"),
            xmlHttpRequest: kind("XMLHttpRequest"),
            webSocket: kind("WebSocket")
        )
    }

    private static let reversedComparator = """
    (function () {
      var rev = function (a, b) {
        a = String(a);
        b = String(b);
        return a < b ? 1 : a > b ? -1 : 0;
      };
      String.prototype.localeCompare = function (other) { return rev(this, other); };
      var RealCollator = Intl.Collator;
      function ReversedCollator(locales, options) {
        var collator = new RealCollator(locales, options);
        Object.defineProperty(collator, "compare", { configurable: true, get: function () { return rev; } });
        return collator;
      }
      ReversedCollator.prototype = RealCollator.prototype;
      ReversedCollator.supportedLocalesOf = function (locales, options) {
        return RealCollator.supportedLocalesOf(locales, options);
      };
      Intl.Collator = ReversedCollator;
      var names = ["toLocaleString", "toLocaleLowerCase", "toLocaleUpperCase", "toLocaleDateString", "toLocaleTimeString"];
      [String.prototype, Number.prototype, Date.prototype, Array.prototype].forEach(function (proto) {
        names.forEach(function (name) {
          if (typeof proto[name] !== "function") return;
          var real = proto[name];
          proto[name] = function () {
            var value = real.apply(this, arguments);
            return "\\u0001" + String(value);
          };
        });
      });
    })();
    """

    private static let helper = """
    function keelTimeLine(text, file) {
      const result = KeelCore.loadTerms(text, file);
      const line = { file: file, result: result };
      if (result && result.ok) line.summary = KeelCore.verificationSummary(result.terms);
      return JSON.stringify(line);
    }
    function keelParityLine(text, file) {
      const result = KeelCore.loadTerms(text, file);
      const line = { file: file, result: result, summary: null, schedule: null };
      if (result && result.ok) {
        line.summary = KeelCore.verificationSummary(result.terms);
        line.schedule = KeelCore.observationSchedule(result.terms, KeelCore.nyseRulesCalendar());
      }
      return JSON.stringify(line);
    }
    function keelScreen(text, file) {
      let result;
      try {
        result = KeelCore.loadTerms(text, file);
      } catch (error) {
        return JSON.stringify({ ok: false, core: true });
      }
      if (!result || result.ok !== true) {
        const errors = result && result.errors ? result.errors.map(function (item) {
          return { line: item.line, code: item.code };
        }) : [];
        return JSON.stringify({ ok: false, errors: errors });
      }
      return JSON.stringify({
        ok: true,
        summary: KeelCore.verificationSummary(result.terms),
        schedule: KeelCore.observationSchedule(result.terms, KeelCore.nyseRulesCalendar())
      });
    }
    function keelLocale() {
      return new Intl.Collator().resolvedOptions().locale;
    }
    """
}
