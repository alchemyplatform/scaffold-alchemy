"use client";

import { SetStateAction, useEffect, useState } from "react";
import { WizardHouse, wizardData, wizardValues } from "./wizardData";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useClient } from "~~/hooks/scaffold-eth/useClient";

const MintWizards: NextPage = () => {
  const { address } = useClient();
  const [selectedWizard, setSelectedWizard] = useState<WizardHouse | null>(null);
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
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl w-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/20 p-8">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/sorting-hat.jpg"
            alt="Sorting Hat"
            className="w-48 h-auto rounded-xl shadow-[0_0_25px_rgba(147,51,234,0.4)] mb-4 hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-4xl font-bold mt-4 text-center bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            Choose Your Wizard
          </h1>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <p className="text-lg font-medium text-purple-300">Connected Address:</p>
          <div className="text-white">
            <Address address={address} />
          </div>
        </div>

        {selectedWizard === null && !hasMinted && (
          <div className="flex justify-center mb-8">
            <input
              type="text"
              placeholder="Name your wizard"
              className="input bg-gray-900/50 border-purple-500/50 text-purple-100 w-full max-w-md text-center text-lg placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400"
              value={wizardName}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {wizardValues.map(wizard => (
            <div key={wizard.houseNumber} className="flex flex-col items-center h-full">
              {selectedWizard === null && !hasMinted && (
                <div className="group hover:transform hover:scale-105 transition-all duration-300 cursor-sorting-hat h-full w-full">
                  <div className="bg-gray-900/70 rounded-2xl p-6 shadow-[0_0_15px_rgba(147,51,234,0.2)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all border border-purple-500/20 h-full flex flex-col">
                    <div className="flex-grow flex flex-col items-center">
                      <img
                        src={wizard.image}
                        alt={wizard.houseName}
                        className="w-40 h-40 object-cover rounded-xl mb-4 hover:opacity-90 transition-opacity shadow-lg"
                      />
                      <h3 className="text-xl font-bold text-center mb-2 text-purple-200 group-hover:text-purple-400 transition-colors">
                        {wizard.houseName}
                      </h3>
                      <p className="text-center text-sm italic text-purple-300/70 mb-4">{wizard.description}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await writeYourContractAsync({
                            functionName: "safeMint",
                            args: [wizard.houseNumber, wizardName],
                          });
                          setSelectedWizard(wizard.houseName);
                          setHasMinted(true);
                        } catch (e) {
                          console.error("Error setting greeting:", e);
                        }
                      }}
                      className={`w-full p-4 text-white rounded-lg transition-all duration-300 
                        hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 
                        disabled:cursor-not-allowed shadow-[0_0_10px_rgba(147,51,234,0.3)] ${wizard.color} mt-auto`}
                      disabled={hasMinted}
                    >
                      <span className="font-bold">Mint Now!</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedWizard !== null && hasMinted && (
          <div className="mt-8 text-center bg-purple-900/20 border border-purple-500/20 p-6 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.2)]">
            <p className="text-2xl font-bold text-purple-200">
              Welcome to House {wizardData[selectedWizard].houseName}! {wizardData[selectedWizard].symbol}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintWizards;
