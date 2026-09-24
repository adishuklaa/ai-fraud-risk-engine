# AI Fraud & Risk Rules Engine

## Product Overview
The **AI Fraud & Risk Rules Engine** is a prototype of a real-time risk-scoring application designed for financial institutions and payment gateways. It evaluates incoming transactions against a set of risk factors, calculates a cumulative risk score, and determines a recommended action (Approve, Flag, Decline). Most importantly, the product provides **explainability**—surfacing the exact rules that triggered a risk alert to help analysts understand why an AI system made a specific decision.

## Why I Built This (Problem Statement)
Fraud detection in modern FinTech is a constant battle between stopping bad actors and avoiding friction for legitimate users. Traditional rule-based systems are often rigid, leading to high false positives (declining good customers) or false negatives (letting fraud slip through). Machine Learning models are better at detecting subtle anomalies, but they often act as "black boxes." When a transaction is declined by an AI model without explanation, it creates frustration for customer support and the end-user. 

I built this prototype to demonstrate how to balance automated risk scoring with human-readable explainability, ensuring that fraud analysts can trust and audit the system's decisions.

## Target Users & User Personas
1. **Fraud Analysts (Primary):** Needs to quickly review flagged transactions, understand why they were flagged, and make a final decision. They value speed, context, and clear explanations.
2. **Data Scientists / Risk Managers:** Needs to monitor the overall health of the risk rules. They look at aggregate metrics (e.g., top triggered rules, risk distribution) to tune the engine and reduce false positives.
3. **Customer Support:** Needs to know *why* a customer's card was declined so they can explain it clearly and guide the customer on next steps.

## Product Goals & Hypothesis
- **Goal:** Reduce the time it takes for a fraud analyst to review a flagged transaction by 50%.
- **Hypothesis:** By providing a clear, rule-based explanation alongside an AI risk score, analysts will be able to make faster, more accurate decisions compared to a system that only provides a numeric score.

## Key Features
- **Real-Time Transaction Simulator:** Generates synthetic transaction data with various risk profiles.
- **Dynamic Risk Scoring:** Calculates a risk score (0-100) based on weighted risk factors (amount, country, velocity, IP risk, device, etc.).
- **Explainable Decisions:** Clearly lists the specific rules triggered for each transaction, including the weight of each rule.
- **Action Recommendations:** Automatically categorizes transactions into Approve, Flag (manual review), or Decline.
- **Analytics Dashboard:** Provides aggregate views of transaction volumes, risk distributions, and the most frequently triggered rules.

## User Journey & Workflow
1. A transaction enters the system.
2. The rules engine evaluates the transaction context (amount, location, velocity, etc.).
3. The system assigns a risk score and an action recommendation.
4. An analyst logs into the dashboard, filtering for "Flagged" transactions.
5. The analyst selects a transaction, reviews the "Explainability" section to see the triggered rules, and confirms the context (e.g., "Ah, they are traveling in a new country and using a new device").
6. The analyst makes a final Approve/Decline decision (simulated).

## Requirements & User Stories
- **Epic:** Real-Time Fraud Monitoring
  - *As a fraud analyst, I want to see a list of recent transactions so that I can monitor system activity.*
  - *As a fraud analyst, I want to see a risk score for each transaction so I know which ones require immediate attention.*
- **Epic:** Explainable AI
  - *As a risk manager, I want to see exactly which rules contributed to a high risk score so I can audit the system's logic.*
- **Epic:** System Analytics
  - *As a data scientist, I want to see a dashboard of the most triggered rules so I can tune them if they are causing too many false positives.*

## Acceptance Criteria
- The dashboard must display total volume, approved, flagged, and declined metrics.
- Clicking a transaction must open a detail view showing the risk score, context, and triggered rules.
- The risk score must be normalized between 0 and 100.
- Transactions with a score > 80 must be automatically marked as "Decline".

## Tradeoffs & UX Decisions
- **Rule-Based vs. Pure ML:** For this prototype, I used a weighted rule-based engine rather than a pure Machine Learning model. *Tradeoff:* While less sophisticated than deep learning, a rule-based approach is 100% explainable, which is critical for demonstrating the UX of explainability.
- **Information Density:** The transaction list is dense, prioritizing data (Amount, Merchant, Score) over white space, as analysts need to scan information quickly.
- **Color Coding:** Used standard traffic-light colors (Green=Approve, Yellow=Flag, Red=Decline) to reduce cognitive load.

## Data & Assumptions (Synthetic Data)
The app uses synthetic data generated in-browser. It assumes:
- Transactions have contextual metadata (Device, IP Risk Score, Account Age).
- 20% of generated transactions are intentionally anomalous to populate the dashboard with interesting data.

## Architecture & Tech Stack
- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite (for fast HMR and optimized builds)
- **Styling:** Tailwind CSS (for rapid, utility-first UI development)
- **Icons:** Lucide React
- **Charts:** Recharts (for lightweight, responsive data visualization)
- **Data Management:** Local component state (simulating a real-time WebSocket feed)

## KPI Framework (How to measure success)
- **Review Time:** Average time spent by an analyst reviewing a flagged transaction.
- **False Positive Rate:** Percentage of flagged/declined transactions that were actually legitimate (requires feedback loop).
- **Auto-Decision Rate:** Percentage of transactions the system handles automatically without human intervention.

## Roadmap & Future Opportunities
1. **MVP (Current):** Static rules engine, synthetic data, basic dashboard.
2. **Phase 2 (Feedback Loop):** Allow analysts to click "Approve" on a flagged transaction, feeding that decision back into the model to adjust rule weights.
3. **Phase 3 (Graph Analysis):** Introduce network graphs to show relationships between transactions (e.g., multiple accounts using the same IP address).
4. **Phase 4 (Real ML Integration):** Connect the frontend to a real Python backend running an XGBoost or Isolation Forest model.

## Screenshots
*(Note: Screenshots are generated by the parent agent.)*
- `screenshots/dashboard.png` - The main dashboard view.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/adishuklaa/ai-fraud-risk-engine.git
   ```
2. Navigate to the directory:
   ```bash
   cd ai-fraud-risk-engine
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables
No environment variables are required for this prototype as it uses locally generated synthetic data. A `.env.example` is not needed.

### Project Structure
```
src/
├── App.tsx          # Main application component & dashboard layout
├── data.ts          # Data types, rule definitions, and synthetic data generator
├── index.css        # Tailwind directives and global styles
└── main.tsx         # React entry point
```

## Limitations & Future Improvements
- **State Persistence:** Currently, data is lost on refresh. Future versions could use `localStorage` or a real backend.
- **Accessibility:** Keyboard navigation and ARIA labels need improvement for production readiness.
- **Mobile Responsiveness:** While somewhat responsive, the dashboard is optimized for desktop viewing (which is standard for analyst tools).

---
