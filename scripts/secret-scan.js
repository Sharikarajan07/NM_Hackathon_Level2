const { execSync } = require("child_process");

const patterns = [
  { name: "Google OAuth Client Secret", regex: /GOCSPX-[A-Za-z0-9_-]{20,}/ },
  { name: "Google API Key", regex: /AIza[0-9A-Za-z_-]{35}/ },
  { name: "GitHub Token", regex: /ghp_[0-9A-Za-z]{36}/ },
  { name: "GitHub PAT", regex: /github_pat_[0-9A-Za-z_]{20,}/ },
  { name: "Slack Token", regex: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: "Stripe Secret Key", regex: /sk_(?:live|test)_[0-9A-Za-z]{10,}/ },
  { name: "Private Key", regex: /-----BEGIN (?:RSA |EC |)PRIVATE KEY-----/ },
];

function getStagedDiff() {
  return execSync("git diff --cached -U0 --diff-filter=AM", { encoding: "utf8" });
}

function scan(diffText) {
  const findings = [];
  const lines = diffText.split(/\r?\n/);

  for (const line of lines) {
    if (!line.startsWith("+") || line.startsWith("+++")) {
      continue;
    }

    const addedLine = line.slice(1);
    for (const pattern of patterns) {
      if (pattern.regex.test(addedLine)) {
        findings.push({ name: pattern.name, line: addedLine.trim() });
      }
    }
  }

  return findings;
}

try {
  const diff = getStagedDiff();
  const findings = scan(diff);

  if (findings.length > 0) {
    console.error("\nBlocked commit: potential secrets found in staged changes.");
    for (const finding of findings) {
      console.error(`- ${finding.name}: ${finding.line}`);
    }
    console.error("\nRemove secrets, or move them to environment variables before committing.");
    process.exit(1);
  }
} catch (error) {
  console.warn("Secret scan skipped (git diff failed).");
  process.exit(0);
}
