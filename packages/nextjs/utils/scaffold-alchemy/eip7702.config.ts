/* eslint-disable prettier/prettier */

/**
 * Configuration for EIP-7702 Smart Account Upgrades
 */

export const EIP7702_CONFIG = {
    // Chains that support EIP-7702
    supportedChains: [1, 11155111] as const, // Mainnet and Sepolia

    // Error messages
    errors: {
        UNSUPPORTED_NETWORK: "EIP-7702 is not supported on the connected network.",
        NOT_METAMASK: "Please connect with MetaMask to upgrade to a Smart Account.",
        USER_REJECTED: "Upgrade canceled. Smart Account delegation was not authorized.",
        NO_ADDRESS: "No wallet address found. Please connect your wallet.",
        NO_WALLET_CLIENT: "Wallet client not available. Please refresh and try again.",
        UNKNOWN_ERROR: "Failed to upgrade account. Please try again.",
        SIGNATURE_VALIDATION_FAILED: "Failed to validate signature. Please ensure you have enough ETH for gas.",
        EIP7702_NOT_READY: "EIP-7702 support is still experimental. Please try again later.",
        SDK_NOT_READY: "EIP-7702 upgrade requires MetaMask with experimental features enabled. Please ensure you have the latest MetaMask version.",
    },

    // UI messages
    messages: {
        PREPARING: "Preparing smart account upgrade...",
        UPGRADING: "Upgrading account... Please approve in MetaMask",
        SUCCESS: "Account successfully upgraded to Smart Account!",
        UPGRADE_BUTTON: "Upgrade to a Smart Wallet",
        UPGRADED_EOA: "This is a Smart Wallet",
        SMART_ACCOUNT: "This is a Smart Account",
        DETECTING: "Detecting account type...",
        TOOLTIP_UNSUPPORTED: "EIP-7702 is not supported on this network",
    },

    // Timing configurations
    timing: {
        reloadDelay: 2000, // ms to wait before reloading page after successful upgrade
    },
} as const;

export type EIP7702Config = typeof EIP7702_CONFIG;