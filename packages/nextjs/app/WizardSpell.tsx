"use client";

import { CurrentWizardProps } from "./page";

export const WizardSpell = (props: CurrentWizardProps) => {
  if (props.myWizard?.stunned) return <></>;
  if (props.myWizard?.house === props.otherWizard.house)
    return (
      <button
        onClick={() => {
          console.log("Clicking for a wizard");
        }}
        style={{
          background: `url("/magicWand.jpg") no-repeat`,
          backgroundSize: "15rem 8rem",
          height: "8rem",
          width: "15rem",
        }}
      >
        Re-enovate
      </button>
    );

  return (
    <button
      onClick={() => {
        console.log("Clicking for a wizard");
      }}
      style={{
        background: `url("/wand2.jpg") no-repeat`,
        backgroundSize: "15rem 8rem",
        height: "8rem",
        width: "15rem",
      }}
    >
      Stupify
    </button>
  );
};
