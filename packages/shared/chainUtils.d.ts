import { Chain } from "viem";

export interface ChainInfo {
  chain: Chain;
  name: string;
}

export const allChains: ChainInfo[];

export function getChainById(chainId: number | string): Chain | undefined;
