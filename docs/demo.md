# RecoverIQ — Competition Demo Guide (90-Second Walkthrough)

This guide provides judges and evaluators with a 90-second step-by-step walkthrough of **RecoverIQ** for the **Razorpay AI Buildathon — AI Revenue Recovery Track**.

---

## Quick Start Demo Instructions

### 1. Launch the Application
- Backend API: `uvicorn backend.app.main:app --reload` (`http://localhost:8000`)
- Frontend App: `cd frontend && npm run dev` (`http://localhost:5173`)

---

## 2. 90-Second 1-Click Demo Stepper

Click the **"Competition Demo"** button in the top navigation bar to open the interactive demo modal.

### Scenario A — High-Probability Temporary Recovery
1. Select **SCENARIO A (Temporary Timeout Failure)**.
2. Click **Run Scenario**.
3. **Observed AI Output**:
   - Recovery Probability: **87%**
   - Failure Category: `TEMPORARY`
   - Expected Recovery Value: **₹4,320**
   - Recommended Action: `RETRY_LATER` (30 min delay)
   - Policy Guardrail: **APPROVED**
   - Simulated Outcome: **RECOVERED ₹4,999**
4. Click **Inspect Full Audit Trail** to view the timeline, customer context, and policy check table.

### Scenario B — Permanent Failure Cutoff (Knowing When NOT to Act)
1. Select **SCENARIO B (Permanent Account Failure)**.
2. Click **Run Scenario**.
3. **Observed AI Output**:
   - Previous Attempts: **3**
   - Recovery Probability: **8%**
   - Failure Category: `PERMANENT`
   - Recommended Action: `STOP`
   - Policy Guardrail: **BLOCKED / REJECTED**
   - Outcome: **STOPPED** (Prevents bank retry storm penalties).

### Scenario C — High-Value Human-in-the-Loop Guardrail
1. Select **SCENARIO C (High Value Guardrail)**.
2. Click **Run Scenario**.
3. **Observed AI Output**:
   - Transaction Amount: **₹25,000** (Exceeds ₹10,000 merchant limit)
   - Policy Guardrail: **REQUIRES_HUMAN**
   - Action: Routed to **Recovery Queue $\rightarrow$ Human Review Queue**.
4. Go to **Recovery Queue**, click **Approve & Execute** to authorize.

---

## 3. Key Differentiators to Highlight
- **Expected Recovery Value (ERV)** vs Naive Retry
- **Deterministic Policy Guardrails** enforcing merchant autonomy settings
- **Baseline vs RecoverIQ Experimentation Engine** demonstrating +38.8% revenue lift
- **Natural Language Merchant Assistant** answering database questions without metric hallucination
