const raw = process.argv[2] ?? process.env.NEEDS;
if (raw === undefined || raw === "") {
  console.error("needs-check: missing needs JSON");
  process.exit(1);
}

let needs;
try {
  needs = JSON.parse(raw);
} catch {
  console.error("needs-check: invalid JSON");
  process.exit(1);
}

if (needs === null || typeof needs !== "object" || Array.isArray(needs)) {
  console.error("needs-check: needs must be an object");
  process.exit(1);
}

for (const [name, job] of Object.entries(needs)) {
  const result = job && typeof job === "object" ? job.result : undefined;
  if (result !== "success") {
    console.error(`needs-check: ${name} result is ${String(result)}`);
    process.exit(1);
  }
}
