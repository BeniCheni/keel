import { verifyDeterminism } from "./check.mjs";

const result = verifyDeterminism(process.cwd());
if (result.stdout) process.stdout.write(result.stdout);
process.exit(result.status);
