"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { useAuthModal, useChain } from "@account-kit/react";
import { Address } from "viem";
import { useNetworkColor } from "~~/hooks/scaffold-alchemy";
import { useClient } from "~~/hooks/scaffold-alchemy/useClient";
import scaffoldConfig from "~~/scaffold.config";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-alchemy";

export const ConnectButton = () => {
  const { chain } = useChain();
  const networkColor = useNetworkColor();
  const { openAuthModal } = useAuthModal();
  const { address } = useClient();
  const connected = !!address;

  if (!connected) {
    return (
      <button className="btn btn-primary btn-sm" onClick={openAuthModal} type="button">
        Login
      </button>
    );
  }

  if (!address) {
    return <></>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(scaffoldConfig.targetNetworks[0], address);

  return (
    <>
      <div className="flex flex-col items-center mr-1">
        <Balance address={address as Address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          {chain.name}
        </span>
      </div>
      <AddressInfoDropdown
        address={address as Address}
        displayName=""
        blockExplorerAddressLink={blockExplorerAddressLink}
      />
      <AddressQRCodeModal address={address as Address} modalId="qrcode-modal" />
    </>
  );
};
