"use client";

import { useEffect, useMemo, useState } from "react";
import { Wizard } from "./Wizard";
import { WizardSpell } from "./WizardSpell";
import { WizardData, wizardData } from "./mint/wizardData";
import { useSendUserOperation } from "@account-kit/react";
import { NextPage } from "next";
import { encodeFunctionData } from "viem";
import { Address } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useClient } from "~~/hooks/scaffold-eth/useClient";

export const CONTRACT_ADDRESS = deployedContracts[421614].HogwartsTournament.address;

type House = WizardData["name"];
export type WizardInfo = {
  imageUrl: string;
  stunned: boolean;
  house: House;
  tokenId: string;
};
export type CurrentWizardProps = {
  client: Client | undefined;
  myWizard: WizardInfo | null;
  otherWizard: WizardInfo;
};
export type Client = ReturnType<typeof useClient>["client"];

const keys = Object.keys as <T>(o: T) => (keyof T)[];

const hogwartsTournamentAbi = deployedContracts[421614].HogwartsTournament.abi;
const Home: NextPage = () => {
  const { address, client } = useClient();
  const { sendUserOperationAsync } = useSendUserOperation({
    client: client,
    waitForTxn: true,
  });
  const [points] = useState({
    Hufflepuff: { frozen: 0, points: 0 },
    Ravenclaw: { frozen: 0, points: 0 },
    Gryffindor: { frozen: 0, points: 0 },
    Slytherin: { frozen: 0, points: 0 },
  });
  const [myWizard] = useState<null | WizardInfo>(null);
  const [wizards] = useState<Record<House, WizardInfo[]>>({
    Hufflepuff: [],
    Ravenclaw: [],
    Gryffindor: [],
    Slytherin: [],
  });

  const hasClient = useMemo(() => !!client, [client]);
  const hasSendUserOperationAsync = useMemo(() => !!sendUserOperationAsync, [sendUserOperationAsync]);

  useEffect(() => {
    if (!client) return;
    if (!address) return;
    if (!sendUserOperationAsync) return;
    debugger;
    const promiseNfts = client.nft.getNftsForContract(deployedContracts[421614].HogwartsTournament.address);
    const promiseMyNfts = client.nft.getNftsForOwner(address, {
      contractAddresses: [deployedContracts[421614].HogwartsTournament.address],
      pageSize: 1,
    });
    const promiseMyHouse = promiseMyNfts.then(async ({ ownedNfts }) => {
      if (!ownedNfts.length) return;
      const [nft] = ownedNfts;

      type HogwartsTournamentAbi = (typeof deployedContracts)[421614]["HogwartsTournament"]["abi"];
      debugger;

      const op = await sendUserOperationAsync({
        uo: {
          target: CONTRACT_ADDRESS,
          data: encodeFunctionData<HogwartsTournamentAbi>({
            functionName: "getWizardStatus",
            abi: hogwartsTournamentAbi,
            args: [nft.tokenId],
          }),
        },
      });
      console.log({ op, nft });
      debugger;
    });

    (async () => {
      const nfts = await promiseNfts;
      const myNfts = await promiseMyNfts;
      const myHouse = await promiseMyHouse;
      console.log({ nfts, myNfts, myHouse });
      debugger;
    })();
  }, [hasSendUserOperationAsync, hasClient, address]);

  if (!client) return <div>Please Login...</div>;

  return (
    <div className="flex justify-center items-center">
      <div>
        <div className="flex space-x-4">
          {wizardData.map((wizard, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`p-4 text-white rounded-lg hover:bg-opacity-75 disabled:opacity-50 ${wizard.color}`}>
                <img src={wizard.image} alt={wizard.name} className="w-32 h-32 object-cover rounded-full mb-2" />
                <p>{wizard.name}</p>
                <p>Points - {points[wizard.name].points}</p>
                <p>Frozen - {points[wizard.name].frozen}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="my-2 font-medium">Connected Address:</p>
        <Address address={address} />
        <>
          {keys(wizards).map(house => {
            const wizardNfts = wizards[house as House];
            return (
              <div key={house}>
                <h1>{house}</h1>
                <div className="flex space-x-4">
                  {wizardNfts.map(wizard => (
                    <div key={wizard.tokenId} className="flex flex-col items-center">
                      <Wizard {...wizard} />
                      <WizardSpell client={client} myWizard={myWizard} otherWizard={wizard} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
};

export default Home;
