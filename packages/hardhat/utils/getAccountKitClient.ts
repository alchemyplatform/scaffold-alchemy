import "dotenv/config";
import { alchemy, createAlchemySmartAccountClient } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
import { LocalAccountSigner } from "@aa-sdk/core";
import type { Chain, Hex } from "viem";
import { gasPolicyId, hardhatAccount0PrivateKey, providerApiKey } from "../hardhat.config";

const signingKey = (process.env.SIGNING_KEY || hardhatAccount0PrivateKey) as Hex;

const alchemyTransport = alchemy({
  apiKey: providerApiKey,
});

export async function getAccountKitClient(chain: Chain) {
  return createAlchemySmartAccountClient({
    transport: alchemyTransport,
    policyId: gasPolicyId,
    chain,
    account: await createLightAccount({
      chain,
      transport: alchemyTransport,
      signer: LocalAccountSigner.privateKeyToAccountSigner(signingKey),
    }),
  });
}
