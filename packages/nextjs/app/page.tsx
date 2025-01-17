"use client";

import { ReactElement, useEffect, useState } from "react";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
// import deployedContracts from "~~/contracts/deployedContracts";
import { useClient } from "~~/hooks/scaffold-eth/useClient";

const Home: NextPage = () => {
  const { address, client, origClient } = useClient();
  const [nfts, setNfts] = useState(new Array<ReactElement>());

  useEffect(() => {
    // console.log({
    //   clientExists: !!client,
    // });
    // if (!client || !address || !!nfts?.length) return;
    // setNfts([<></>]);

    main(client || origClient, address).then(xs => setNfts(xs));
  }, [!!client, address]);

  // Get all the image urls for all the NFTs an address owns.
  async function main(client: Client | undefined, address: string | undefined) {
    const items = [];

    const imageUrl =
      "data:image/jpeg;base64,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";
    items.push(
      <div style={{}}>
        <div key="harryPotter" style={{ height: "20rem", width: "15rem" }}>
          <img src="/frame1.jpg" alt="frame" style={{ height: "20rem", width: "15rem", maxWidth: "none" }} />
          <img
            className="z-10 relative left-10 top-10 w-130 h-180"
            src={imageUrl}
            key="harryPotter"
            alt="nft"
            style={{ height: "9.3rem", width: "7rem", maxWidth: "none", left: "4.15rem", top: "-14.2rem" }}
          />
        </div>
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
          Freeze / Unfreeze
        </button>
      </div>,
    );
    items.push(
      <div key="harryPotter">
        <img src="/frozenFrame.jpg" alt="frame" style={{ height: "20rem", width: "15rem", maxWidth: "none" }} />
        <img
          className="z-10 relative left-10 top-10 w-130 h-180"
          src={imageUrl}
          key="harryPotter"
          alt="nft"
          style={{ height: "9.7rem", width: "6.6rem", maxWidth: "none", left: "4.3rem", top: "-14.5rem" }}
        />
      </div>,
    );
    const iterator =
      !!address && !!client && "nft" in client
        ? client?.nft?.getNftsForOwnerIterator(address, {
            contractAddresses: [deployedContracts[421614].HogwartsTournament.address],
          })
        : undefined;
    for await (const { image } of iterator || []) {
      console.log({ image });
      if (!(!!image.cachedUrl && image.contentType?.includes("image"))) continue;
      items.push(
        <div className="relative" key={image.pngUrl}>
          <img src="public/frame1.jpg" className="absolute inset-0 w-full h-full z-0" alt="frame" />
          <img src={image.cachedUrl} key={image.pngUrl} alt="nft" />
        </div>,
      );
    }
    console.log("Adding fake", { client: !!client, address, iterator: !!iterator });
    return items;
  }

  if (!client) return <div>Loading...</div>;
  type Client = typeof client | typeof origClient;

  return (
    <div className="flex justify-center items-center">
      <div>
        <p className="my-2 font-medium">Connected Address:</p>
        <Address address={address} />
        <>{...nfts}</>
      </div>
    </div>
  );
};

export default Home;
