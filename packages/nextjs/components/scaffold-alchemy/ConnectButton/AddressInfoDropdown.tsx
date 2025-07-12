/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react"; 
import { NetworkOptions } from "./NetworkOptions";
import { useLogout } from "@account-kit/react";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAddress } from "viem";
import { Address } from "viem";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  ShieldCheckIcon, //feature_1
  ExclamationTriangleIcon, // feature_1_part_2
  RocketLaunchIcon, // feature_2
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-alchemy";
import { useOutsideClick, useAccountType, useEOAUpgrade, useSmartAccountDeployment } from "~~/hooks/scaffold-alchemy"; // 'useAccountType' is feature_1 AND 'useEOAUpgrade' is feature_1_part_2 AND 'useSmartAccountDeployment' is feature_2
import { getTargetNetworks } from "~~/utils/scaffold-alchemy";
import { EIP7702_CONFIG } from "~~/utils/scaffold-alchemy/eip7702.config"; // feature_1_part_2

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const checkSumAddress = getAddress(address);
  const { logout } = useLogout();
  const { accountType } = useAccountType(); //Feature_1
  const {
    upgradeWithPrivateKey,
    status: upgradeStatus,
    isEIP7702Supported,
    isMetaMaskConnected,
    reset: resetUpgrade
  } = useEOAUpgrade(); // feature_1_part_2
  const {
    isDeploying,
    deploySmartAccount,
  } = useSmartAccountDeployment(); // feature_2

  const [addressCopied, setAddressCopied] = useState(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false); // feature_1_part_2
  const [privateKey, setPrivateKey] = useState(""); // feature_1_part_2
  const [showPrivateKey, setShowPrivateKey] = useState(false); // feature_1_part_2

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  // feature_1_part_2: EIP-7702 Upgrade Button block start -----------------

  // Determine if upgrade button should be shown and enabled
  const showUpgradeButton = accountType === "EOA" && isMetaMaskConnected;
  const isUpgradeEnabled = showUpgradeButton && isEIP7702Supported;
  const isUpgrading = upgradeStatus === "upgrading";

  // feature_2: Determine if deploy button should be shown
  const showDeployButton = accountType === "SCA_4337_UNDEPLOYED";

  // Get the appropriate message for the account status
  const getAccountStatusMessage = () => {
    if (isUpgrading) return "Upgrading...";
    if (isDeploying) return "Deploying...";
    if (accountType === "EOA" && isMetaMaskConnected) return EIP7702_CONFIG.messages.UPGRADE_BUTTON;
    if (accountType === "EOA_7702") return EIP7702_CONFIG.messages.UPGRADED_EOA;
    if (accountType === "SCA_4337") return EIP7702_CONFIG.messages.SMART_ACCOUNT;
    if (accountType === "SCA_4337_UNDEPLOYED") return "Deploy Smart Account";
    if (accountType === "UNKNOWN") return EIP7702_CONFIG.messages.DETECTING;
    return "This is an EOA";
  };

  const handleUpgradeClick = async () => {
    if (isUpgradeEnabled && !isUpgrading) {
      closeDropdown();
      
      // Since MetaMask doesn't support EIP-7702 yet, show private key modal directly
      setShowPrivateKeyModal(true);
    }
  };

  // Handle deploy button click for SCA_4337_UNDEPLOYED accounts
  const handleDeployClick = async () => {
    if (!isDeploying) {
      closeDropdown();
      await deploySmartAccount();
    }
  };

  const handlePrivateKeyUpgrade = async () => {
    if (!privateKey) return;
    
    try {
      // Reset the error state before attempting private key upgrade
      resetUpgrade();
      await upgradeWithPrivateKey(privateKey);
      setShowPrivateKeyModal(false);
      setPrivateKey(""); // Clear private key from memory
    } catch (error) {
      console.error("Private key upgrade failed:", error);
      // Keep the modal open on error
    }
  };

  // feature_1_part_2: EIP-7702 Upgrade Button block end -------------------

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary tabIndex={0} className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 !h-auto">
          <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          <span className="ml-2 mr-1">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </summary>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
        >
          <NetworkOptions hidden={!selectingNetwork} />
          <li className={selectingNetwork ? "hidden" : ""}>
            {addressCopied ? (
              <div className="btn-sm !rounded-xl flex gap-3 py-3">
                <CheckCircleIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
                <span className=" whitespace-nowrap">Copy address</span>
              </div>
            ) : (
              <CopyToClipboard
                text={checkSumAddress}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 800);
                }}
              >
                <div className="btn-sm !rounded-xl flex gap-3 py-3">
                  <DocumentDuplicateIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                  <span className=" whitespace-nowrap">Copy address</span>
                </div>
              </CopyToClipboard>
            )}
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label htmlFor="qrcode-modal" className="btn-sm !rounded-xl flex gap-3 py-3">
              <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">View QR Code</span>
            </label>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button className="menu-item btn-sm !rounded-xl flex gap-3 py-3" type="button">
              <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <a
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
                className="whitespace-nowrap"
              >
                View on Block Explorer
              </a>
            </button>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            {showDeployButton ? (
              <button
                className={`menu-item btn-sm !rounded-xl flex gap-3 py-3 w-full text-left ${isDeploying ? "opacity-50" : ""
                  }`}
                onClick={handleDeployClick}
                disabled={isDeploying}
                type="button"
              >
                <RocketLaunchIcon className={`h-6 w-4 ml-2 sm:ml-0 ${isDeploying ? "animate-pulse" : ""}`} />
                <span className="whitespace-nowrap font-medium">
                  {isDeploying ? "Deploying..." : "Deploy Smart Account"}
                </span>
              </button>
            ) : showUpgradeButton ? (
              <button
                className={`menu-item btn-sm !rounded-xl flex gap-3 py-3 w-full text-left ${
                  isUpgradeEnabled && !isUpgrading
                    ? ""
                    : "opacity-50"
                  } ${!isEIP7702Supported ? "tooltip tooltip-top" : ""
                  }`}
                data-tip={!isEIP7702Supported ? EIP7702_CONFIG.messages.TOOLTIP_UNSUPPORTED : undefined}
                onClick={handleUpgradeClick}
                disabled={!isUpgradeEnabled || isUpgrading}
                type="button"
              >
                <ShieldCheckIcon className={`h-6 w-4 ml-2 sm:ml-0 ${isUpgrading ? "animate-pulse" : ""}`} />
                <span className="whitespace-nowrap font-medium">
                  {isUpgrading ? "Upgrading..." : getAccountStatusMessage()}
                </span>
              </button>
            ) : (
              <div className="btn-sm !rounded-xl flex gap-3 py-3 px-4 cursor-default hover:bg-base-200">
                <ShieldCheckIcon className="h-6 w-4" />
                <span className="whitespace-nowrap font-medium">
                  {getAccountStatusMessage()}
                </span>
              </div>
            )}
          </li>
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={() => logout()}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </details>

      {/* Private Key Modal */}
      {showPrivateKeyModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-warning" />
              EIP-7702 Upgrade with Private Key
            </h3>
            
            <div className="alert alert-warning mt-4">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <div>
                <p className="font-bold">Security Warning</p>
                <p className="text-sm">
                  {"WARNING: This procedure is experimental, use it in a dev environment. You can upgrade your Metamask Wallet implementing eip-7702 authorization using your private key. Your key won't be stored and will be asked to you only once. REMEMBER, DO NOT SHARE YOUR PRIVATE KEY WITH ANYONE!"}
                </p>
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Enter &quot;0x&quot; followed by your private key (0x...)</span>
              </label>
              <div className="relative">
                <input
                  type={showPrivateKey ? "text" : "password"}
                  placeholder="0xabcd1234..."
                  className="input input-bordered w-full pr-10"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  type="button"
                >
                  {showPrivateKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => {
                  setShowPrivateKeyModal(false);
                  setPrivateKey("");
                  setShowPrivateKey(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handlePrivateKeyUpgrade}
                disabled={!privateKey || privateKey.length !== 66 || !privateKey.startsWith("0x") || isUpgrading}
              >
                {isUpgrading ? "Upgrading..." : "Upgrade Account"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => {
            setShowPrivateKeyModal(false);
            setPrivateKey("");
            setShowPrivateKey(false);
          }}></div>
        </div>
      )}
    </>
  );
};