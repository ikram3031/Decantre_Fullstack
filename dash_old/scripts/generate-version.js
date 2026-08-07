const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const packageJsonPath = path.join(rootDir, "package.json");
const coreConfigPath = path.join(rootDir, "core-config.json");
const clientConfigPath = path.join(rootDir, "client-config.json");

try {
  // Read client version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const clientVersion = packageJson.version || "0.0.0";

  // Read or create core-config.json
  let coreVersion = "1.0.0";
  if (fs.existsSync(coreConfigPath)) {
    const coreConfig = JSON.parse(fs.readFileSync(coreConfigPath, "utf-8"));
    coreVersion = coreConfig.version || "1.0.0";
  } else {
    fs.writeFileSync(coreConfigPath, JSON.stringify({ version: coreVersion }, null, 2), "utf-8");
    console.log("Created base core-config.json");
  }

  // Write to client-config.json
  const clientConfig = {
    version: {
      core: coreVersion,
      client: clientVersion
    }
  };

  fs.writeFileSync(clientConfigPath, JSON.stringify(clientConfig, null, 2), "utf-8");
  console.log(`Successfully generated client-config.json with Core: ${coreVersion}, Client: ${clientVersion}`);
} catch (error) {
  console.error("Error generating version config:", error);
  process.exit(1);
}
