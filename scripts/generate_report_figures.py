import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw, ImageFont

plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif', 'Times']
plt.rcParams['font.size'] = 10
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300

os.makedirs('figures', exist_ok=True)

# ==============================================================================
# FIG 1.1: Doctor-to-Population Density Deficit in India vs WHO Benchmark
# ==============================================================================
def generate_fig1_1():
    categories = ['WHO Normative\nBenchmark', 'India Urban\nAverage', 'India National\nAverage', 'India Rural\nHinterland', 'Severely Underserved\nStates (UP/Bihar)']
    ratios = [1000, 850, 1456, 2500, 3200] # 1 doctor per X persons
    colors = ['#27ae60', '#2980b9', '#f39c12', '#d35400', '#c0392b']

    fig, ax = plt.subplots(figsize=(6.5, 3.6), dpi=300)
    bars = ax.bar(categories, ratios, color=colors, width=0.55, edgecolor='#333333', lw=0.9)
    ax.axhline(1000, color='#27ae60', linestyle='--', lw=1.5, label='WHO Recommended Standard (1:1,000)')

    for bar, val in zip(bars, ratios):
        ax.text(bar.get_x() + bar.get_width() / 2.0, val + 65,
                f'1 : {val:,}', ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#1a1a1a')

    ax.set_ylabel('Population Served per Single Allopathic Physician', fontsize=9.5)
    ax.set_ylim(0, 3700)
    ax.set_title('Doctor-to-Population Ratio Disparity in India vs. WHO Benchmark', fontsize=10.5, fontweight='bold', pad=10)
    ax.grid(axis='y', linestyle=':', alpha=0.5)
    ax.legend(loc='upper left', fontsize=8.5, framealpha=0.95)
    plt.tight_layout()
    plt.savefig('figures/fig1_1_doctor_density.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Fig 1.1 generated.")

# ==============================================================================
# FIG 3.2: Deterministic Crisis Interruption State Machine (DCISM) Flowchart
# ==============================================================================
def generate_fig3_2():
    fig, ax = plt.subplots(figsize=(7.2, 4.2), dpi=300)
    ax.axis('off')

    def draw_node(x, y, w, h, text, subtext, bg_col, border_col='#2c3e50', shape='rect'):
        rect = plt.Rectangle((x, y), w, h, fc=bg_col, ec=border_col, lw=1.2, zorder=2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h*0.62, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#111111')
        ax.text(x + w/2, y + h*0.28, subtext, ha='center', va='center', fontsize=7.2, style='italic', color='#333333')

    # Draw Nodes
    draw_node(0.04, 0.65, 0.22, 0.25, "Patient Input", "Free-form Symptom Text $\\mathbf{x}$", '#e8f8f5')
    draw_node(0.34, 0.65, 0.32, 0.25, "DCISM Safety Filter", "Predicate $\\Lambda(\\mathbf{x}) \\geq \\theta_{safe}$ Evaluation\nLevenshtein & Token Hashing", '#fef9e7', border_col='#b7950b')
    draw_node(0.74, 0.65, 0.22, 0.25, "Emergency Override", "Bypass Normal Booking\nDirect Cellular Lifeline (112/108)", '#f9ebea', border_col='#c0392b')

    draw_node(0.34, 0.15, 0.32, 0.25, "Lexical Intake Parser", "Gemini 2.0 Flash Operator $\\Phi_{clin}(\\mathbf{x})$\nSpecialty $S^*$ & Urgency $\\mathcal{U}$", '#ebf5fb')
    draw_node(0.74, 0.15, 0.22, 0.25, "Provider Allocation", "Haversine $\\Gamma_{match}$ Optimization\nVerified Doctor Dispatch", '#eafaf1', border_col='#27ae60')

    # Arrows
    arrow_kw = dict(arrowstyle="->", lw=1.4, color='#2c3e50')
    ax.annotate('', xy=(0.34, 0.775), xytext=(0.26, 0.775), arrowprops=arrow_kw)
    ax.annotate('YES\n[Emergency]', xy=(0.74, 0.775), xytext=(0.66, 0.775),
                ha='center', fontsize=7.5, fontweight='bold', color='#c0392b',
                arrowprops=dict(arrowstyle="->", lw=1.5, color='#c0392b'))
    ax.annotate('NO\n[Safe]', xy=(0.50, 0.40), xytext=(0.50, 0.65),
                ha='center', fontsize=7.5, fontweight='bold', color='#27ae60',
                arrowprops=dict(arrowstyle="->", lw=1.5, color='#27ae60'))
    ax.annotate('', xy=(0.74, 0.275), xytext=(0.66, 0.275), arrowprops=arrow_kw)

    ax.text(0.5, 0.95, "Deterministic Crisis Interruption State Machine (DCISM) Logic Flow",
            ha='center', fontsize=10.5, fontweight='bold', color='#1b4f72')

    ax.set_xlim(0, 1.0)
    ax.set_ylim(0, 1.0)
    plt.tight_layout()
    plt.savefig('figures/fig3_2_dcism_flowchart.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Fig 3.2 generated.")

# ==============================================================================
# FIG 3.3: Booking & Escrow Sequence Diagram
# ==============================================================================
def generate_fig3_3():
    fig, ax = plt.subplots(figsize=(7.5, 4.0), dpi=300)
    ax.axis('off')

    actors = ['Patient Client', 'API Gateway', 'MongoDB Atlas', 'Razorpay Gateway', 'Doctor Client']
    xs = [0.10, 0.30, 0.50, 0.70, 0.90]

    # Draw Actor Life Lines
    for act, x in zip(actors, xs):
        ax.text(x, 0.92, act, ha='center', va='center', fontsize=8.5, fontweight='bold',
                bbox=dict(boxstyle='square,pad=0.3', fc='#e8ecef', ec='#495057', lw=1.0))
        ax.plot([x, x], [0.10, 0.88], color='#adb5bd', linestyle='--', lw=1.0)

    # Sequence Messages
    steps = [
        (0.10, 0.30, 0.80, "1. Select Slot & Book Consultation", '#2c3e50'),
        (0.30, 0.50, 0.72, "2. Acquire 2-Phase Optimistic Lock", '#2c3e50'),
        (0.30, 0.70, 0.64, "3. Generate Order ID (Escrow Hold)", '#2980b9'),
        (0.70, 0.10, 0.56, "4. Render Razorpay Modal & Card Auth", '#2980b9'),
        (0.10, 0.30, 0.48, "5. Submit HMAC-SHA256 Signature", '#27ae60'),
        (0.30, 0.50, 0.40, "6. Confirm Booking & Commit Slot", '#27ae60'),
        (0.30, 0.90, 0.32, "7. Dispatch WebSocket Room Notification", '#8e44ad'),
        (0.10, 0.90, 0.22, "8. Establish WebRTC Peer-to-Peer Media Bridge", '#d35400'),
        (0.90, 0.30, 0.14, "9. Issue ABDM Rx & Release Escrow Payment", '#16a085')
    ]

    for x1, x2, y, label, col in steps:
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", lw=1.2, color=col))
        mid_x = (x1 + x2) / 2.0
        ax.text(mid_x, y + 0.022, label, ha='center', va='bottom', fontsize=7.2, fontweight='bold', color=col)

    ax.text(0.5, 0.98, "CareSync End-to-End Consultation & Escrow Settlement Sequence Flow",
            ha='center', fontsize=10, fontweight='bold', color='#1a252f')

    ax.set_xlim(0, 1.0)
    ax.set_ylim(0.08, 1.0)
    plt.tight_layout()
    plt.savefig('figures/fig3_3_booking_sequence.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Fig 3.3 generated.")

# ==============================================================================
# FIG 5.6: Business Model & Sustainable Health Economics Architecture
# ==============================================================================
def generate_fig5_6():
    fig, ax = plt.subplots(figsize=(7.2, 3.8), dpi=300)
    ax.axis('off')

    def draw_pillar(x, y, w, h, title, items, bg_col, b_col):
        rect = plt.Rectangle((x, y), w, h, fc=bg_col, ec=b_col, lw=1.2, zorder=2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h - 0.05, title, ha='center', va='top', fontsize=8.5, fontweight='bold', color='#111111')
        item_text = "\n".join([f"• {it}" for it in items])
        ax.text(x + 0.02, y + h - 0.10, item_text, ha='left', va='top', fontsize=7.0, color='#333333', linespacing=1.4)

    draw_pillar(0.04, 0.10, 0.21, 0.78, "Value Proposition",
                ["24/7 AI Clinical Triage", "Zero Diagnostic Hallucination", "Immediate Emergency Intercept", "Affordable Tier-2/3 Access", "Tamper-Evident ABDM Rx"],
                '#e8f8f5', '#16a085')

    draw_pillar(0.27, 0.10, 0.21, 0.78, "Revenue Streams",
                ["10-15% Platform Booking Fee", "Doctor SaaS Cloud Clinic Tier", "Sponsored Lab Diagnostic Links", "E-Pharmacy Fulfillment Cut", "Corporate Wellness Plans"],
                '#fef9e7', '#f39c12')

    draw_pillar(0.50, 0.10, 0.21, 0.78, "Cost Architecture",
                ["Cloud Server & CDN (Render)", "MongoDB Atlas DB Compute", "Gemini 2.0 API Token Usage", "WebRTC TURN Relay Servers", "Payment Gateway Commission"],
                '#fdedec', '#e74c3c')

    draw_pillar(0.73, 0.10, 0.23, 0.78, "Market Scalability",
                ["$21.4B Indian Digital Health", "1.4B+ Citizen Demographic", "MoHFW Regulatory Moat", "ABDM FHIR Compatibility", "Rural Telemedicine Kiosks"],
                '#ebf5fb', '#2980b9')

    ax.text(0.5, 0.95, "CareSync Sustainable Healthcare Unit Economics & Business Model Architecture",
            ha='center', fontsize=10, fontweight='bold', color='#004d40')

    ax.set_xlim(0, 1.0)
    ax.set_ylim(0, 1.0)
    plt.tight_layout()
    plt.savefig('figures/fig5_6_business_canvas.png', bbox_inches='tight', dpi=300)
    plt.close()
    print("Fig 5.6 generated.")

if __name__ == '__main__':
    generate_fig1_1()
    generate_fig3_2()
    generate_fig3_3()
    generate_fig5_6()
    print("All additional report figures created!")
