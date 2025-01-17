"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useClient } from "~~/hooks/scaffold-eth/useClient";

// Wizard data (name, description, image)
const wizardData = [
  { name: "Hufflepuff", description: "Not a main character", image: "/hufflepuff.jpg", color: "bg-hufflepuff" },
  { name: "Ravenclaw", description: "Pretentious", image: "/ravenclaw.png", color: "bg-ravenclaw" },
  { name: "Gryffindor", description: "Not Slytherin", image: "/gryffindor.jpg", color: "bg-gryffindor" },
  { name: "Slytherin", description: "Goth", image: "/slytherin.jpg", color: "bg-slytherin" },
];

const MintWizards: NextPage = () => {
  const { address, client } = useClient();
  const [selectedWizard, setSelectedWizard] = useState<number | null>(null);
  const [minting, setMinting] = useState<boolean>(false);
  const [hasMinted, setHasMinted] = useState<boolean>(false); // Track if the user has minted a wizard
  const [mintedWizards, setMintedWizards] = useState<any[]>([]); // Track the list of minted wizards (NFTs owned by user)
  const MINT_CONTRACT_ADDRESS = "ohyea"; // Replace this with your actual contract address

  useEffect(() => {
    if (!client || !address) return;

    // Check if the user has already minted a wizard
    checkIfMinted(address);
  }, [address, client]);

  // Function to check if the user has minted a wizard
  const checkIfMinted = async (address: string) => {
    try {
      if (!client) return;
      // Call the contract method to get the list of NFTs owned by the user
      const mintedWizardsResponse = await client.nft.getContractsForOwner(address);
      console.log("Minted wizards response:", mintedWizardsResponse);

      // Loop through the contracts to check if the user's address is in the array
      const hasUserMinted = mintedWizardsResponse.contracts.some(
        (contract: { address: string }) => contract.address === MINT_CONTRACT_ADDRESS,
      );

      // Update state based on whether the address is found
      setHasMinted(hasUserMinted);
      setMintedWizards(mintedWizardsResponse.contracts); // Store the minted wizards in state
    } catch (error) {
      console.error("Error checking minted wizards:", error);
    }
  };

  // Mint function (this would eventually interact with the contract)
  const mint = async (wizardType: number) => {
    if (hasMinted) {
      alert("You have already minted a wizard!"); // Prevent minting if already minted
      return; // Stop further execution
    }

    setMinting(true);
    try {
      console.log(`Minting wizard of type: ${wizardType}`);
      // Replace this with actual minting logic
      // Example: await client.mintWizard(wizardType);
      // Wait for transaction success, handle minting logic here
      alert(`Successfully minted ${wizardData[wizardType].name}!`);
      setHasMinted(true); // Mark that a wizard has been minted
    } catch (error) {
      console.error("Minting failed", error);
      alert("Minting failed. Please try again.");
    } finally {
      setMinting(false);
    }
  };

  const handleWizardSelect = async (wizardType: number) => {
    setSelectedWizard(wizardType);
    await mint(wizardType);
  };

  // Check if a particular wizard has already been minted
  const isWizardMinted = (wizardName: string) => {
    return mintedWizards.some(mintedWizard => mintedWizard.name === wizardName);
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-4">
      <h1 className="text-3xl font-bold mb-6">Choose Your Wizard</h1>

      <p className="my-2 font-medium">Connected Address:</p>
      <Address address={address} />

      <div className="flex space-x-4">
        {wizardData.map((wizard, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Show descriptions before clicking and hide after selection */}
            {selectedWizard === null && !hasMinted && <p className="text-center mt-2 italic">{wizard.description}</p>}
            <button
              onClick={() => handleWizardSelect(index)} // Pass the index as the wizard type
              className={`p-4 text-white rounded-lg hover:bg-opacity-75 disabled:opacity-50 ${wizard.color}`}
              disabled={minting || hasMinted || isWizardMinted(wizard.name)} // Disable if minting, wizard has been minted, or already minted this wizard
            >
              <img src={wizard.image} alt={wizard.name} className="w-32 h-32 object-cover rounded-full mb-2" />
              <p>{wizard.name}</p>
            </button>
          </div>
        ))}
      </div>

      {selectedWizard !== null && (
        <div className="mt-4">
          <p className="font-bold">You selected a wizard!</p>
          <p className="italic">{wizardData[selectedWizard].name}</p>
        </div>
      )}

      {minting && <p className="text-blue-500">Minting in progress...</p>}

      {/* Show a message if the user has already minted a wizard */}
      {hasMinted && !selectedWizard && <p className="text-green-500 mt-4">You have already minted a wizard!</p>}
    </div>
  );
};

export default MintWizards;
