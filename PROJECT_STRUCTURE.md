# SmartContract Control Gate - Project Structure

## Overview
Complete Pi Testnet-ready application with Unified Build System architecture.

## Directory Structure

```
smartcontract-control-gate/
├── app/
│   ├── api/                          # API Routes (optional, non-blocking)
│   │   ├── health/
│   │   │   └── route.ts             # Health check endpoint
│   │   ├── logs/
│   │   │   └── route.ts             # Execution logs API (optional sync)
│   │   └── config/
│   │       └── route.ts             # System configuration API
│   ├── layout.tsx                    # Root layout with Pi SDK script
│   ├── page.tsx                      # Main application page
│   └── globals.css                   # Global styles & theme tokens
│
├── components/                       # React Components
│   ├── contract-request-form.tsx    # Step 1: Create Request
│   ├── contract-preview.tsx         # Step 2: Preview
│   ├── policy-check.tsx             # Step 3: Policy Validation
│   ├── execution-status.tsx         # Step 4: Execute & Result
│   ├── execution-history.tsx        # Activity Log viewer
│   ├── wallet-status.tsx            # Pi Wallet connection UI
│   ├── testnet-banner.tsx           # Testnet mode indicator
│   ├── offline-mode-banner.tsx      # Offline mode indicator
│   ├── system-status.tsx            # System health display
│   ├── error-boundary.tsx           # Error handling wrapper
│   └── ui/                          # shadcn/ui components
│
├── hooks/                            # Custom React Hooks
│   ├── use-pi-wallet.ts             # Pi SDK integration & wallet management
│   ├── use-local-storage.ts         # Local storage for execution logs
│   └── use-mobile.ts                # Mobile responsive utilities
│
├── lib/                              # Core Logic & Configuration
│   ├── types.ts                     # TypeScript interfaces (Unified Record Schema)
│   ├── app-config.ts                # Application configuration
│   ├── app-documentation.ts         # System documentation
│   └── utils.ts                     # Utility functions
│
├── public/                           # Static Assets
│   └── pi-sdk-init.js               # Pi SDK initialization script
│
└── IMPLEMENTATION.md                 # Implementation details

```

## Core Files Breakdown

### 1. Wallet Logic Module (`/hooks/use-pi-wallet.ts`)
**Purpose:** Complete Pi SDK integration for Testnet
**Features:**
- Pi SDK initialization with `Pi.init({ version: "2.0", sandbox: true })`
- Wallet connection via `Pi.authenticate()`
- Real transaction signing via `Pi.createPayment()`
- Connection state management
- localStorage persistence

**Key Functions:**
```typescript
- connect(): Triggers Pi authentication dialog
- disconnect(): Clears connection state
- signTransaction(): Creates real Pi payment with TXID
```

### 2. Local Storage System (`/hooks/use-local-storage.ts`)
**Purpose:** Client-side data persistence (primary storage)
**Features:**
- Stores all execution logs in browser localStorage
- Automatic save on each transaction
- Load logs on app initialization
- No backend dependency

**Storage Schema:**
```typescript
{
  "smartcontract_logs": [
    {
      id, referenceId, timestamp, method, 
      status, executionHash, contractAddress,
      gasUsed, policyCheckResult
    }
  ]
}
```

### 3. API Routes (Optional, Non-Blocking)

#### `/app/api/health/route.ts`
**Purpose:** System health check
**Endpoint:** `GET /api/health`
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "service": "SmartContract Control Gate"
}
```

#### `/app/api/logs/route.ts`
**Purpose:** Optional backend sync for logs
**Endpoint:** `POST /api/logs`
**Note:** Fails silently if server down - app continues offline

#### `/app/api/config/route.ts`
**Purpose:** System configuration retrieval
**Endpoint:** `GET /api/config`

### 4. Unified Build System Implementation

#### Core Engine (`/app/page.tsx`)
**Orchestrates:** Single workflow execution
- Step management (form → preview → policy → execution)
- State coordination
- Log persistence
- Offline mode handling

#### Unified Record Schema (`/lib/types.ts`)
**Interfaces:**
```typescript
- ContractRequest: Complete request structure
- PolicyCheckResult: Validation results with individual checks
- ExecutionLog: Transaction record with TXID
- ActionConfig: Validation rules configuration
```

#### Action Configuration (`/components/policy-check.tsx`)
**Validates:**
- Contract address format (0x... pattern)
- Method name (valid identifier)
- Parameters (valid JSON)
- Reason (minimum length)

**Extensible:** Add new checks without structural changes

## Data Flow

1. **User Input** → ContractRequestForm
2. **Preview** → ContractPreview (validation)
3. **Policy Check** → PolicyCheck (runs validation rules)
4. **Wallet Check** → Verifies Pi Wallet connected
5. **Execution** → ExecutionStatus (calls Pi.createPayment)
6. **Pi Network** → Returns real TXID
7. **Log Storage** → useLocalStorage (saves to browser)
8. **Optional Sync** → POST /api/logs (non-blocking)

## Offline Mode Support

The app works completely offline:
- All data stored in browser localStorage
- Pi Wallet provides user identity
- No backend authentication required
- API calls fail gracefully
- Offline banner indicates network status

## Testnet Configuration

**Pi SDK Integration:**
- Script: `https://sdk.minepi.com/pi-sdk.js`
- Init: `Pi.init({ version: "2.0", sandbox: true })`
- Network: Pi Testnet
- Transaction IDs: Real Testnet TXIDs from Pi.createPayment()

## Security & Privacy

- User data stays in browser
- No server-side user tracking
- Pi Wallet handles authentication
- Transactions signed by Pi Network
- Local execution logs

## Expandability

To add new features:
1. Add new validation rule in ActionConfig
2. Add new check in PolicyCheck component
3. Extend ContractRequest interface if needed
4. No core engine changes required

**This is the Unified Build System in action.**
