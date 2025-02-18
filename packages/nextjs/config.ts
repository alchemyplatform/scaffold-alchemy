// @noErrors
import scaffoldConfig from "./scaffold.config";
import { getChainById } from "./utils/scaffold-alchemy/chainUtils";
import { alchemy } from "@account-kit/infra";
import { AuthType, cookieStorage, createConfig } from "@account-kit/react";
import { QueryClient } from "@tanstack/react-query";

const authSections: AuthType[][] = [[{ type: "email" }], [{ type: "social", authProviderId: "google", mode: "popup" }]];

if (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  authSections.push([
    {
      type: "external_wallets",
      walletConnect: { projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID },
    },
  ]);
}

const DEFAULT_ALCHEMY_GAS_POLICY_ID = "f0d2920d-b0dc-4e55-ab21-2fcb483bc293";
const policyId = process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID || DEFAULT_ALCHEMY_GAS_POLICY_ID;

export const config = createConfig(
  {
    transport: alchemy({ apiKey: scaffoldConfig.alchemyApiKey }),
    policyId,
    chain: getChainById(scaffoldConfig.targetNetworks[0].id),
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
