import { alchemyEnhancedApiActions } from "@account-kit/infra";
import { UseSmartAccountClientProps, useLogout, useSmartAccountClient } from "@account-kit/react";
import { Alchemy, Network } from "alchemy-sdk";
import scaffoldConfig from "~~/scaffold.config";
import { RPC_CHAIN_NAMES } from "~~/utils/scaffold-alchemy";

export const useClient = (
  config: UseSmartAccountClientProps = {
    type: "LightAccount",
  },
) => {
  const { logout } = useLogout();
  let client, address;
  try {
    const val = useSmartAccountClient(config);
    client = val.client;
    address = val.address;
  } catch (ex) {
    console.error(ex);
    logout();
  }
  const alchemy = new Alchemy({
    url: client?.transport.alchemyRpcUrl,
    network: RPC_CHAIN_NAMES[scaffoldConfig.targetNetworks[0].id] as Network,
  });
  const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
  return { client: client?.extend(enhancedApiDecorator), origClient: client, address };
};

export type Client = ReturnType<typeof useClient>["client"];
