# AuraFinance OS — Tested Evaluation Profiles & Demo Access
## Target: Web Innovation Unleashed Global Category

AuraFinance OS operates under a **Zero-Backend, Local-First Architecture**. There are no login walls, paywalls, or cloud authentication steps. Evaluators can explore all enterprise and consumer modules instantly using pre-configured scenarios.

---

## 1. Instant Persona Switching

Evaluators can switch between financial universes in two ways:
1. **Top Navigation Bar:** Click the Persona chip on the left of the header to open the quick-switcher menu.
2. **Settings Panel -> Vault Hydration:** Import bespoke scenarios from the JSON vault or load presets.

---

## 2. Tested Profile Directory

| Profile / Role | Demo Handle | Pre-Seeded Financial Scenario | Key Features & Verification Steps |
| :--- | :--- | :--- | :--- |
| **System Administrator & Master Auditor** | `admin@aurafinance.os` | Enterprise-scale balance sheet with $250,000+ liquidity, 150+ journal transactions, and commercial accounts payable. | 1. Navigate to **General Ledger** -> Inspect live Trial Balance equality ($0.00 variance).<br>2. Click **Export CSV** or **View T-Accounts**.<br>3. Open TopNav -> Click **24H Statement PDF** -> Verify audit statement generation in browser memory. |
| **Global Tech Freelancer** | `freelancer@aurafinance.os` | Multi-currency cash flow (USD, PKR, EUR), recurring SaaS subscriptions, active tax reserve bucket. | 1. Open **Dashboard** -> Observe Live Cash-Flow Particle Stream velocity.<br>2. Switch base currency between USD, EUR, and PKR -> Watch all figures convert dynamically.<br>3. Navigate to **Subscriptions** -> View cancellation request draft generators. |
| **High School / College Student** | `student@aurafinance.os` | Micro-allowances, cafeteria expenses, peer IOUs, saving for a $500 gaming console. | 1. Press `⌘J` / `Ctrl+J` -> Switch Copilot to **Gen-Z Roast Mode** -> Ask *"Can I afford a $150 dinner tonight?"*.<br>2. Navigate to **Impulse Interceptor** -> Trigger a 48-hour cooling-off lock.<br>3. Check **Peer-to-Peer Bill Splitter** -> Generate a WhatsApp settlement link. |
| **Commodities & Real Estate Investor** | `investor@aurafinance.os` | Physical gold and silver bullion holdings (24K/22K Tolas and Grams), rotating Kameti/Chit Fund circles. | 1. Scroll to the **Precious Metals Bullion Vault** on the Dashboard.<br>2. Switch weight unit toggle between **Grams (g)**, **Troy Oz (oz t)**, and **Tola (11.66g)**.<br>3. Inspect Account 1060 spot valuation and unrealized P&L.<br>4. Explore the **Kameti Rotary Savings Dial** in Split Ledger. |

---

## 3. Master Seed Data Payload (`/demo-vault.json`)

The application automatically hydrates authentic data from `src/data/masterSeed.json` on the first browser visit.

To manually re-hydrate or test raw import pipelines:
1. Access the bundled JSON directly at: `http://localhost:5173/demo-vault.json`
2. In the application, navigate to **Settings** -> **Encrypted Vault Backup** -> **Restore from JSON**.
3. Select `demo-vault.json` to instantly re-populate all double-entry accounts, commodity inventories, and transaction logs.
