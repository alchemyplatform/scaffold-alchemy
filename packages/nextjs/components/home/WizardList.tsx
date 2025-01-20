import { WizardCard } from "~~/components/wizard/WizardCard";
import { wizardData } from "~~/components/wizard/wizardData";
import { useClient } from "~~/hooks/scaffold-eth/useClient";
import { WizardsInHouses } from "~~/types/hogwarts/hogwartsTypes";
import { House } from "~~/types/hogwarts/hogwartsTypes";
import { WizardInfo } from "~~/types/hogwarts/hogwartsTypes";
import { keys } from "~~/utils/keys";

const WizardList = ({
  wizards,
  updateHouses,
  myWizard,
}: {
  wizards: WizardsInHouses;
  updateHouses: () => void;
  myWizard: WizardInfo | null;
}) => {
  const { client } = useClient();
  return (
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
            {wizardNfts.length === 0 && <p className="text-center text-gray-500 py-4">No wizards in this house yet</p>}
          </div>
        );
      })}
    </div>
  );
};

export default WizardList;
