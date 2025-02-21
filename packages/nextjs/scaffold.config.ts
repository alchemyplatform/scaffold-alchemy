import cw3dConfig from "./cw3d.config";
import * as chains from "viem/chains";

const chain = Object.values(chains).find(chain => chain.id === cw3dConfig.testnetChainId);
if (!chain) {
  throw new Error(`Chain with ID ${cw3dConfig.testnetChainId} not found`);
}

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  expectedUserOpTime: number;
};

export const DEFAULT_ALCHEMY_API_KEY = "Aau4vg0U-46T4ZI857caO7otLxX3RVSo";

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chain],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is a default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // This is the expected time it takes for a user operation to be included in a block.
  // This is used to calculate the progress of the transaction.
  // set it to 0 to disable the progress bar
  expectedUserOpTime: 10_000,

  // This is our default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
