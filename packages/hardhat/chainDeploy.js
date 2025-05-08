#!/usr/bin/env node

const { execSync } = require("child_process");
const { chainConfig } = require("@scaffold-alchemy/shared");

// Parse command line arguments
const args = process.argv.slice(2);
const isMainnet = args.includes("-mainnet");

// Determine which network to use
const networkName = isMainnet ? chainConfig.mainnetName : chainConfig.testnetChainName;

console.log(`Deploying to ${networkName}...`);

try {
  // Execute hardhat deploy with the appropriate network
  execSync(`npx hardhat deploy --network ${networkName}`, {
    stdio: "inherit",
    cwd: __dirname,
  });
} catch (error) {
  console.error("Deployment failed:", error);
  process.exit(1);
}
