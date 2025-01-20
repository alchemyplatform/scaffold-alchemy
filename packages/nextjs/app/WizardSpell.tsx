"use client";

import { CurrentWizardProps } from "./page";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface SpellButtonProps {
  onClick: () => void;
  spellType: "restore" | "attack";
  text: string;
  isLoading?: boolean;
}

const SpellButton = ({ onClick, spellType, text }: SpellButtonProps) => {
  const gradientColors = {
    restore: "from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500",
    attack: "from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500",
  };

  const icons = {
    restore: (
      <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
    ),
    attack: (
      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
    ),
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full px-6 py-3 
        text-white font-semibold
        rounded-lg overflow-hidden
        transition-all duration-300
        bg-gradient-to-r ${gradientColors[spellType]}
        transform hover:-translate-y-1
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        group
      `}
    >
      {/* Magical sparkle effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
        <div className="absolute inset-0 bg-white blur-md">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse"></div>
        </div>
      </div>

      {/* Icon and text */}
      <div className="flex items-center justify-center space-x-2">
        <svg
          className="w-5 h-5 transform group-hover:rotate-12 transition-transform"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {icons[spellType]}
        </svg>
        <span className="tracking-wider">{text}</span>
      </div>
    </button>
  );
};

export const WizardSpell = (props: CurrentWizardProps) => {
  const { writeContractAsync: stupefyWrite } = useScaffoldWriteContract({
    contractName: "HogwartsTournament",
  });

  const { writeContractAsync: rennervateWrite } = useScaffoldWriteContract({
    contractName: "HogwartsTournament",
  });

  if (props.myWizard?.stunned !== false) return <></>;
  if (props.myWizard?.tokenId === props.otherWizard.tokenId) return <></>;
  if (props.myWizard?.house === props.otherWizard.house && props.otherWizard.stunned === true)
    return (
      <SpellButton
        onClick={() =>
          rennervateWrite({ functionName: "rennervate", args: [BigInt(props.otherWizard.tokenId)] }).then(
            props.onChange,
          )
        }
        spellType="restore"
        text="Re-enovate"
      />
    );

  if (props.myWizard?.house !== props.otherWizard.house && props.otherWizard.stunned === false)
    return (
      <SpellButton
        onClick={() =>
          stupefyWrite({ functionName: "stupefy", args: [BigInt(props.otherWizard.tokenId)] }).then(props.onChange)
        }
        spellType="attack"
        text="Stupify"
      />
    );

  return <></>;
};
