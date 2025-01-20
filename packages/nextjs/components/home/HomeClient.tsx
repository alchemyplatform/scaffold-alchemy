"use client";

import { useEffect, useMemo, useState } from "react";
import { useSendUserOperation } from "@account-kit/react";
import { nftWizardsByHouse } from "~~/api/graphql/graphQlRequests";
import { fetchNftData } from "~~/api/nft/nftApi";
import MyWizard from "~~/components/home/MyWizard";
import WizardHouses from "~~/components/home/WizardHouses";
import WizardList from "~~/components/home/WizardList";
import { CONTRACT_ADDRESS } from "~~/config";
import { useClient } from "~~/hooks/scaffold-eth/useClient";
import { WizardInfo, WizardsInHouses } from "~~/types/hogwarts/hogwartsTypes";

export const HomeClient = () => {
  const { address, client } = useClient();
  const { sendUserOperationAsync } = useSendUserOperation({
    client: client,
    waitForTxn: true,
  });
  const [myWizard, setMyWizard] = useState<WizardInfo | null>(null);
  const [wizards, setWizards] = useState<WizardsInHouses>({
    Hufflepuff: [],
    Ravenclaw: [],
    Gryffindor: [],
    Slytherin: [],
  });

  const hasClient = useMemo(() => !!client, [client]);
  const hasSendUserOperationAsync = useMemo(() => !!sendUserOperationAsync, [sendUserOperationAsync]);

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
    const promiseMyWizard = promiseMyNfts.then(async ({ ownedNfts }): Promise<WizardInfo | null> => {
      if (!ownedNfts.length) return null;
      const [nft] = ownedNfts;

      return await fetchNftData(client, nft);
    });

    (async () => {
      const settingWizards = await promiseWizardsByHouse;
      const settingMyWizard = await promiseMyWizard;
      setWizards(settingWizards);
      setMyWizard(settingMyWizard);
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
