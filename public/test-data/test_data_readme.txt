========================================================================
BUDGETBASICS — OFFICIAL SRS TEST DATA REPOSITORY
TechWiz 7: The World Tech Championship
Category: Web Innovation Unleashed | Theme: NextGen BudgetBee
========================================================================

DOCUMENT OVERVIEW:
This directory contains pre-defined sample JSON datasets used to validate,
demonstrate, and test all functional and non-functional requirements of the
BudgetBasics Single Page Application (SPA).

DATASET MANIFEST:
1. sample_student_budget.json
   - Contains baseline monthly income streams (allowances, work-study, stipends).
   - Categorized fixed expenses (hostel rent, transit, connectivity).
   - Categorized variable expenses (canteen, study supplies, entertainment).
   - Expected 50/30/20 ratio breakdown and surplus calculations.

2. sample_spending_categories.json
   - Defines the 7 student spending categories mandated in SRS Section 1.6.5.
   - Includes real-world Need vs. Want classification criteria.

3. sample_savings_goals.json
   - Demonstrates milestone tracking for Emergency Buffers, Laptops, and Certifications.
   - Contains goal targets, current balances, and algorithmic months-to-completion.

DATA PRIVACY & STORAGE ARCHITECTURE:
- In strict adherence to SRS Section 1.2 & 1.5, BudgetBasics performs zero server-side
  telemetry or remote database persistence.
- All session data is stored client-side via Dexie.js (IndexedDB) and Web Storage.
- Users can reset or seed personas at any time with a single click.

© Aptech Limited — TechWiz 7 Championship Submission
========================================================================
