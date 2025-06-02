const fs = require("fs");
const path = require("path");
const chainConfigs = require("../chainOptions.json");

// Parse command line arguments
const args = process.argv.slice(2);
const chainIndex = args.indexOf("-c");
if (chainIndex === -1 || !args[chainIndex + 1]) {
  console.error("Error: Please provide a chain shortname using -c flag");
  process.exit(1);
}

const chainShortName = args[chainIndex + 1];

// Find the chain configuration
const chainConfig = chainConfigs.find(
  (chain) => chain.shortName === chainShortName
);

if (!chainConfig) {
  console.error(`Error: Chain with shortname "${chainShortName}" not found`);
  process.exit(1);
}

// Create the new configuration object
const newConfig = {
  mainnetName: chainConfig.mainnetName,
  mainnetChainId: chainConfig.mainnetChainId,
  testnetChainId: chainConfig.testnetChainId,
  testnetChainName: chainConfig.testnetChainName,
};

// Write to chainConfig.json
const configPath = path.join(__dirname, "..", "chainConfig.json");
try {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  console.log(
    `Successfully updated chain configuration to ${chainConfig.displayName}`
  );
} catch (error) {
  console.error("Error writing to chainConfig.json:", error.message);
  process.exit(1);
}
