import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
  worldChain,
  worldChainSepolia,
  shape,
  shapeSepolia,
  unichainMainnet,
  unichainSepolia,
  soneiumMinato,
  soneiumMainnet,
  opbnbTestnet,
  opbnbMainnet,
  inkMainnet,
  inkSepolia,
} from "@account-kit/infra";

export const allChains = [
  // Mainnet chains
  { chain: mainnet, name: "eth-mainnet" },
  { chain: arbitrum, name: "arb-mainnet" },
  { chain: optimism, name: "opt-mainnet" },
  { chain: base, name: "base-mainnet" },
  { chain: polygon, name: "polygon-mainnet" },
  { chain: worldChain, name: "worldchain-mainnet" },
  { chain: shape, name: "shape-mainnet" },
  { chain: unichainMainnet, name: "unichain-mainnet" },
  { chain: soneiumMainnet, name: "soneium-mainnet" },
  { chain: opbnbMainnet, name: "opbnb-mainnet" },
  { chain: inkMainnet, name: "ink-mainnet" },

  // Testnet chains
  { chain: sepolia, name: "eth-sepolia" },
  { chain: arbitrumSepolia, name: "arb-sepolia" },
  { chain: optimismSepolia, name: "opt-sepolia" },
  { chain: baseSepolia, name: "base-sepolia" },
  { chain: polygonMumbai, name: "polygon-mumbai" },
  { chain: worldChainSepolia, name: "worldchain-sepolia" },
  { chain: shapeSepolia, name: "shape-sepolia" },
  { chain: unichainSepolia, name: "unichain-sepolia" },
  { chain: soneiumMinato, name: "soneium-minato" },
  { chain: opbnbTestnet, name: "opbnb-testnet" },
  { chain: inkSepolia, name: "ink-sepolia" },
];

const chains = Object.fromEntries(allChains.map(({ chain }) => [chain.id, chain]));

/**
 * Gets a chain configuration by its chain ID
 * @param {string | number} chainId - The chain ID to look up
 * @returns {import("viem").Chain | undefined} The chain configuration if found, undefined otherwise
 */
export function getChainById(chainId: string | number) {
  // Convert chainId to string for consistent lookup
  const id = chainId.toString();
  return chains[id];
}
