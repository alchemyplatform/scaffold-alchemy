import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";
import { ALCHEMY_CONFIG, allChains, chainConfig } from "@scaffold-alchemy/shared";

export const hardhatAccount0PrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
export const providerApiKey = ALCHEMY_CONFIG.ALCHEMY_API_KEY;
export const gasPolicyId = ALCHEMY_CONFIG.ALCHEMY_GAS_POLICY_ID;

const getAlchemyUrl = (name: string) => `https://${name}.g.alchemy.com/v2/${providerApiKey}`;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  // feel free to manually change this to any network in the chainUtils.ts file
  // use the name in any of those objects as you need
  defaultNetwork: chainConfig.testnetChainName,
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    ...Object.fromEntries(
      allChains.map(({ name }) => [
        name,
        {
          url: getAlchemyUrl(name),
          // not really necessary since we're using AA
          // however, without this, hardhat will make a call out to eth_accounts
          // which may not be supported for some networks
          accounts: [hardhatAccount0PrivateKey],
        },
      ]),
    ),
  },
};

// Extend the deploy task
task("deploy").setAction(async (args, hre, runSuper) => {
  // Run the original deploy task
  await runSuper(args);
  // Force run the generateTsAbis script
  await generateTsAbis(hre);
});

export default config;
