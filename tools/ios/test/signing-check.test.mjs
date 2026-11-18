import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { signingHits } from "../signing-check.mjs";
import { NESTED_RUN_TIMEOUT_MS, commitAll, git, repoRoot, run, tempGit, write } from "../../acceptance/test/helpers.mjs";

function tracked(files) {
  const repo = tempGit();
  for (const [rel, body] of Object.entries(files)) {
    write(repo.root, rel, body);
  }
  commitAll(repo.root, "plant");
  return repo;
}

test("each planted signing form fails and the head passes", () => {
  const team = "ABCD123456";
  const forms = [
    `DEVELOPMENT_TEAM = ${team}\n`,
    `DEVELOPMENT_TEAM = "${team}"\n`,
    `DEVELOPMENT_TEAM[sdk=iphoneos*] = ${team}\n`,
    `PROVISIONING_PROFILE_SPECIFIER = ${team}\n`,
    `PROVISIONING_PROFILE_SPECIFIER = "${team}"\n`,
    `PROVISIONING_PROFILE_SPECIFIER[sdk=iphoneos*] = "${team}"\n`,
  ];
  for (const body of forms) {
    const repo = tracked({ "apps/ios/Config.xcconfig": body });
    try {
      const result = signingHits(repo.root);
      expect(result.ok).toBe(true);
      expect(result.status).toBe(1);
    } finally {
      repo.cleanup();
    }
  }
  const included = tracked({
    "apps/ios/Team.xcconfig": `DEVELOPMENT_TEAM = ${team}\n`,
    "apps/ios/Config.xcconfig": "#include \"Team.xcconfig\"\n",
  });
  try {
    expect(signingHits(included.root).status).toBe(1);
  } finally {
    included.cleanup();
  }
  const profile = tracked({ "apps/ios/Dev.mobileprovision": "synthetic\n" });
  try {
    expect(signingHits(profile.root).status).toBe(1);
  } finally {
    profile.cleanup();
  }
  const legacy = "0123456789ABCDEF0123456789ABCDEF01234567";
  const modern = "01234567-89ABCDEF01234567";
  for (const id of [legacy, modern]) {
    const repo = tracked({ "apps/ios/Keel/Device.swift": `let id = "${id}"\n` });
    try {
      expect(signingHits(repo.root).status).toBe(1);
    } finally {
      repo.cleanup();
    }
  }
  expect(run(process.execPath, ["tools/ios/signing-check.mjs", repoRoot]).status).toBe(0);
  expect(git(repoRoot, ["check-ignore", "-q", "apps/ios/Local.xcconfig"]).status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);
