"use client";

import Image from "next/image";
import { WizardInfo } from "~~/types/hogwarts/hogwartsTypes";

export function Wizard(props: WizardInfo): any {
  if (!props.stunned) {
    return (
      <>
        <p>{props.name}</p>

        <div key="harryPotter" style={{ height: "20rem", width: "15rem" }}>
          <Image src="/frame1.jpg" alt="frame" width={240} height={320} style={{ maxWidth: "none" }} />
          <Image
            className="z-10 relative"
            src={props.imageUrl}
            key="harryPotter"
            alt="nft"
            width={112}
            height={149}
            style={{ maxWidth: "none", left: "63px", top: "-170px" }}
          />
        </div>
      </>
    );
  }
  return (
    <>
      <p>{props.name}</p>
      <div key="harryPotter">
        <Image src="/frozenFrame.jpg" alt="frame" width={240} height={320} style={{ maxWidth: "none" }} />
        <Image
          className="z-10 relative"
          src={props.imageUrl}
          key="harryPotter"
          alt="nft"
          width={106}
          height={155}
          style={{ maxWidth: "none", left: "80px", top: "-174px" }}
        />
      </div>
    </>
  );
}
