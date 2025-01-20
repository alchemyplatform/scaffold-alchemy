"use client";

import Image from "next/image";
import { WizardInfo } from "~~/types/hogwarts/hogwartsTypes";

export function Wizard(props: WizardInfo): any {
  if (!props.stunned) {
    return (
      <>
        <p>{props.name}</p>

        <div key="harryPotter">
          <Image src="/frame1.jpg" alt="frame" width={240} height={320} style={{ maxWidth: "none" }} />
          <Image
            className="z-10 relative"
            src={props.imageUrl}
            key="harryPotter"
            alt="nft"
            width={109}
            height={112}
            style={{ maxWidth: "none", left: "66px", top: "-170px", height: "112px", width: "109px" }}
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
          width={94}
          height={116}
          style={{ maxWidth: "none", left: "80px", top: "-174px", height: "116px", width: "94px" }}
        />
      </div>
    </>
  );
}
