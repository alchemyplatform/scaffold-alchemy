"use client";

import { useEffect, useMemo, useState } from "react";
import { keys } from "../utils/keys";
import { WizardData, wizardData, wizardValues } from "./mint/wizardData";
import { useSendUserOperation } from "@account-kit/react";
import { Nft } from "alchemy-sdk";
import { GraphQLClient } from "graphql-request";
import { NextPage } from "next";
import { WizardCard } from "~~/components/wizard/WizardCard";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Client, useClient } from "~~/hooks/scaffold-eth/useClient";

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

type House = WizardData["houseName"];
export type WizardInfo = {
  imageUrl: string;
  name: string;
  stunned: boolean;
  house: House;
  tokenId: string;
};
export type CurrentWizardProps = {
  onChange: () => void;
  client: Client | undefined;
  myWizard: WizardInfo | null;
  otherWizard: WizardInfo;
};

const fromHouseNumber = (house: number): House => {
  switch (house) {
    case wizardData.Gryffindor.houseNumber:
      return "Gryffindor";
    case wizardData.Hufflepuff.houseNumber:
      return "Hufflepuff";
    case wizardData.Ravenclaw.houseNumber:
      return "Ravenclaw";
    case wizardData.Slytherin.houseNumber:
      return "Slytherin";
  }
  throw new Error(`Invalid house number: ${house}`);
};
const urlFromHouseNumber = (house: number): string => {
  switch (house) {
    case wizardData.Gryffindor.houseNumber:
      return "/gryffindor.jpg";
    case wizardData.Hufflepuff.houseNumber:
      return "/hufflepuff.jpg";
    case wizardData.Ravenclaw.houseNumber:
      return "/ravenclaw.jpg";
    case wizardData.Slytherin.houseNumber:
      return "/slytherin.jpg";
  }
  throw new Error(`Invalid house number: ${house}`);
};

const Home: NextPage = () => {
  type WizardsInHouses = Record<House, WizardInfo[]>;
  const { address, client } = useClient();
  const [myNfts, setMyNfts] = useState<Nft | null>(null);
  const { data: myStatus } = useScaffoldReadContract({
    watch: true,
    contractName: "HogwartsTournament",
    functionName: "getWizardStatus",
    args: [BigInt(myNfts?.tokenId || 0)],
  });
  const { sendUserOperationAsync } = useSendUserOperation({
    client: client,
    waitForTxn: true,
  });
  const { data: gryffindorHousePoints } = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    watch: true,
    args: [0],
  });
  const { data: hufflepuffHousePoints } = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    watch: true,
    args: [1],
  });
  const { data: ravenclawHousePoints } = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    watch: true,
    args: [2],
  });
  const { data: slytherinHousePoints } = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    watch: true,
    args: [3],
  });

  const [points, setPoints] = useState({
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
  useEffect(() => {
    setPoints({
      Hufflepuff: {
        frozen: wizards.Hufflepuff.map(x => +x.stunned).reduce(sum, 0),
        points: Number(hufflepuffHousePoints || 0),
      },
      Ravenclaw: {
        frozen: wizards.Ravenclaw.map(x => +x.stunned).reduce(sum, 0),
        points: Number(ravenclawHousePoints || 0),
      },
      Gryffindor: {
        frozen: wizards.Gryffindor.map(x => +x.stunned).reduce(sum, 0),
        points: Number(gryffindorHousePoints || 0),
      },
      Slytherin: {
        frozen: wizards.Slytherin.map(x => +x.stunned).reduce(sum, 0),
        points: Number(slytherinHousePoints || 0),
      },
    });
  }, [gryffindorHousePoints, hufflepuffHousePoints, ravenclawHousePoints, slytherinHousePoints, wizards]);
  useEffect(updateHouses, [hasSendUserOperationAsync, hasClient, address]);

  if (!client) return <div>Please Login...</div>;

  return (
    <div className="flex justify-center items-center">
      <div>
        <h1 className="text-4xl font-bold text-center mb-6 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          House Points
        </h1>
        <div className="flex space-x-8 p-8">
          {wizardValues.map(wizard => (
            <div key={wizard.houseNumber} className="flex flex-col items-center">
              <div
                className={`
                  p-6 text-white rounded-xl 
                  hover:scale-105 transition-all duration-300 ease-in-out
                  shadow-xl hover:shadow-2xl
                  bg-gradient-to-br from-${wizard.color.replace("bg-", "")} to-${wizard.secondaryColor.replace("bg-", "")}
                `}
              >
                <img
                  src={wizard.image}
                  alt={wizard.houseName}
                  className="w-40 h-40 object-cover rounded-full mb-4 border-4 border-white/20 shadow-lg"
                />
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold mb-3">{wizard.houseName}</h2>
                  <div className="space-y-1">
                    <p className="text-white/90">
                      Points: <span className="font-semibold">{points[wizard.houseName].points}</span>
                    </p>
                    <p className="text-white/90">
                      Frozen: <span className="font-semibold">{points[wizard.houseName].frozen}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My Wizard Section */}
        {myWizard ? (
          <div className="mt-16 mb-20">
            {/* Decorative elements */}
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              <img src="/magicWand.jpg" alt="Wand" className="h-8 mx-4 opacity-70" />
              <h2 className="text-4xl font-bold text-center px-4 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                My Wizard
              </h2>
              <img src="/magicWand.jpg" alt="Wand" className="h-8 mx-4 opacity-70 transform scale-x-[-1]" />
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
            </div>

            {/* Card container with magical effects */}
            <div className="relative max-w-md mx-auto">
              {/* Animated glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl opacity-20 blur-xl animate-pulse"></div>
              {/* Star sparkles */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="star-sparkle absolute w-1 h-1"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: Math.random() * 0.7 + 0.3,
                  }}
                >
                  <svg
                    className="w-full h-full animate-twinkle"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: "#ffd700" }}
                  >
                    <path d="M12 2L9.1 9.1H2L7.5 13.9L5.7 21L12 16.9L18.3 21L16.5 13.9L22 9.1H14.9L12 2Z" />
                  </svg>
                </div>
              ))}
              {/* Magical floating particles */}
              <div className="absolute -inset-2 flex justify-around">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-1.5 h-1.5 rounded-full
                      bg-gradient-to-br from-amber-300 to-yellow-500
                      animate-float opacity-70
                    `}
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      left: `${i * 15}%`,
                      top: `${Math.sin(i) * 20}%`,
                    }}
                  ></div>
                ))}
              </div>
              {/* Wizard Card */}
              <div className="relative backdrop-blur-sm">
                <WizardCard
                  wizard={myWizard}
                  houseData={wizardValues.find(w => w.houseName === myWizard.house)!}
                  client={client}
                  myWizard={myWizard}
                  onChange={updateHouses}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-16 mb-20 text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
              <img src="/sorting-hat.png" alt="Sorting Hat" className="h-10 mx-4 opacity-70" />
              <h2 className="text-4xl font-bold text-center px-4 bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent">
                No Wizard Yet
              </h2>
              <img src="/sorting-hat.png" alt="Sorting Hat" className="h-10 mx-4 opacity-70 transform scale-x-[-1]" />
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
            </div>
            <p className="text-gray-500 text-lg">
              The Sorting Hat awaits! Mint a wizard to join the Hogwarts Tournament.
            </p>
          </div>
        )}

        <div className="mt-12 space-y-8">
          {keys(wizards).map(house => {
            const wizardNfts = wizards[house as House];
            const houseData = wizardData[house];
            if (!houseData) return null;

            return (
              <div key={house} className="rounded-xl p-6 bg-base-200 shadow-xl">
                <h2
                  className={`text-2xl font-bold mb-4 pb-2 border-b-2 bg-gradient-to-r from-${houseData.color.replace("bg-", "")} to-${houseData.secondaryColor.replace("bg-", "")} bg-clip-text text-transparent`}
                >
                  {house} House
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wizardNfts.map(wizard => (
                    <WizardCard
                      key={wizard.tokenId}
                      wizard={wizard}
                      houseData={houseData}
                      client={client}
                      myWizard={myWizard}
                      onChange={updateHouses}
                    />
                  ))}
                </div>
                {wizardNfts.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No wizards in this house yet</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  function updateHouses() {
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

    (async () => {
      const settingWizards = await promiseNfts;
      const settingMyNfts = await promiseMyNfts;
      setMyNfts(settingMyNfts.ownedNfts[0]);
      setWizards(settingWizards);
    })();
  }
};

export default Home;

function sum(a: number, b: number) {
  return a + b;
}
