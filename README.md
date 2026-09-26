# AuraFinance OS — Autonomous AI Wealth Operating System
> Web Innovation Unleashed Submission | 100% Client-Side, Privacy-First Architecture

AuraFinance OS is a zero-backend, client-side autonomous wealth simulator and personal finance operating system. Engineered with React 19, TypeScript, Dexie.js (IndexedDB), and Google Gemini AI, it combines institutional GAAP double-entry bookkeeping with real-time liquidity particle telemetry, cultural decentralized banking (Kametis, IOUs), precious metals bullion valuation, and bilingual multimodal receipt intelligence.

---

## Key Highlights

- **100% Client-Side Architecture:** Zero server dependencies, zero external database leaks. All financial ledgers and encryption keys stay in your browser.
- **Mathematical Coherence Sentinel:** Universal Single-Source-of-Truth (SSOT) reconciliation engine enforcing debit-credit equality and 50/30/20 budget equilibrium down to $0.01 precision.
- **Dual-Intelligence AI Copilot (`⌘J`):** Features conversational Wealth Mentor & Gen-Z Roast modes, grounded directly in your active IndexedDB records.
- **Visual Site Map (`⌘M`):** Interactive topology tree across all 6 financial domains and 21 sub-engines with instant-filter jump navigation.
- **Multimodal Receipt OCR:** Client-side receipt scanning and auto-categorization powered by Gemini 2.0 Flash with deterministic fallback.
- **Precious Metals Bullion Vault:** Real-time spot valuation converting between Grams, Troy Ounces, and South Asian Tolas.
- **Audit-Grade 24-Hour Statement PDF:** One-click institutional-grade statement generated entirely in browser memory.
- **Zero-Downtime Multi-Language Engine:** Instant locale and RTL mirroring across English, Urdu (اردو), Roman Urdu, Arabic (العربية), and more.

---

## Prerequisites
- **Node.js:** `>= 20.x.x`
- **Package Manager:** `npm >= 10.x.x` (or `pnpm >= 9.x.x`)
- **Modern Browser:** Google Chrome `>= 120`, Brave, Microsoft Edge, or Apple Safari `>= 17`

---

## 1-Minute Quick Start (Local Setup)

1. **Clone Repository:**
   ```bash
   git clone https://github.com/your-username/aurafinance-os.git
   cd aurafinance-os
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   The project includes a pre-configured, evaluation-ready Gemini API key.
   To override with your personal key, create a `.env.local` file:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Production Build & Preview:**
   ```bash
   npm run build
   npm run preview
   ```

---

## Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `⌘K` / `Ctrl+K` | Open Omnimodal Command Palette (Voice, Text, OCR) |
| `⌘J` / `Ctrl+J` | Open Embedded Financial AI Chatbot (Copilot) Drawer |
| `⌘M` / `Ctrl+M` | Open Searchable Visual Site Map Topology Modal |
| `Esc` | Close any active modal or slide-over drawer |

---

## Pre-Configured Evaluation Profiles

Switch profiles instantly via the top navigation bar or **Settings -> Restore from JSON**:

| Profile / Role | Demo ID / Handle | Pre-Seeded Financial Scenario | Key Features to Test |
| :--- | :--- | :--- | :--- |
| **System Administrator & Master Auditor** | `admin@aurafinance.os` | Enterprise balance sheet ($250,000+ liquidity, 150+ journal lines, commercial accounts payable/receivable). | Full Trial Balance reconciliation, SHA-256 audit trail log, 24-hour bank statement PDF export. |
| **Global Tech Freelancer** | `freelancer@aurafinance.os` | Multi-currency cash flow (USD, PKR, EUR), recurring SaaS subscriptions, active tax reserve bucket. | Currency cross-rate converter, live Cash-Flow Particle Stream, subscription cancellation drafts. |
| **High School / College Student** | `student@aurafinance.os` | Micro-allowances, cafeteria expenses, peer IOUs, saving for a $500 gaming console. | Impulse Buy Interceptor, WhatsApp IOU Splitter, Gen-Z Roast AI Mode. |
| **Commodities & Real Estate Investor** | `investor@aurafinance.os` | Physical gold bullion holdings (24K/22K Tolas and Grams), rotating Kameti/Chit Fund circles. | Tola-to-Gram live re-valuation, Kameti rotary savings dial, Zakat & Karma Allocator. |

Master Seed payload is bundled at `public/demo-vault.json` for one-click manual imports.

---

## Project Structure

```
├── public/                 # Static assets, icons, demo-vault.json
├── src/
│   ├── components/         # Modular UI components
│   │   ├── ai/             # Embedded Copilot Chatbot slide-over
│   │   ├── layout/         # Site Map Modal, Navigation, Header
│   │   ├── ledger/         # General Journal, Trial Balance, T-Accounts
│   │   ├── charts/         # Particle Stream, Sankey, Allocation Donut
│   │   ├── dashboard/      # Hero Liquidity Banner, Precious Metals Card
│   │   └── voice/          # Audio Waveform Canvas, Hey Aura HUD
│   ├── context/            # Coherent Financial State Provider (SSOT)
│   ├── db/                 # Dexie.js IndexedDB schema & hydration
│   ├── services/           # Double-entry, FX, Commodities, PDF Gen
│   ├── store/              # Zustand global application state
│   ├── views/              # Route-split lazy views (Dashboard, Ledger, etc.)
│   └── index.css           # Retina Design System & WCAG AAA Tokens
├── docs/                   # Submission Architecture, Specs, User Journey
└── package.json            # Project dependencies & build scripts
```

---

## License

MIT License. Engineered for the **Web Innovation Unleashed Global Category**.
