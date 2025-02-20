import { alchemyEnhancedApiActions } from "@account-kit/infra";
import { UseSmartAccountClientProps, useSmartAccountClient } from "@account-kit/react";
import { Alchemy, Network } from "alchemy-sdk";
import scaffoldConfig from "~~/scaffold.config";
import { RPC_CHAIN_NAMES } from "~~/utils/scaffold-alchemy";

export const useClient = (
  config: UseSmartAccountClientProps = {
    type: "LightAccount",
  },
) => {
  const alchemy = new Alchemy({
    apiKey: scaffoldConfig.alchemyApiKey,
    network: RPC_CHAIN_NAMES[scaffoldConfig.targetNetworks[0].id] as Network,
  });
  const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
  const { client, address } = useSmartAccountClient(config);
  return { client: client?.extend(enhancedApiDecorator), origClient: client, address };
};

export type Client = ReturnType<typeof useClient>["client"];
