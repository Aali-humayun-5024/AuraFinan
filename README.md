# BudgetBasics — NextGen BudgetBee
> **TechWiz 7: The World Tech Championship** · *Category: Web Innovation Unleashed*  
> **Software Requirements Specification (SRS) Version 1.0 Full Compliance**  
> Live Deployment: [https://aura-finance-silk.vercel.app/](https://aura-finance-silk.vercel.app/)

**BudgetBasics** is a responsive, single-page application (SPA) designed to empower students, college learners, and beginners with practical personal budgeting fundamentals. Built with React 19, TypeScript, Tailwind CSS, and Dexie.js (IndexedDB), BudgetBasics operates with **100% client-side privacy**—no backend server, external database, or login storage required.

---

## 🐝 Core SRS Modules (A to Z Compliance)

1. **50-30-20 Budget Module (SRS 1.6.3):**
   - Golden split calculator allocating 50% for Needs, 30% for Wants, and 20% for Savings.
   - Comprehensive input labels, placeholders, allowance presets (`$300`, `$750`, `$1,200`, `$2,500`), and interactive sliders.
   - Blank and negative input validation with clear alerts.
   - Mandatory educational estimate note.

2. **Budgeting Basics Module (SRS 1.6.1):**
   - Core concepts: Inflows, fixed expenses vs. variable daily leaks, requirements, wants, and savings.
   - Comprehensive sample student monthly budget table.
   - 5-Question interactive knowledge check quiz with instant explanations and score tracker.

3. **Needs vs. Wants Module (SRS 1.6.2):**
   - Essential and optional spending category breakdown.
   - Interactive classification game: classify 8 realistic student expenses with instant feedback.
   - Visual 4-Step Purchase Decision Flowchart (Necessity $\to$ Budget Fit $\to$ 48-Hour Cool-Off $\to$ Action).

4. **Savings Goals Module (SRS 1.6.4):**
   - Enter goal name, target amount, current savings, and monthly contribution.
   - Real-time calculation of remaining balance and estimated months to goal completion.
   - Animated progress bars and encouraging savings tips.
   - Empty, negative, and non-numeric value validation.

5. **Expense Planner Demonstration (SRS 1.6.5):**
   - Add daily student expense entries: Date, Category (Food, Transport, Education, Entertainment, Shopping, Utilities, Miscellaneous), Description, Amount.
   - Temporary on-screen session table with inline Edit and Remove controls.
   - Real-time total planned expenses and remaining allowance balance.

6. **Money Mistakes Module (SRS 1.6.6):**
   - 5 Common Mistakes: Impulse flash-sale buying, ignoring the "latte factor", late payments & penalties, zombie auto-renewing subscriptions, and mental budgeting.
   - Realistic student scenarios, financial consequences, and actionable corrective protocols in interactive accordions.

7. **Infographics & Learning Gallery (SRS 1.6.7):**
   - Original visual SVG infographics: The 50/30/20 Ratio Wheel, Needs vs. Wants Decision Tree, Student Monthly Budget Cycle, 30-Day Micro-Saving Challenge, and Early Compound Growth.
   - Filter gallery by topic: `All`, `Budgeting`, `Needs/Wants`, `Savings`, `Challenges`.

8. **AI Chatbot Assistant (BudgetBee) (SRS 1.6.8):**
   - Question input area and Ask button.
   - Suggested prompts: *"What is a need?"*, *"How much should I save?"*, *"How do I avoid overspending?"*, *"Explain 50/30/20 rule"*.
   - Keyword and rule-based matching with safe fallback response.
   - Prominent educational disclaimer (not formal financial advice).

9. **Search, Sort, and Filter (SRS 1.6.9):**
   - Keyword search across tips, guides, and budgeting rules.
   - Topic tag filtering (`#Saving`, `#Needs`, `#Expenses`, `#Goals`, `#Budgeting`, `#Mistakes`).
   - Sort by: Most Relevant, Newest, A-Z. Clear empty-state alert when no match found.

10. **About Us, Feedback, and Contact Us (SRS 1.6.10):**
    - Project mission, creators, and TechWiz 7 specification.
    - Validated client-side feedback form with 1–5 star rating and instant confirmation.
    - Contact channels: official email, phone, web portal, and validated inquiry form.

11. **Additional Features (SRS 1.6.11):**
    - Responsive top navigation bar with active, hover, and focus states.
    - Prominent **50-30-20 Rule** link highlighted directly on the navbar.
    - Dark & Light mode toggle with readable contrast.
    - Real-time visitor counter & live date/time clock.
    - Financial quotes and tips cycling ticker.
    - Searchable visual sitemap modal (`⌘M`).
    - Expandable **"More Tools"** menu housing advanced power tools (General Ledger, Daily Bazaar, Price Sentinel, Split Ledger, Academic CPA Labs, Settings & Encrypted Vault).

---

## 🛠️ Technology Stack
- **Frontend Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Client Storage:** Dexie.js (IndexedDB)
- **Visuals & Charts:** Lucide Icons, Framer Motion, Canvas Confetti
- **Build Tool:** Vite v8

---

## 🚀 Quick Start
```bash
# Clone the repository
git clone https://github.com/Aali-humayun-5024/AuraFinan.git
cd AuraFinan

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```
