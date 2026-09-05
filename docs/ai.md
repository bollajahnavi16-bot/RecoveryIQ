# RecoverIQ — AI Pipeline & Machine Learning Documentation

## 1. Overview & Strategy

RecoverIQ implements a **Hybrid AI Architecture**:
- **Supervised ML Models** (Scikit-Learn) handle quantitative financial probability estimation and failure classification with calibrated confidence.
- **Deterministic Rule Engines** handle hard business policy guardrails.
- **Analytical NL Services** handle natural language query responses over real database facts.

---

## 2. Model 1: Recovery Probability Pipeline

### Target Variable
Binary indicator $y \in \{0, 1\}$ representing payment recovery outcome within 72 hours.

### Input Features (11 Context Features)
- `amount` (float): Transaction target value in INR
- `payment_method` (categorical): `UPI`, `CREDIT_CARD`, `DEBIT_CARD`, `NET_BANKING`, `NACH_EMANDATE`
- `failure_category` (categorical): `TEMPORARY`, `CUSTOMER_ACTION_REQUIRED`, `PERMANENT`, `UNKNOWN`
- `previous_attempts` (int): Number of prior retry attempts (0 to 4)
- `customer_success_rate` (float): Historical payment completion ratio (0.0 to 1.0)
- `customer_tenure_days` (int): Account tenure in days
- `subscription_status` (categorical): `ACTIVE`, `INACTIVE`, `NONE`
- `invoice_age_days` (int): Age of invoice/bill
- `previous_payment_count` (int): Total lifetime payments
- `previous_successful_payment_count` (int): Total successful payments
- `previous_failed_payment_count` (int): Total failed payments

### Model Choice & Calibration
`RandomForestClassifier(n_estimators=120, max_depth=10, random_state=42)` combined with probability calibration.

### Performance Benchmark
- **Precision**: `0.7879`
- **Recall**: `0.9107`
- **F1 Score**: `0.8449`
- **ROC-AUC**: `0.8675`
- **Brier Loss**: `0.1417` (Well-calibrated probability score)

### Performance & Calibration Charts

![ROC & Precision-Recall Curve](images/roc_pr_curve.png)

![Probability Calibration Curve](images/calibration_curve.png)

![Top Feature Drivers](images/feature_importance.png)


---

## 3. Model 2: Failure Classification Pipeline

### Target Classes
1. `TEMPORARY`: Bank server delays, gateway timeouts, network drops.
2. `CUSTOMER_ACTION_REQUIRED`: Authentication required, card limit exceeded, OTP expiration.
3. `PERMANENT`: Invalid account, blocked card, account closed.
4. `UNKNOWN`: Unhandled error codes.

### Model Choice
`GradientBoostingClassifier(n_estimators=100, random_state=42)` mapping transaction metadata + failure reason string encoders.

### Accuracy
- **Test Accuracy**: `100.0%` (on synthetic benchmark taxonomy).

---

## 4. Expected Recovery Value (ERV) Mathematical Optimization

Every candidate action $a \in \{\text{RETRY\_NOW}, \text{RETRY\_LATER}, \text{CUSTOMER\_NOTIFICATION}, \text{HUMAN\_REVIEW}, \text{STOP}\}$ is evaluated using:

$$\text{ERV}(a) = (P(\text{recovery} \mid a) \times \text{Amount}) - \text{InterventionCost}(a) - \text{RiskPenalty}(a)$$

Where:
- $\text{InterventionCost}(\text{RETRY\_NOW}) = ₹5.0$
- $\text{InterventionCost}(\text{RETRY\_LATER}) = ₹5.0$
- $\text{InterventionCost}(\text{CUSTOMER\_NOTIFICATION}) = ₹2.0$
- $\text{InterventionCost}(\text{HUMAN\_REVIEW}) = ₹50.0$
- $\text{RiskPenalty}(\text{RETRY\_NOW}) = ₹25.0$ (immediate duplicate decline penalty)
- $\text{RiskPenalty}(\text{RETRY\_LATER}) = ₹10.0$ (decayed timing penalty)
