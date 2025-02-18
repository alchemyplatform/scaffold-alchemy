import { alchemyEnhancedApiActions } from "@account-kit/infra";
import { UseSmartAccountClientProps, useSmartAccountClient } from "@account-kit/react";
import { Alchemy, Network } from "alchemy-sdk";
import scaffoldConfig from "~~/scaffold.config";

export const useClient = (
  config: UseSmartAccountClientProps = {
    type: "LightAccount",
  },
) => {
  const alchemy = new Alchemy({
    apiKey: scaffoldConfig.alchemyApiKey,
    network: Network.ARB_SEPOLIA,
  });
  const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
  const { client, address } = useSmartAccountClient(config);
  return { client: client?.extend(enhancedApiDecorator), origClient: client, address };
};

export type Client = ReturnType<typeof useClient>["client"];
