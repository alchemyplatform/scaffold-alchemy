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
import cw3dConfig from "./cw3d.config";
import { allChains } from "./utils/chainUtils";

export const hardhatAccount0PrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// If not set, it uses our default API key.
// You can get your own at https://dashboard.alchemyapi.io
const DEFAULT_ALCHEMY_API_KEY = "Aau4vg0U-46T4ZI857caO7otLxX3RVSo";
export const providerApiKey = process.env.ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY;

const DEFAULT_ALCHEMY_GAS_POLICY_ID = "f0d2920d-b0dc-4e55-ab21-2fcb483bc293";
export const gasPolicyId = process.env.ALCHEMY_GAS_POLICY_ID || DEFAULT_ALCHEMY_GAS_POLICY_ID;

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
  defaultNetwork: cw3dConfig.testnetChainName,
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
