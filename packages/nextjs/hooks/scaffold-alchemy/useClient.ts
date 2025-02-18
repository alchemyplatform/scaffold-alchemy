import { alchemyEnhancedApiActions } from "@account-kit/infra";
import { UseSmartAccountClientProps, useSmartAccountClient } from "@account-kit/react";
import { Alchemy, Network } from "alchemy-sdk";
import { apiKey } from "~~/config";

export const useClient = (
  config: UseSmartAccountClientProps = {
    type: "LightAccount",
  },
) => {
  const alchemy = new Alchemy({
    apiKey,
    network: Network.ARB_SEPOLIA,
  });
  const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
  const { client, address } = useSmartAccountClient(config);
  return { client: client?.extend(enhancedApiDecorator), origClient: client, address };
};

export type Client = ReturnType<typeof useClient>["client"];
