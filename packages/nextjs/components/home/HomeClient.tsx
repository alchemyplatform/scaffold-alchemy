"use client";

import { useEffect, useMemo, useState } from "react";
import { useSendUserOperation } from "@account-kit/react";
import { Nft } from "alchemy-sdk";
import { nftWizardsByHouse } from "~~/api/graphql/graphQlRequests";
import MyWizard from "~~/components/home/MyWizard";
import WizardHouses from "~~/components/home/WizardHouses";
import WizardList from "~~/components/home/WizardList";
import { CONTRACT_ADDRESS } from "~~/config";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useClient } from "~~/hooks/scaffold-eth/useClient";
import { WizardInfo, WizardsInHouses } from "~~/types/hogwarts/hogwartsTypes";
import { fromHouseNumber, urlFromHouseNumber } from "~~/utils/hogwarts/hogwartUtils";

export const HomeClient = () => {
  const { address, client } = useClient();
  const { sendUserOperationAsync } = useSendUserOperation({
    client: client,
    waitForTxn: true,
  });
  const [myWizard, setMyWizard] = useState<WizardInfo | null>(null);
  const [myNfts, setMyNfts] = useState<Nft | null>(null);
  const { data: myStatus } = useScaffoldReadContract({
    watch: true,
    contractName: "HogwartsTournament",
    functionName: "getWizardStatus",
    args: [BigInt(myNfts?.tokenId || 0)],
  });
  const [wizards, setWizards] = useState<WizardsInHouses>({
    Hufflepuff: [],
    Ravenclaw: [],
    Gryffindor: [],
    Slytherin: [],
  });

  const hasClient = useMemo(() => !!client, [client]);
  const hasSendUserOperationAsync = useMemo(() => !!sendUserOperationAsync, [sendUserOperationAsync]);

  useEffect(() => {
    if (!myStatus) return;
    if (!myNfts) return;
    const { house, name, stunned } = myStatus;

    setMyWizard({
      imageUrl: urlFromHouseNumber(house),
      house: fromHouseNumber(house),
      name,
      stunned,
      tokenId: myNfts?.tokenId,
    });
  }, [myNfts, myStatus]);
  useEffect(updateHouses, [hasSendUserOperationAsync, hasClient, address]);

  function updateHouses() {
    if (!client) return;
    if (!address) return;
    if (!sendUserOperationAsync) return;

    const promiseWizardsByHouse = nftWizardsByHouse();
    const promiseMyNfts = client.nft.getNftsForOwner(address, {
      pageSize: 1,
      contractAddresses: [CONTRACT_ADDRESS],
    });
    (async () => {
      const settingWizards = await promiseWizardsByHouse;
      const settingMyNfts = await promiseMyNfts;
      setMyNfts(settingMyNfts.ownedNfts[0]);
      setWizards(settingWizards);
    })();
  }

  if (!client) return <div>Please Login...</div>;

  return (
    <div className="flex justify-center items-center">
      <div>
        <WizardHouses wizards={wizards} />
        <MyWizard myWizard={myWizard} updateHouses={updateHouses} />
        <WizardList wizards={wizards} myWizard={myWizard} updateHouses={updateHouses} />
      </div>
    </div>
  );
};
