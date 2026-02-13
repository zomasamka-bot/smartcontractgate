// *** Configurable variables for the app ***
// This file contains all the user-editable configuration values that can be updated when customizing the app.
// The app studio main backend will populate these values when the app is created.
// These values are merely placeholders and default values.

// App Configuration - UPDATE THESE VALUES BASED ON USER REQUIREMENTS
export const APP_CONFIG = {
  // UPDATE: Set to the name of the app
  NAME: "SmartContract Control Gate",

  // UPDATE: Set to the description of the app
  DESCRIPTION: "A simple control gate for smart contract calls with policy checks and execution logging",

  // UPDATE: Set to the domain of the app
  DOMAIN: "smartcontract.pi",

  // PiNet Configuration
  PINET_SUBDOMAIN: "smartcontract3754",
  BACKEND_URL: "https://smartcontractgate.vercel.app",
  
  // Pi SDK Configuration
  PI_SDK_VERSION: "2.0",
  PI_SANDBOX_MODE: true, // true for Testnet, false for Mainnet
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
