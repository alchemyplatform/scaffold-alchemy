"use client";

import { SetStateAction, useEffect, useState } from "react";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useClient } from "~~/hooks/scaffold-eth/useClient";

// Wizard data (name, description, image)
const wizardData = [
  { name: "Gryffindor", description: "Not Slytherin", image: "/gryffindor.jpg", color: "bg-gryffindor", symbol: "🦁" },
  {
    name: "Hufflepuff",
    description: "Not a main character",
    image: "/hufflepuff.jpg",
    color: "bg-hufflepuff",
    symbol: "🦡",
  },
  { name: "Ravenclaw", description: "Pretentious", image: "/ravenclaw.jpg", color: "bg-ravenclaw", symbol: "🦅" },
  { name: "Slytherin", description: "Goth", image: "/slytherin.jpg", color: "bg-slytherin", symbol: "🐍" },
];

const MintWizards: NextPage = () => {
  const { address } = useClient();
  const [selectedWizard, setSelectedWizard] = useState<number | null>(null);
  const [hasMinted, setHasMinted] = useState<boolean>(false); // Track if the user has minted a wizard
  // contract interaction
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "HogwartsTournament",
  });
  const { data: balance } = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "balanceOf",
    args: [address!],
  });
  useEffect(() => {
    if (!address) {
      setHasMinted(false);
      setSelectedWizard(null);
      return;
    }
    // Check if the user has already minted a wizard
    if (balance === 1n) setHasMinted(true);
  }, [address, balance]);

  const [wizardName, setWizardName] = useState("");

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setWizardName(e.target.value);
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-4">
      <h1 className="text-3xl font-bold mb-6">Choose Your Wizard</h1>
      <p className="my-2 font-medium">Connected Address:</p>
      <Address address={address} />
      {selectedWizard === null && !hasMinted && (
        <input
          type="text"
          placeholder="Name your wizard"
          className="input input-bordered w-full max-w-xs"
          value={wizardName}
          onChange={handleChange}
        />
      )}
      <div className="flex space-x-4">
        {wizardData.map((wizard, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Show descriptions before clicking and hide after selection */}
            {selectedWizard === null && !hasMinted && (
              <>
                <p className="text-center mt-2 italic">{wizard.description}</p>
                <img src={wizard.image} alt={wizard.name} className="w-32 h-32 object-cover rounded-full mb-2" />
                <button
                  onClick={async () => {
                    try {
                      await writeYourContractAsync({
                        functionName: "safeMint",
                        args: [index, wizardName],
                      });
                      setSelectedWizard(index);
                      setHasMinted(true);
                    } catch (e) {
                      console.error("Error setting greeting:", e);
                    }
                  }} // Pass the index as the wizard type
                  className={`p-4 mt-4 text-white rounded-lg hover:bg-opacity-75 disabled:opacity-50 ${wizard.color}`}
                  disabled={hasMinted} // Disable if minting, wizard has been minted, or already minted this wizard
                >
                  mint!
                  <p>{wizard.name}</p>
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      {selectedWizard !== null && hasMinted && (
        <div className="mt-4">
          <p className="font-bold">
            You selected house {wizardData[selectedWizard].name}! {wizardData[selectedWizard].symbol}
          </p>
        </div>
      )}
    </div>
  );
};

export default MintWizards;