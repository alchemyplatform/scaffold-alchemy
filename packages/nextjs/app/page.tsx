"use client";

import { useEffect, useMemo, useState } from "react";
import { Wizard } from "./Wizard";
import { WizardSpell } from "./WizardSpell";
import { WizardData, wizardData } from "./mint/wizardData";
import { useSendUserOperation } from "@account-kit/react";
import { Nft } from "alchemy-sdk";
import { GraphQLClient } from "graphql-request";
import { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useClient } from "~~/hooks/scaffold-eth/useClient";

const endpoint =
  "https://subgraph.satsuma-prod.com/e2e92ecdbb00/alchemy-internal/hogwarts-tournament/version/v0.0.1-new-version/api";

const graphQlClient = new GraphQLClient(endpoint);

const query = `
  {
    wizards {
      id
      name 
      house
      stunnedStatus
    }
  }
`;

export const CONTRACT_ADDRESS = deployedContracts[421614].HogwartsTournament.address;

type House = WizardData["name"];
export type WizardInfo = {
  imageUrl: string;
  name: string;
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

const fromHouseNumber = (house: number): House => {
  switch (house) {
    case 0:
      return "Gryffindor";
    case 1:
      return "Hufflepuff";
    case 2:
      return "Ravenclaw";
    case 3:
      return "Slytherin";
  }
  throw new Error(`Invalid house number: ${house}`);
};
const urlFromHouseNumber = (house: number): string => {
  switch (house) {
    case 0:
      return "/gryffindor.jpg";
    case 1:
      return "/hufflepuff.jpg";
    case 2:
      return "/ravenclaw.jpg";
    case 3:
      return "/slytherin.jpg";
  }
  throw new Error(`Invalid house number: ${house}`);
};
// const toHouseNumber = (house: House): number => {
//   switch (house) {
//     case "Hufflepuff":
//       return 0;
//     case "Ravenclaw":
//       return 1;
//     case "Gryffindor":
//       return 2;
//     case "Slytherin":
//       return 3;
//   }
// };

const hogwartsTournamentAbi = deployedContracts[421614].HogwartsTournament.abi;
const Home: NextPage = () => {
  type WizardsInHouses = Record<House, WizardInfo[]>;
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
  const [myWizard, setMyWizard] = useState<null | WizardInfo>(null);
  const [wizards, setWizards] = useState<WizardsInHouses>({
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

    const promiseNfts = graphQlClient.request(query).then(({ wizards }: any) => {
      return wizards.reduce(
        (acc: WizardsInHouses, wizard: any) => {
          const house = fromHouseNumber(Number(wizard.house));
          acc[house].push({
            imageUrl: urlFromHouseNumber(Number(wizard.house)),
            name: String(wizard.name),
            stunned: !!wizard.stunnedStatus,
            tokenId: String(wizard.id),
            house,
          });
          return acc;
        },
        {
          Hufflepuff: [],
          Ravenclaw: [],
          Gryffindor: [],
          Slytherin: [],
        },
      );
    });
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
      const settingWizards = await promiseNfts;
      const settingMyWizard = await promiseMyWizard;
      const myNfts = await promiseMyNfts;
      setWizards(settingWizards);
      setMyWizard(settingMyWizard);
      console.log({ myNfts });
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
        {myWizard && <Wizard {...myWizard} />}
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
async function fetchNftData(client: Client, nft: Nft): Promise<WizardInfo> {
  if (!client) throw new Error("Client expected to not be null");
  const { house, name, stunned } = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: hogwartsTournamentAbi,
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
