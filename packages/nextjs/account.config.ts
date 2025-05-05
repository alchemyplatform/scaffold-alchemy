// @noErrors
import scaffoldConfig from "./scaffold.config";
import { alchemy } from "@account-kit/infra";
import { AuthType, cookieStorage, createConfig } from "@account-kit/react";
import { getChainById } from "@scaffold-alchemy/shared";
import { QueryClient } from "@tanstack/react-query";
import { Chain } from "viem";

const authSections: AuthType[][] = [[{ type: "email" }], [{ type: "social", authProviderId: "google", mode: "popup" }]];

if (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  authSections.push([
    {
      type: "external_wallets",
      walletConnect: { projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID },
    },
  ]);
}

const chainId = scaffoldConfig.targetNetworks[0].id;
const chain = getChainById(chainId) as Chain;

export const config = createConfig(
  {
    transport: alchemy({
      rpcUrl: "/api/rpc/chain/" + chainId,
    }),
    policyId: "<inserted-by-backend>",
    chain,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
  },
  {
    auth: {
      sections: authSections,
      addPasskeyOnSignup: false,
    },
  },
);

export const queryClient = new QueryClient();
