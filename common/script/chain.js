const fs = require("fs");
const path = require("path");
const chainConfigs = require("../chainOptions.json");
const readline = require("readline");

// Parse command line arguments
const args = process.argv.slice(2);
const chainIndex = args.indexOf("-c");
if (chainIndex === -1 || !args[chainIndex + 1]) {
  const availableChains = chainConfigs
    .map((chain) => `    [${chain.shortName}]  ${chain.displayName}`)
    .join("\n");
  const exampleShortName = chainConfigs[0]?.shortName || "<shortname>";
  const exampleUsage = `\nExample: yarn chain -c ${exampleShortName}`;
  console.log(
    "No chain shortname provided with -c flag.\nAvailable chains (use the value in [brackets]):\n" +
      exampleUsage +
      availableChains
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nPlease enter a chain shortname: ", function (answer) {
    const chainShortName = answer.trim();
    const chainConfig = chainConfigs.find(
      (chain) => chain.shortName === chainShortName
    );
    if (!chainConfig) {
      console.error(
        `Error: Chain with shortname "${chainShortName}" not found`
      );
      rl.close();
      process.exit(1);
    }
    writeChainConfig(chainConfig);
    rl.close();
    process.exit(0);
  });
  return;
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

writeChainConfig(chainConfig);

function writeChainConfig(chainConfig) {
  const newConfig = {
    mainnetName: chainConfig.mainnetName,
    mainnetChainId: chainConfig.mainnetChainId,
    testnetChainId: chainConfig.testnetChainId,
    testnetChainName: chainConfig.testnetChainName,
  };
  const nextjsConfigPath = path.join(
    __dirname,
    "..",
    "..",
    "packages",
    "nextjs",
    "config",
    "chainConfig.json"
  );
  const hardhatConfigPath = path.join(
    __dirname,
    "..",
    "..",
    "packages",
    "hardhat",
    "config",
    "chainConfig.json"
  );
  try {
    fs.writeFileSync(nextjsConfigPath, JSON.stringify(newConfig, null, 2));
    fs.writeFileSync(hardhatConfigPath, JSON.stringify(newConfig, null, 2));
    console.log(
      `Successfully updated chain configuration to ${chainConfig.displayName} in both nextjs and hardhat packages`
    );
  } catch (error) {
    console.error(
      "Error writing to chainConfig.json in one or both locations:",
      error.message
    );
    process.exit(1);
  }
}
