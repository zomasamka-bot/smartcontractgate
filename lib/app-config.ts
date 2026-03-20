// *** Configurable variables for the app ***
// This file reads from NEXT_PUBLIC_* environment variables defined on Vercel.
// Fallback values are used only when the environment variables are not set.

// Derive sandbox mode from NEXT_PUBLIC_PI_NETWORK:
// "testnet" → sandbox = true (no real Pi used)
// anything else (e.g. "mainnet") → sandbox = false
const _network = process.env.NEXT_PUBLIC_PI_NETWORK ?? "testnet";
const _isTestnet = _network === "testnet";

export const APP_CONFIG = {
  // Reads NEXT_PUBLIC_APP_NAME; falls back to display name
  NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "SmartContract Control Gate",

  DESCRIPTION: "A simple control gate for smart contract calls with policy checks and execution logging",

  DOMAIN: "smartcontract.pi",

  PINET_SUBDOMAIN: "smartcontract3754",

  // Reads NEXT_PUBLIC_APP_URL; falls back to production URL
  BACKEND_URL: process.env.NEXT_PUBLIC_APP_URL ?? "https://smartcontractgate.vercel.app",

  // Reads NEXT_PUBLIC_APP_ORIGIN; falls back to production origin
  APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://smartcontractgate.vercel.app",

  // Pi SDK Configuration
  PI_SDK_VERSION: "2.0",

  // true when NEXT_PUBLIC_PI_NETWORK === "testnet"
  PI_SANDBOX_MODE: _isTestnet,

  // Expose the raw network string for conditional UI rendering
  PI_NETWORK: _network,
} as const;

// Colors Configuration - UPDATE THESE VALUES BASED ON USER DESIGN PREFERENCES
export const COLORS = {
  // UPDATE: Set to the background color (hex format)
  BACKGROUND: "#0A0A0A",

  // UPDATE: Set to the primary color for buttons, links, etc. (hex format)
  PRIMARY: "#10B981",

  // UPDATE: Set to the accent color (hex format)
  ACCENT: "#3B82F6",
} as const;
