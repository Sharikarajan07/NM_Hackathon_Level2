const { execSync } = require("child_process");

function run(command) {
  execSync(command, { stdio: "inherit" });
}

try {
  run("git config core.hooksPath .githooks");
  console.log("Git hooks path set to .githooks");
} catch (error) {
  console.warn("Could not set git hooks path. Run: git config core.hooksPath .githooks");
  process.exit(0);
}
