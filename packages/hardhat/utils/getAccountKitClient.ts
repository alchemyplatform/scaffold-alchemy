import "dotenv/config";
import { alchemy, createAlchemySmartAccountClient } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
import { LocalAccountSigner } from "@aa-sdk/core";
import type { Chain } from "viem";

const signingKey = process.env.SIGNING_KEY as `0x${string}`;

const alchemyTransport = alchemy({
  apiKey: process.env.ALCHEMY_API_KEY!,
});

export async function getAccountKitClient(chain: Chain) {
  return createAlchemySmartAccountClient({
    transport: alchemyTransport,
    policyId: process.env.GAS_POLICY,
    chain,
    account: await createLightAccount({
      chain,
      transport: alchemyTransport,
      signer: LocalAccountSigner.privateKeyToAccountSigner(signingKey),
    }),
  });
}
