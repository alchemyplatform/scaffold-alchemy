import { Chain, createClient, http } from "viem";
import { mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const wagmiConfig = createConfig({
  chains: enabledChains,

  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http("/api/rpc/chain/" + chain.id),
      pollingInterval: scaffoldConfig.pollingInterval,
    });
  },
});
