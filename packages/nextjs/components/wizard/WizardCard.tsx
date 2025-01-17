import { Wizard } from "~~/app/Wizard";
import { WizardSpell } from "~~/app/WizardSpell";
import { WizardData } from "~~/app/mint/wizardData";
import { WizardInfo } from "~~/app/page";
import { Client } from "~~/hooks/scaffold-eth/useClient";

interface WizardCardProps {
  wizard: WizardInfo;
  houseData: WizardData;
  client: Client;
  myWizard: WizardInfo | null;
}

export const WizardCard = ({ wizard, houseData, client, myWizard }: WizardCardProps) => {
  return (
    <div
      className={`
        relative overflow-hidden
        p-6 rounded-xl shadow-md 
        hover:shadow-xl hover:scale-102
        transition-all duration-300 ease-in-out
        bg-gradient-to-br from-${houseData.color.replace("bg-", "")}/10 to-${houseData.secondaryColor.replace("bg-", "")}/10
        border border-${houseData.color.replace("bg-", "")}/20
      `}
    >
      {/* Status Indicator */}
      {wizard.stunned && (
        <div className="absolute top-3 right-3 flex items-center">
          <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-500 border border-red-500/20">
            Stunned
          </span>
        </div>
      )}

      <div className="flex flex-col items-center space-y-4">
        {/* Wizard Image and Info */}
        <div className="relative">
          <div
            className={`
            absolute inset-0 rounded-full 
            bg-gradient-to-br from-${houseData.color.replace("bg-", "")} to-${houseData.secondaryColor.replace("bg-", "")}
            opacity-20 blur-xl
          `}
          ></div>
          <Wizard {...wizard} />
        </div>

        {/* Wizard Name */}
        <h3
          className={`
          text-xl font-bold 
          bg-gradient-to-r from-${houseData.color.replace("bg-", "")} to-${houseData.secondaryColor.replace("bg-", "")}
          bg-clip-text text-transparent
        `}
        >
          {wizard.name}
        </h3>

        {/* Token ID */}
        <span className="text-sm text-gray-500">Token #{wizard.tokenId}</span>

        {/* Spell Actions */}
        <div className="w-full pt-4 border-t border-gray-200/20">
          <WizardSpell client={client} myWizard={myWizard} otherWizard={wizard} />
        </div>
      </div>
    </div>
  );
};
