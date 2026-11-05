# Device run

Run these steps from a fresh clone of `s90/ios-core-spike`, on the free Personal Team. Leave `KEEL_SPIKE_TEAM`, `KEEL_SPIKE_UDID` and `KEEL_SPIKE_BUNDLE_ID` in the environment. This file records none of their values.

Before the first launch, trust the developer profile on the phone: Settings > General > VPN & Device Management. Turn automatic iOS updates off until the runs end. Every timing comes from one iOS version.

Order:

1. Before any timing, one launch under `(sv)` `sv_SE` and one under `(haw)` `haw_US`, each with `-KeelProbe 1`. Read the locale lines. If the `sv` locale does not start with `sv`, stop and tell the PM before going further. The `haw` launch is recorded and does not gate.
2. Q3 fresh launches and the Q2 device parity. Five fresh launches per variant, all under `en-US`. One further launch under `sv_SE` records the Swedish hashes. Each of those launches logs identity and reversed hashes for both variants, including the tie input. The probe launches are not part of the five.
3. Q5, after those timings and hashes are on disk.
4. The profile-expiry check last, on day 8 or later. A Personal Team install lasts 7 days.

## Build, install, launch

The committed project sets no team. Its placeholder bundle id is `dev.keel.spike`. The spec's `xcodebuild` line does not pass `PRODUCT_BUNDLE_IDENTIFIER`, so the build line below adds it and takes the real id from `KEEL_SPIKE_BUNDLE_ID`.

The shell may default to another Node. Run the install and bundle steps with Node 24.22.2. `dist/` is gitignored, so a fresh clone has no `compile.js` or `standalone.js` until those steps run.

```bash
export KEEL_DATA_DIR="$(mktemp -d)"
pnpm install --frozen-lockfile
pnpm --dir spike/ios-core --ignore-workspace install --frozen-lockfile
node spike/ios-core/build.mjs
xcodebuild build -project spike/ios-core/App/KeelSpike.xcodeproj -scheme KeelSpike -configuration Release -destination "platform=iOS,id=$KEEL_SPIKE_UDID" -derivedDataPath spike/ios-core/.build/ios DEVELOPMENT_TEAM="$KEEL_SPIKE_TEAM" -allowProvisioningUpdates PRODUCT_BUNDLE_IDENTIFIER="$KEEL_SPIKE_BUNDLE_ID"
```

Install matches `devicectl device install app --help`: `--device` and the app path.

```bash
xcrun devicectl device install app --device "$KEEL_SPIKE_UDID" spike/ios-core/.build/ios/Build/Products/Release-iphoneos/KeelSpike.app
```

Launch adds `--terminate-existing` so the process is new. A reactivation does not count as a fresh launch. `devicectl device process launch --help` shows that flag, `--console`, and command-line arguments after `--`. The shared scheme builds Release and its debugger identifier is empty. The probe launches come before any timing. `-KeelProbe 1` prints locale lines and returns without a timing sample.

```bash
xcrun devicectl device process launch --device "$KEEL_SPIKE_UDID" --terminate-existing --console "$KEEL_SPIKE_BUNDLE_ID" -- -AppleLanguages "(sv)" -AppleLocale sv_SE -KeelProbe 1 -KeelVariant compile
xcrun devicectl device process launch --device "$KEEL_SPIKE_UDID" --terminate-existing --console "$KEEL_SPIKE_BUNDLE_ID" -- -AppleLanguages "(haw)" -AppleLocale haw_US -KeelProbe 1 -KeelVariant compile
```

If the `sv` lines do not show a locale starting with `sv`, stop and tell the PM. Then take five fresh launches per variant, all under `en-US`, so those five share a locale. Take one further launch under `sv_SE` so the Swedish hashes are in the log. Each non-probe launch prints both variants, the identity comparator and the reversed comparator, including the tie input. Record the locale on the line. Leave that text as printed. The `haw` probe is the haw run. It does not gate.

```bash
xcrun devicectl device process launch --device "$KEEL_SPIKE_UDID" --terminate-existing --console "$KEEL_SPIKE_BUNDLE_ID" -- -AppleLanguages "(en-US)" -AppleLocale en_US -KeelVariant compile
```

Repeat that line with `-KeelVariant standalone` for the other five. For the Swedish hashes:

```bash
xcrun devicectl device process launch --device "$KEEL_SPIKE_UDID" --terminate-existing --console "$KEEL_SPIKE_BUNDLE_ID" -- -AppleLanguages "(sv)" -AppleLocale sv_SE -KeelVariant compile
```

## Lines to keep

Copy only lines that start with `KEEL_SPIKE v1` into a file outside the repo. Leave the raw console log outside the repo. Leave signing, provisioning and install output out of that file, and leave every identifier out of it.

```text
KEEL_SPIKE v1 process pid=<pid>
KEEL_SPIKE v1 timing variant=compile kind=fresh pid=<pid> contextMs=<ms> loadTermsMs=<ms>
KEEL_SPIKE v1 timing variant=compile kind=warm-context count=20 medianMs=<ms> worstMs=<ms>
KEEL_SPIKE v1 timing variant=compile kind=warm-load count=20 medianMs=<ms> worstMs=<ms>
KEEL_SPIKE v1 locale engine=jscontext variant=compile locale=<locale>
KEEL_SPIKE v1 parity variant=compile locale=<locale> comparator=identity file=<file> sha256=<hex>
KEEL_SPIKE v1 parity variant=compile locale=<locale> comparator=reversed file=<file> sha256=<hex>
KEEL_SPIKE v1 q5 subject=import result=stored backup-excluded=true protection=<protection>
```

`variant` is `compile` or `standalone`. `comparator` is `identity` or `reversed`. The reversed comparator is a test run on that launch. It is not a host shim. The warm lines come from the warm-set control, after the fresh launches, and they are outside the fresh clock. `sh spike/ios-core/run-parity.sh --compare-device <log>` reads the parity lines, requires `en` and `sv` for both variants and both comparators, reports a haw locale when one is present, and does not require haw.

```bash
export KEEL_DATA_DIR="$(mktemp -d)"
sh spike/ios-core/run-parity.sh --compare-device <log>
```

## Q5, after the timings

Generate the stand-in from the clone, then AirDrop the export:

```bash
export KEEL_DATA_DIR="$(mktemp -d)"
node spike/ios-core/export-standin.mjs
```

`spike/ios-core/standin/export.yaml` is the synthetic export. `spike/ios-core/standin/malformed.yaml` is the synthetic malformed file. Those two files are gitignored: a committed copy of the export fails the tripwire outside `fixtures/synthetic/terms`. AirDrop the export, then use Import export. After a stored copy exists, import the malformed file and record the rejected line and column. Then:

- Schedule in 2 minutes. Force-quit the app, lock the phone, and record whether it fires.
- Request 70, and record `pending-kept`.
- Add repeating trigger, and record `repeating-pending`.
- Keychain round trip, and record `keychain`.
- Read backup flag after the first import and again after a later import replaces the file.
- Show snapshot detail. The page includes the disclaimer. Opening it from the lock screen waits until the phone is unlocked before it reads the snapshot.
- On day 8 or later, record whether pending notifications and the sandbox file are still present after a reinstall over the old build, and whether a notification fires after the profile expires.

The builder did not run the device lines.
