import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  zora,
  zoraSepolia,
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
  beraChainBartio,
  inkMainnet,
  inkSepolia,
  arbitrumNova,
  mekong,
} from "@account-kit/infra";

const allChains = [
  // Mainnet chains
  mainnet,
  arbitrum,
  optimism,
  base,
  polygon,
  zora,
  worldChain,
  shape,
  unichainMainnet,
  soneiumMainnet,
  opbnbMainnet,
  inkMainnet,
  arbitrumNova,

  // Testnet chains
  goerli,
  arbitrumGoerli,
  arbitrumSepolia,
  optimismGoerli,
  optimismSepolia,
  baseGoerli,
  baseSepolia,
  polygonMumbai,
  polygonAmoy,
  zoraSepolia,
  worldChainSepolia,
  shapeSepolia,
  unichainSepolia,
  soneiumMinato,
  opbnbTestnet,
  inkSepolia,
  mekong,
  sepolia,
  beraChainBartio,
];

const chains = Object.fromEntries(allChains.map(chain => [chain.id, chain]));

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
