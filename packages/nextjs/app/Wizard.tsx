"use client";

import { WizardInfo } from "./page";

export function Wizard(props: WizardInfo): any {
  if (props.stunned) {
    return (
      <div key="harryPotter" style={{ height: "20rem", width: "15rem" }}>
        <img src="/frame1.jpg" alt="frame" style={{ height: "20rem", width: "15rem", maxWidth: "none" }} />
        <img
          className="z-10 relative left-10 top-10 w-130 h-180"
          src={props.imageUrl}
          key="harryPotter"
          alt="nft"
          style={{ height: "9.3rem", width: "7rem", maxWidth: "none", left: "4.15rem", top: "-14.2rem" }}
        />
      </div>
    );
  }
  return (
    <div key="harryPotter">
      <img src="/frozenFrame.jpg" alt="frame" style={{ height: "20rem", width: "15rem", maxWidth: "none" }} />
      <img
        className="z-10 relative left-10 top-10 w-130 h-180"
        src={props.imageUrl}
        key="harryPotter"
        alt="nft"
        style={{ height: "9.7rem", width: "6.6rem", maxWidth: "none", left: "4.3rem", top: "-14.5rem" }}
      />
    </div>
  );
}
