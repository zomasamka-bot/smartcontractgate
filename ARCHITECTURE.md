# System Architecture - SmartContract Control Gate

## Overview

The SmartContract Control Gate is built on the **Unified Build System** architecture, which guarantees scalability and maintainability without requiring structural changes when adding new features.

## Core Architecture Components

### 1. Core Engine (Orchestration Layer)

**Location:** `/app/page.tsx`

**Responsibilities:**
- Workflow orchestration
- State management coordination
- Event handling and routing
- Cross-component communication

**Flow:**
```
User Input → Validation → Preview → Policy Check → Wallet Sign → Execute → Log
```

**Key Methods:**
- `handleFormSubmit()`: Entry point, validates and stores request
- `handlePreviewProceed()`: Confirms data and advances workflow
- `handlePolicyComplete()`: Generates reference ID and initiates execution
- `handleExecutionComplete()`: Persists log and triggers sync
- `handleReset()`: Resets workflow to initial state

### 2. Unified Record Schema (Data Layer)

**Location:** `/lib/types.ts`

**Core Entities:**

```typescript
ContractRequest {
  id, referenceId, contractAddress, method, 
  parameters, reason, status, timestamp, 
  executionHash, policyCheckResult
}

PolicyCheckResult {
  passed, checks[], timestamp
}

ExecutionLog {
  id, referenceId, timestamp, method, status,
  executionHash, contractAddress, gasUsed, 
  error, policyCheckResult
}

ActionConfig {
  type, enabled, validations[]
}

ValidationRule {
  field, rule, value, message
}
```

**Design Principles:**
- Immutable records (timestamps never change)
- Complete audit trail
- Self-contained (all related data embedded)
- Type-safe (TypeScript interfaces)

### 3. Action Configuration System (Validation Layer)

**Location:** `/lib/validation-engine.ts`

**Architecture:**
```
ValidationEngine
  ├── Core Validators (required, address, minLength, etc.)
  ├── Custom Validators (extensible via addValidator)
  └── Validation Rules (configuration-driven)
```

**Extensibility:**
```typescript
// Add new validator without changing structure
validationEngine.addValidator('custom', (value, param) => {
  // Custom logic
  return true/false;
});
```

**Pre-Execution Checks:**
1. Form validation (client-side)
2. Policy validation (business rules)
3. Wallet validation (connection status)
4. Final validation before signing

### 4. State Management System (Persistence Layer)

**Components:**

#### Local Storage Hook
**Location:** `/hooks/use-local-storage.ts`

**Features:**
- Cross-tab synchronization via Storage API
- Atomic write operations
- Version control
- Quota exceeded recovery
- Event-driven updates

**Flow:**
```
Update → Serialize → localStorage.setItem() → Storage Event → 
Cross-tab Sync → Deserialize → Update UI
```

#### State Manager
**Location:** `/lib/state-manager.ts`

**Features:**
- Centralized app state
- Subscribe/notify pattern
- Automatic persistence
- Cross-tab coordination

**Usage:**
```typescript
stateManager.setState({ currentStep: 'preview' });
stateManager.subscribe((state) => {
  // React to state changes
});
```

#### Wallet State
**Location:** `/hooks/use-pi-wallet.ts`

**Features:**
- Pi SDK lifecycle management
- Connection state persistence
- Debug information tracking
- Cross-component wallet status

### 5. Error Management System (Observability Layer)

**Location:** `/lib/error-logger.ts`

**Architecture:**
```
Error Event → ErrorLogger → 
  ├── Console (severity-based)
  ├── localStorage (persistent)
  └── UI Alerts (user-facing)
```

**Severity Levels:**
- **Low:** Informational, no action needed
- **Medium:** Warning, recoverable
- **High:** Error, may impact functionality
- **Critical:** Fatal, requires immediate attention

**Error Context:**
- Stack trace
- User agent
- Current URL
- Timestamp
- Custom context

### 6. Pi SDK Integration (Blockchain Layer)

**Location:** `/hooks/use-pi-wallet.ts`

**Initialization Sequence:**
```
1. Detect Pi Browser (user agent check)
2. Wait for window.Pi (polling with timeout)
3. Call Pi.init({ version: "2.0", sandbox: true })
4. Mark SDK as ready
5. Restore previous connection if available
```

**Authentication Flow:**
```
1. User clicks "Connect Wallet"
2. Verify SDK ready
3. Call Pi.authenticate(["username", "payments"])
4. Wait for user approval (10s timeout)
5. Store credentials in localStorage
6. Update wallet state
7. Notify all components
```

**Transaction Flow:**
```
1. Validate wallet connected
2. Create Pi.createPayment() with metadata
3. User signs in Pi Wallet
4. Receive real transaction ID
5. Store in ExecutionLog
6. Display confirmation with Testnet link
```

## Component Architecture

### UI Component Hierarchy

```
App (page.tsx)
├── Header
│   ├── Logo/Title
│   ├── WalletStatus (connect/disconnect)
│   └── Navigation (home/activity)
├── Banners
│   ├── TestnetBanner
│   ├── OfflineModeBanner
│   └── DebugPanel
├── Main Content
│   ├── Home Page
│   │   ├── Step Indicator
│   │   ├── ContractRequestForm
│   │   ├── ContractPreview
│   │   ├── PolicyCheck
│   │   └── ExecutionStatus
│   └── Activity Page
│       └── ExecutionHistory
└── Footer
    └── SystemStatus
```

### Component Responsibilities

**ContractRequestForm:**
- Input collection
- Client-side validation
- Form state management

**ContractPreview:**
- Display confirmation data
- Back/proceed navigation
- Data verification

**PolicyCheck:**
- Execute validation rules
- Display check results
- Block execution if failed
- Wallet connection verification

**ExecutionStatus:**
- Request wallet signature
- Show signing progress
- Execute transaction
- Display result with TX link

**ExecutionHistory:**
- List all logs
- Collapsible details
- Testnet explorer links
- Policy result display

## Data Flow

### Request Creation Flow
```
User Input → Form Validation → Preview Confirmation → 
Policy Validation → Wallet Signature → Transaction Execution → 
Log Storage → UI Update → Cross-tab Sync
```

### State Synchronization Flow
```
Action → State Update → localStorage Write → Storage Event →
Other Tabs Receive Event → Parse Data → Update State → 
Notify Components → Re-render UI
```

### Error Handling Flow
```
Error Occurs → Error Logger → Categorize Severity → 
Store in localStorage → Log to Console → 
Display Alert (if user-facing) → Continue Operation (if recoverable)
```

## Extensibility Points

### Adding New Validators
```typescript
// No structural changes needed
validationEngine.addValidator('newRule', (value) => {
  return /* validation logic */;
});
```

### Adding New Policy Checks
```typescript
// Edit policy-check.tsx, add to checks array
checks.push({
  name: "New Check",
  check: () => /* logic */,
  successMessage: "...",
  failureMessage: "...",
});
```

### Adding New Pages
```typescript
// Add to page state enum
type Page = "home" | "activity" | "newPage";

// Add routing in main component
{page === "newPage" && <NewPageComponent />}
```

### Adding New Actions
```typescript
// Define in types.ts
type ActionType = "create" | "preview" | "check" | "execute" | "log" | "newAction";

// Implement handler in page.tsx
const handleNewAction = () => {
  // Logic
};
```

## Security Considerations

1. **Input Validation:** All user input validated before processing
2. **XSS Prevention:** React's built-in escaping + no dangerouslySetInnerHTML
3. **Data Integrity:** Immutable records with timestamps
4. **Wallet Security:** Pi SDK handles key management
5. **Error Exposure:** Sensitive data never logged to console
6. **Local Storage:** No sensitive data stored (only transaction logs)

## Performance Optimizations

1. **Lazy Loading:** Components loaded on demand
2. **Memoization:** React hooks prevent unnecessary re-renders
3. **Storage Efficiency:** Old logs automatically pruned
4. **Event Debouncing:** Cross-tab sync batched
5. **Error Boundaries:** Isolated component failures

## Testing Strategy

1. **Unit Tests:** Validation engine, error logger
2. **Integration Tests:** State manager, wallet integration
3. **E2E Tests:** Complete workflow in Pi Browser
4. **Cross-tab Tests:** Multiple tabs open simultaneously
5. **Error Recovery:** Force quota exceeded, network failures

## Deployment Architecture

```
User (Pi Browser)
  ↓
SmartContract Control Gate (Client-Side App)
  ├── Pi SDK (wallet integration)
  ├── localStorage (persistence)
  └── Optional Backend API (sync)
      ├── /api/health (health check)
      ├── /api/config (configuration)
      └── /api/logs (log sync)
```

**Key Points:**
- Fully functional without backend
- Backend optional for analytics/sync
- No server-side state required
- Scales horizontally (stateless)

## Monitoring & Observability

1. **Debug Panel:** Real-time SDK status (Testnet only)
2. **Error Logs:** Persistent in localStorage
3. **Execution Logs:** Complete audit trail
4. **Console Logging:** Structured with [v0] prefix
5. **User Agent Tracking:** Environment detection

## Version Control & Updates

**Storage Version:** Tracked in localStorage
- Mismatch triggers data migration
- Backward compatibility maintained
- Breaking changes versioned

**Schema Updates:**
- New fields added with defaults
- Old fields deprecated gradually
- Migration scripts for data transformation

## Conclusion

The Unified Build System architecture provides:
- **Scalability:** Add features without restructuring
- **Maintainability:** Clear separation of concerns
- **Reliability:** Comprehensive error handling
- **Extensibility:** Configuration-driven behavior
- **Performance:** Optimized for mobile
- **Security:** Defense in depth

This architecture ensures the SmartContract Control Gate can evolve to meet future requirements while maintaining stability and code quality.
