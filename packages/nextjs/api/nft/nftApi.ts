import { Nft } from "alchemy-sdk";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~~/config";
import { Client } from "~~/hooks/scaffold-eth/useClient";
import { WizardInfo } from "~~/types/hogwarts/hogwartsTypes";
import { fromHouseNumber, urlFromHouseNumber } from "~~/utils/hogwarts/hogwartUtils";

export async function fetchNftData(client: Client, nft: Nft): Promise<WizardInfo> {
  if (!client) throw new Error("Client expected to not be null");
  const { house, name, stunned } = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getWizardStatus",
    args: [BigInt(nft.tokenId)],
  });
  return {
    imageUrl: urlFromHouseNumber(house),
    house: fromHouseNumber(house),
    name,
    stunned,
    tokenId: nft.tokenId,
  };
}
