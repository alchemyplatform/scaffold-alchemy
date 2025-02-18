import {
  arbitrum,
  arbitrumGoerli,
  arbitrumNova,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  beraChainBartio,
  goerli,
  inkMainnet,
  inkSepolia,
  mainnet,
  mekong,
  opbnbMainnet,
  opbnbTestnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  shape,
  shapeSepolia,
  soneiumMainnet,
  soneiumMinato,
  unichainMainnet,
  unichainSepolia,
  worldChain,
  worldChainSepolia,
  zora,
  zoraSepolia,
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
