import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, precision_recall_curve, auc
from sklearn.calibration import calibration_curve

# Configure sleek dark theme aesthetic for matplotlib & seaborn
plt.style.use("dark_background")
BG_COLOR = "#0f172a"      # Slate 900
CARD_COLOR = "#1e293b"    # Slate 800
GRID_COLOR = "#334155"    # Slate 700
TEXT_COLOR = "#f8fafc"    # Slate 50
TEXT_MUTED = "#94a3b8"    # Slate 400

BRAND_BLUE = "#0066ff"
ACCENT_GREEN = "#10b981"
ACCENT_AMBER = "#f59e0b"
ACCENT_RED = "#f43f5e"
ACCENT_PURPLE = "#8b5cf6"

def setup_figure(figsize=(10, 6)):
    fig, ax = plt.subplots(figsize=figsize, facecolor=BG_COLOR)
    ax.set_facecolor(CARD_COLOR)
    ax.grid(True, color=GRID_COLOR, linestyle="--", alpha=0.5, zorder=0)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(GRID_COLOR)
    ax.spines['bottom'].set_color(GRID_COLOR)
    ax.tick_params(colors=TEXT_MUTED, labelsize=10)
    return fig, ax

def generate_all_charts(df_test, y_test, y_probs, feature_names=None, feature_importances=None, output_dir=None):
    if output_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_dir = os.path.join(base_dir, "..", "docs", "images")
    
    os.makedirs(output_dir, exist_ok=True)
    generated_files = []

    # --- 1. ROC & PRECISION-RECALL CURVE ---
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6), facecolor=BG_COLOR)
    for ax in (ax1, ax2):
        ax.set_facecolor(CARD_COLOR)
        ax.grid(True, color=GRID_COLOR, linestyle="--", alpha=0.5)
        ax.tick_params(colors=TEXT_MUTED, labelsize=10)
        for spine in ax.spines.values():
            spine.set_color(GRID_COLOR)

    # ROC
    fpr, tpr, _ = roc_curve(y_test, y_probs)
    roc_auc = auc(fpr, tpr)
    ax1.plot(fpr, tpr, color=BRAND_BLUE, lw=3, label=f"Random Forest (AUC = {roc_auc:.4f})")
    ax1.plot([0, 1], [0, 1], color=TEXT_MUTED, linestyle="--", lw=1.5, label="Random Classifier (0.50)")
    ax1.set_title("Receiver Operating Characteristic (ROC)", color=TEXT_COLOR, fontsize=13, fontweight="bold", pad=12)
    ax1.set_xlabel("False Positive Rate", color=TEXT_MUTED, fontsize=11)
    ax1.set_ylabel("True Positive Rate", color=TEXT_MUTED, fontsize=11)
    ax1.legend(facecolor=CARD_COLOR, edgecolor=GRID_COLOR, labelcolor=TEXT_COLOR, loc="lower right")

    # Precision-Recall
    prec, rec, _ = precision_recall_curve(y_test, y_probs)
    pr_auc = auc(rec, prec)
    ax2.plot(rec, prec, color=ACCENT_GREEN, lw=3, label=f"RecoverIQ Model (PR-AUC = {pr_auc:.4f})")
    ax2.set_title("Precision-Recall Curve", color=TEXT_COLOR, fontsize=13, fontweight="bold", pad=12)
    ax2.set_xlabel("Recall", color=TEXT_MUTED, fontsize=11)
    ax2.set_ylabel("Precision", color=TEXT_MUTED, fontsize=11)
    ax2.legend(facecolor=CARD_COLOR, edgecolor=GRID_COLOR, labelcolor=TEXT_COLOR, loc="lower left")

    plt.tight_layout()
    p1 = os.path.join(output_dir, "roc_pr_curve.png")
    fig.savefig(p1, dpi=300, bbox_inches="tight", facecolor=BG_COLOR)
    plt.close(fig)
    generated_files.append(p1)

    # --- 2. ECONOMIC COMPARISON CHART (Baseline vs RecoverIQ) ---
    total_txns = len(df_test)
    baseline_attempts = df_test[df_test["failure_category"] != "PERMANENT"]
    baseline_recovered_df = baseline_attempts[baseline_attempts["recovery_outcome"] == 1]
    baseline_revenue = baseline_recovered_df["amount"].sum()
    baseline_retries = len(baseline_attempts)
    baseline_wasted_cost = (baseline_retries - len(baseline_recovered_df)) * 5.0

    recoveriq_attempts = df_test[
        (df_test["predicted_prob"] >= 0.35) & 
        (df_test["failure_category"] != "PERMANENT") & 
        (df_test["previous_attempts"] < 3)
    ]
    recoveriq_recovered_df = recoveriq_attempts[recoveriq_attempts["recovery_outcome"] == 1]
    recoveriq_revenue = recoveriq_recovered_df["amount"].sum()
    recoveriq_retries = len(recoveriq_attempts)
    recoveriq_wasted_cost = (recoveriq_retries - len(recoveriq_recovered_df)) * 5.0

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6), facecolor=BG_COLOR)
    for ax in (ax1, ax2):
        ax.set_facecolor(CARD_COLOR)
        ax.grid(True, color=GRID_COLOR, linestyle="--", alpha=0.5, zorder=0)
        ax.tick_params(colors=TEXT_MUTED, labelsize=10)
        for spine in ax.spines.values():
            spine.set_color(GRID_COLOR)

    # Subplot A: Recovered Revenue Comparison
    strategies = ["Naive Baseline (Retry All)", "RecoverIQ (Adaptive AI)"]
    revenues = [baseline_revenue, recoveriq_revenue]
    colors = ["#475569", ACCENT_GREEN]
    bars1 = ax1.bar(strategies, revenues, color=colors, width=0.45, zorder=3)
    ax1.set_title("Recovered Revenue Comparison (INR)", color=TEXT_COLOR, fontsize=13, fontweight="bold", pad=12)
    ax1.set_ylabel("Revenue (₹)", color=TEXT_MUTED, fontsize=11)
    
    for bar in bars1:
        height = bar.get_height()
        ax1.annotate(f"₹{height:,.0f}",
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 5), textcoords="offset points",
                    ha='center', va='bottom', color=TEXT_COLOR, fontweight='bold', fontsize=10)

    # Subplot B: Executed Retries vs Wasted Retry Cost
    x = np.arange(2)
    w1 = 0.35
    retries_data = [baseline_retries, recoveriq_retries]
    cost_data = [baseline_wasted_cost, recoveriq_wasted_cost]

    bars2 = ax2.bar(x - w1/2, retries_data, w1, label="Total Retries Executed", color=BRAND_BLUE, zorder=3)
    ax2_cost = ax2.twinx()
    bars3 = ax2_cost.bar(x + w1/2, cost_data, w1, label="Wasted Retry Cost (₹)", color=ACCENT_RED, zorder=3)

    ax2.set_xticks(x)
    ax2.set_xticklabels(strategies, color=TEXT_COLOR, fontsize=10)
    ax2.set_ylabel("Retry Count", color=BRAND_BLUE, fontsize=11)
    ax2_cost.set_ylabel("Wasted Retry Cost (₹)", color=ACCENT_RED, fontsize=11)
    ax2_cost.tick_params(colors=ACCENT_RED)
    ax2.set_title("Operational Efficiency & Cost Avoidance", color=TEXT_COLOR, fontsize=13, fontweight="bold", pad=12)

    plt.tight_layout()
    p2 = os.path.join(output_dir, "economic_comparison.png")
    fig.savefig(p2, dpi=300, bbox_inches="tight", facecolor=BG_COLOR)
    plt.close(fig)
    generated_files.append(p2)

    # --- 3. PROBABILITY CALIBRATION CURVE ---
    fig, ax = setup_figure(figsize=(9, 6))
    fraction_of_positives, mean_predicted_value = calibration_curve(y_test, y_probs, n_bins=10)
    
    ax.plot([0, 1], [0, 1], "--", label="Perfectly Calibrated", color=TEXT_MUTED, lw=1.5)
    ax.plot(mean_predicted_value, fraction_of_positives, "s-", color=ACCENT_PURPLE, lw=3, markersize=8, label="RecoverIQ Model")
    
    ax.set_title("Model Probability Calibration (Reliability Diagram)", color=TEXT_COLOR, fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel("Mean Predicted Probability", color=TEXT_MUTED, fontsize=11)
    ax.set_ylabel("Empirical Recovery Rate", color=TEXT_MUTED, fontsize=11)
    ax.legend(facecolor=CARD_COLOR, edgecolor=GRID_COLOR, labelcolor=TEXT_COLOR, loc="upper left")

    p3 = os.path.join(output_dir, "calibration_curve.png")
    fig.savefig(p3, dpi=300, bbox_inches="tight", facecolor=BG_COLOR)
    plt.close(fig)
    generated_files.append(p3)

    # --- 4. FAILURE CATEGORY BREAKDOWN ---
    cat_summary = df_test.groupby("failure_category").agg(
        total_txns=("transaction_id", "count"),
        recovered_count=("recovery_outcome", lambda s: (s == 1).sum()),
        total_amount=("amount", "sum"),
        recovered_amount=("amount", lambda s: s[df_test.loc[s.index, "recovery_outcome"] == 1].sum())
    ).reset_index()

    fig, ax1 = setup_figure(figsize=(10, 6))
    categories = cat_summary["failure_category"]
    total_rev = cat_summary["total_amount"]
    rec_rev = cat_summary["recovered_amount"]

    x = np.arange(len(categories))
    width = 0.35

    ax1.bar(x - width/2, total_rev, width, label="Total Revenue at Risk", color="#334155", zorder=3)
    ax1.bar(x + width/2, rec_rev, width, label="Recovered Revenue", color=ACCENT_AMBER, zorder=3)

    ax1.set_xticks(x)
    ax1.set_xticklabels(categories, color=TEXT_COLOR, fontsize=10)
    ax1.set_ylabel("Revenue (₹)", color=TEXT_MUTED, fontsize=11)
    ax1.set_title("Revenue Recovery Breakdown by Failure Category", color=TEXT_COLOR, fontsize=13, fontweight="bold", pad=12)
    ax1.legend(facecolor=CARD_COLOR, edgecolor=GRID_COLOR, labelcolor=TEXT_COLOR)

    p4 = os.path.join(output_dir, "failure_category_analysis.png")
    fig.savefig(p4, dpi=300, bbox_inches="tight", facecolor=BG_COLOR)
    plt.close(fig)
    generated_files.append(p4)

    # --- 5. FEATURE IMPORTANCE PLOT ---
    if feature_names is not None and feature_importances is not None:
        fig, ax = setup_figure(figsize=(10, 6))
        sorted_idx = np.argsort(feature_importances)
        top_idx = sorted_idx[-10:] # Top 10 features
        
        top_names = [feature_names[i] for i in top_idx]
        top_scores = [feature_importances[i] for i in top_idx]

        y_pos = np.arange(len(top_names))
        ax.barh(y_pos, top_scores, color=BRAND_BLUE, edgecolor=GRID_COLOR, zorder=3)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(top_names, color=TEXT_COLOR, fontsize=10)
        ax.set_xlabel("Relative Importance Score", color=TEXT_MUTED, fontsize=11)
        ax.set_title("Top Feature Drivers for AI Recovery Prediction", color=TEXT_COLOR, fontsize=13, fontweight="bold", pad=12)

        p5 = os.path.join(output_dir, "feature_importance.png")
        fig.savefig(p5, dpi=300, bbox_inches="tight", facecolor=BG_COLOR)
        plt.close(fig)
        generated_files.append(p5)

    print(f"Generated {len(generated_files)} high-resolution charts in {output_dir}:")
    for fname in generated_files:
        print(f"  - {os.path.basename(fname)}")

    return generated_files
