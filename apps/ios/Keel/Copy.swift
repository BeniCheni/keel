import KeelCoreHost

enum Copy {
    static let screen = ScreenCopy(
        fileProvider: "The app stores the file only in its own sandbox. It makes no network request and runs no connector. A file picked from a cloud provider such as iCloud Drive may be downloaded by that provider, outside the app, before the app receives it.",
        disclaimer: """
        keel is information only. It is not investment, tax or legal advice, and it does not recommend buying, selling or holding any security.

        The offering documents for each instrument govern. keel's display of terms, dates, levels and scenarios may be incomplete or wrong, especially where a term is marked as unverified. Any figure labelled ESTIMATE comes from a model or an assumption and is not a forecast or a value.

        keel does not know your full financial situation. Talk to your own advisor before acting on anything it shows.
        """,
        picker: "Import a terms file",
        title: "Keel",
        noFile: "No terms file is imported yet.",
        about: "About",
        arrived: "One terms file arrived.",
        omitted: "No observation, close or alert arrived with this file, so this screen shows no figure.",
        summaryHeading: "Terms summary",
        verifiedFormat: "%d of %d verified",
        unverifiedHeading: "Unverified paths",
        scheduleHeading: "Observation schedule",
        failureRead: "The file could not be read.",
        failureUTF8: "The bytes are not valid UTF-8.",
        failureCore: "The core failed to run.",
        failureInvalid: "The terms are invalid.",
        failureStore: "The file could not be stored with both attributes.",
        diagnostics: [
            "yaml-syntax": "The terms text is not valid YAML",
            "schema-line": "Line 1 is not the schema marker mln-terms/0.1 or mln-terms/0.2",
            "duplicate-key": "This key is repeated in the same mapping",
            "alias": "An anchor or alias is present in the terms text",
            "unknown-key": "This key is not defined by the terms schema",
            "missing-required": "A required field is missing",
            "wrong-type": "This value is the wrong type",
            "out-of-range": "This value is outside the accepted range",
            "invalid-date": "This value is not a real calendar date",
            "unknown-status": "This status is not a known term status",
            "status-fields": "The fields on this term do not match its status",
            "conflict-candidates": "A conflict lists fewer than two candidates",
            "source-missing": "This source is not listed in sources",
            "source-kind": "This source kind does not match the term status",
            "source-path": "This source path is not a portable relative path",
            "schedule-order": "These observation dates are not strictly increasing",
            "cusip-check-digit": "The CUSIP check digit does not match",
            "duplicate-ticker": "This ticker is repeated in the basket",
        ],
        diagnosticFallback: "This code has no message in the app (%@).",
        reasons: [
            "input-unknown": "This input is unknown.",
            "input-conflict": "This input is in conflict.",
            "input-invalid": "This input is not usable.",
            "anchor-after-maturity": "The first call observation is after maturity.",
            "outside-calendar": "This date is outside the calendar.",
            "calendar-collision": "This date collides with an earlier date.",
        ],
        reasonFallback: "This reason has no message in the app (%@).",
        importedLabel: "Imported",
        fileLabel: "File"
    )
}
