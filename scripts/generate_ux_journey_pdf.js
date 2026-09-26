import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const assetsDir = path.resolve('docs/assets');

// Helper to convert image file to Base64
function getBase64Image(filename) {
  const filePath = path.join(assetsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  const ext = path.extname(filename).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

// Load real captured screenshots
const imgDashboard = getBase64Image('dashboard_1790404854500.png');
const imgLightDashboard = getBase64Image('light_mode_dashboard_1790387595506.png');
const imgGeneralLedger = getBase64Image('general_ledger_1790404939064.png');
const imgTrialBalance = getBase64Image('trial_balance_1790404967305.png');
const imgCashFlow = getBase64Image('cash_flow_1790404999840.png');
const imgAcademicSuite = getBase64Image('academic_suite_1790405065335.png');
const imgCopilot = getBase64Image('copilot_drawer_open_1790379108379.png');
const imgVault = getBase64Image('encrypted_vault_deck_1790380809784.png');
const imgStatement = getBase64Image('statement_pdf_click_1790380853613.png');
const imgSitemap = getBase64Image('sitemap_modal_open_1790379671004.png');
const imgDarkOverview = getBase64Image('final_overview_dashboard_1790379938789.png');

console.log('Screenshots loaded into Base64 for UX Journey document.');

export function generateUXJourneyHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>AuraFinance OS — 7. User Journey Document / UI/UX Design</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&display=swap" rel="stylesheet">
<style>
  @page {
    size: 297mm 210mm;
    margin: 0;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #060913;
    color: #f1f5f9;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 297mm;
    height: 210mm;
    max-height: 210mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    padding: 13mm 16mm 11mm 16mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  /* THEMES */
  .theme-obsidian {
    background: #060913;
    color: #f1f5f9;
  }
  .theme-opal {
    background: #F8F9FA;
    color: #0F172A;
  }

  /* TYPOGRAPHY */
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  .font-serif { font-family: 'Playfair Display', serif; }
  .font-display { font-family: 'Cinzel', serif; }

  /* HEADER & FOOTER */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 6px;
    margin-bottom: 10px;
  }
  .theme-opal .page-header {
    border-bottom-color: rgba(15,23,42,0.1);
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .header-badge {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 2.5px 8px;
    border-radius: 4px;
    background: rgba(14,165,233,0.15);
    color: #38bdf8;
    border: 1px solid rgba(14,165,233,0.3);
  }
  .theme-opal .header-badge {
    background: rgba(14,165,233,0.1);
    color: #0284c7;
    border-color: rgba(14,165,233,0.25);
  }
  .header-title {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #94a3b8;
  }
  .theme-opal .header-title { color: #64748b; }
  .header-right {
    font-size: 9px;
    font-weight: 600;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 7px;
    font-size: 8px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }
  .theme-opal .page-footer {
    border-top-color: rgba(15,23,42,0.1);
    color: #94a3b8;
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* macOS RETINA WINDOW */
  .macos-window {
    border-radius: 8px;
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 12px 30px -6px rgba(0,0,0,0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .theme-opal .macos-window {
    background: #ffffff;
    border-color: rgba(15,23,42,0.14);
    box-shadow: 0 10px 25px -5px rgba(15,23,42,0.12);
  }
  .macos-header {
    height: 20px;
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    padding: 0 8px;
    gap: 5px;
  }
  .theme-opal .macos-header {
    background: #f1f5f9;
    border-bottom-color: rgba(15,23,42,0.08);
  }
  .macos-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .macos-url {
    margin-left: auto;
    margin-right: auto;
    font-size: 7.5px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
    background: rgba(0,0,0,0.25);
    padding: 1px 10px;
    border-radius: 10px;
  }
  .theme-opal .macos-url {
    background: rgba(0,0,0,0.05);
    color: #64748b;
  }
  .macos-body {
    position: relative;
    overflow: hidden;
  }
  .macos-body img {
    width: 100%;
    display: block;
    object-fit: cover;
  }

  /* CALLOUTS */
  .callout-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(14,165,233,0.12);
    border: 1px solid rgba(14,165,233,0.3);
    padding: 3.5px 7.5px;
    border-radius: 5px;
    font-size: 8.5px;
    font-weight: 700;
    color: #38bdf8;
  }
  .theme-opal .callout-pill {
    background: rgba(14,165,233,0.08);
    border-color: rgba(14,165,233,0.22);
    color: #0284c7;
  }
  .pill-emerald {
    background: rgba(16,185,129,0.12) !important;
    border-color: rgba(16,185,129,0.3) !important;
    color: #34d399 !important;
  }
  .pill-amber {
    background: rgba(245,158,11,0.12) !important;
    border-color: rgba(245,158,11,0.3) !important;
    color: #fbbf24 !important;
  }
  .pill-purple {
    background: rgba(168,85,247,0.12) !important;
    border-color: rgba(168,85,247,0.3) !important;
    color: #c084fc !important;
  }

  /* GLASS CARDS */
  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 10px 12px;
  }
  .theme-opal .glass-card {
    background: #ffffff;
    border-color: rgba(15,23,42,0.1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  /* FIGURES */
  .fig-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #38bdf8;
  }
  .theme-opal .fig-tag { color: #0284c7; }
  .fig-caption {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: -0.01em;
    margin-top: 1px;
  }
  .fig-sub {
    font-size: 8.5px;
    color: #94a3b8;
    line-height: 1.35;
    margin-top: 2px;
  }
  .theme-opal .fig-sub { color: #64748b; }

  /* TIMELINE BADGES */
  .time-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
  }
</style>
</head>
<body>

<!-- =========================================================================
     PAGE 01: COVER SPREAD (MAGAZINE MASTER COVER)
     ========================================================================= -->
<div class="page theme-obsidian" style="padding: 16mm 20mm; justify-content: space-between; background: radial-gradient(circle at 75% 25%, #182245 0%, #060913 75%);">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <span class="header-badge" style="font-size: 9px; padding: 4px 10px;">GLOBAL CATEGORY · 2026 UX / UI DOSSIER</span>
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 10px;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #64748b; font-family: 'JetBrains Mono';">SECTION 07</span>
        <span style="width: 30px; height: 1px; background: rgba(255,255,255,0.2);"></span>
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #94a3b8;">USER JOURNEY &amp; INTERFACE DESIGN</span>
      </div>
    </div>
    <div style="text-align: right; font-family: 'JetBrains Mono'; font-size: 9px; color: #64748b; line-height: 1.6;">
      <div>PRODUCTION SYSTEM: VERIFIED LIVE</div>
      <div style="color: #38bdf8;">https://aura-finance-silk.vercel.app/</div>
      <div>EVALUATION PROTOCOL: 0–180 SECONDS</div>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 32px; align-items: center; margin: 10px 0;">
    <div>
      <div style="font-family: 'Cinzel', serif; font-size: 54px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.0; color: #ffffff;">
        AURA<span style="color: #38bdf8;">FINANCE</span><br/>OS
      </div>
      <div style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 0.08em; color: #38bdf8; margin-top: 14px; text-transform: uppercase;">
        7. User Journey Document / UI/UX Design
      </div>
      <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-top: 6px;">
        Autonomous AI Wealth Operating System
      </div>
      <p style="font-size: 11px; color: #94a3b8; max-width: 460px; line-height: 1.6; margin-top: 12px;">
        An editorial interaction teardown charting the 0–180 second evaluator journey from zero-auth hydration through omnimodal command exploration, GAAP double-entry verification, and client-side cryptographic audit.
      </p>

      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px;">
        <div class="callout-pill font-mono">⏱️ 0–180S 4-ACT JOURNEY</div>
        <div class="callout-pill pill-emerald font-mono">⚡ ZERO AUTH FRICTION</div>
        <div class="callout-pill pill-amber font-mono">⌘K OMNIMODAL PALETTE</div>
        <div class="callout-pill pill-purple font-mono">🌐 ENGLISH / URDU RTL</div>
      </div>
    </div>

    <!-- Hero Screenshot Card -->
    <div class="macos-window" style="box-shadow: 0 20px 50px -10px rgba(14,165,233,0.3);">
      <div class="macos-header">
        <div class="macos-dot dot-red"></div>
        <div class="macos-dot dot-yellow"></div>
        <div class="macos-dot dot-green"></div>
        <div class="macos-url">aura-finance-silk.vercel.app/dashboard</div>
      </div>
      <div class="macos-body" style="height: 240px;">
        <img src="${imgLightDashboard || imgDashboard}" style="height: 100%; object-fit: cover;" alt="AuraFinance OS Hero" />
      </div>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
    <div style="display: flex; gap: 30px; font-size: 9px; font-family: 'JetBrains Mono'; color: #64748b;">
      <div><strong style="color: #cbd5e1;">AESTHETICS:</strong> OPAL CERAMIC &amp; OBSIDIAN NEBULA</div>
      <div><strong style="color: #cbd5e1;">DESIGN SYSTEM:</strong> TAILWIND + FRAMER MOTION</div>
      <div><strong style="color: #cbd5e1;">TARGET:</strong> WEB INNOVATION UNLEASHED 2026</div>
    </div>
    <div style="font-family: 'JetBrains Mono'; font-size: 9px; color: #38bdf8;">
      PUBLICATION SPECIFICATION // REV 2.0
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 02: UX MANIFESTO
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">01 · UX MANIFESTO</span>
      <span class="header-title">THE EXPERIENCE IS THE OPERATING SYSTEM</span>
    </div>
    <div class="header-right">PAGE 02 // 24</div>
  </div>

  <div class="content-area" style="justify-content: center; align-items: center; text-align: center; padding: 0 30px;">
    <div class="fig-tag" style="margin-bottom: 6px;">DESIGN SYSTEM MANIFESTO</div>
    <div style="font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 800; line-height: 1.2; color: #0f172a; max-width: 800px;">
      The Experience Is Not A Skin. The Experience Is The System.
    </div>
    <p style="font-size: 11.5px; color: #64748b; max-width: 650px; line-height: 1.6; margin-top: 12px;">
      In legacy financial software, users navigate disconnected forms waiting for server round-trips. In AuraFinance OS, interface interactions directly drive an in-memory double-entry ledger. One single source of truth reactively powers every pixel.
    </p>

    <!-- 7-Stage Visual UX Pipeline -->
    <div style="width: 100%; max-width: 840px; margin-top: 28px;">
      <svg viewBox="0 0 840 90" style="width: 100%; height: auto;">
        <defs>
          <filter id="shadowLight" x="-5%" y="-5%" width="110%" height="115%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08" />
          </filter>
        </defs>

        <!-- Node 1: Input -->
        <g filter="url(#shadowLight)">
          <rect x="5" y="10" width="105" height="70" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="57" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#0f172a">01 INPUT</text>
          <text x="57" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Touch / ⌘K / Voice</text>
        </g>
        <path d="M 110 45 L 128 45" stroke="#94a3b8" stroke-width="2" />

        <!-- Node 2: Interaction -->
        <g filter="url(#shadowLight)">
          <rect x="128" y="10" width="105" height="70" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="1.5" />
          <text x="180" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#0284c7">02 INTERACT</text>
          <text x="180" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Spring Physics</text>
        </g>
        <path d="M 233 45 L 251 45" stroke="#94a3b8" stroke-width="2" />

        <!-- Node 3: Intelligence -->
        <g filter="url(#shadowLight)">
          <rect x="251" y="10" width="105" height="70" rx="8" fill="#ffffff" stroke="#7c3aed" stroke-width="1.5" />
          <text x="303" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#7c3aed">03 AI PARSE</text>
          <text x="303" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Gemini 2.0 Flash</text>
        </g>
        <path d="M 356 45 L 374 45" stroke="#94a3b8" stroke-width="2" />

        <!-- Node 4: Financial Validation -->
        <g filter="url(#shadowLight)">
          <rect x="374" y="10" width="105" height="70" rx="8" fill="#ffffff" stroke="#059669" stroke-width="1.5" />
          <text x="426" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#059669">04 VALIDATE</text>
          <text x="426" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Σ Dr ≡ Σ Cr</text>
        </g>
        <path d="M 479 45 L 497 45" stroke="#94a3b8" stroke-width="2" />

        <!-- Node 5: State Update -->
        <g filter="url(#shadowLight)">
          <rect x="497" y="10" width="105" height="70" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
          <text x="549" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#0284c7">05 SSOT</text>
          <text x="549" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">&lt;16ms Update</text>
        </g>
        <path d="M 602 45 L 620 45" stroke="#94a3b8" stroke-width="2" />

        <!-- Node 6: Visual Feedback -->
        <g filter="url(#shadowLight)">
          <rect x="620" y="10" width="105" height="70" rx="8" fill="#ffffff" stroke="#e11d48" stroke-width="1.5" />
          <text x="672" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#e11d48">06 FEEDBACK</text>
          <text x="672" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Particles &amp; Haptics</text>
        </g>
        <path d="M 725 45 L 743 45" stroke="#94a3b8" stroke-width="2" />

        <!-- Node 7: Confidence -->
        <g filter="url(#shadowLight)">
          <rect x="743" y="10" width="92" height="70" rx="8" fill="#f0fdf4" stroke="#10b981" stroke-width="2" />
          <text x="789" y="38" text-anchor="middle" font-size="10" font-weight="900" fill="#047857">07 TRUST</text>
          <text x="789" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#059669">Verified Math</text>
        </g>
      </svg>
    </div>

    <div style="font-family: 'JetBrains Mono'; font-size: 9px; font-weight: 700; color: #0284c7; margin-top: 24px; letter-spacing: 0.1em;">
      ONE FINANCIAL STATE → MANY REACTIVE SURFACES
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>THE INTERACTION MANIFESTO</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 03: MASTER 0–180 SECOND USER JOURNEY (THE 4-ACT SPREAD)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">02 · EVALUATION ARCHITECTURE</span>
      <span class="header-title">THE MASTER 0–180 SECOND EVALUATOR JOURNEY MAP</span>
    </div>
    <div class="header-right">PAGE 03 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 01 — FOUR-ACT EVALUATION JOURNEY SPECIFICATION</div>
        <div class="fig-caption">From Zero Authentication Wall to 24H SHA-256 Vector PDF Audit</div>
      </div>
      <div class="fig-sub font-mono">SPECIFICATION SOURCE: USER_JOURNEY.MD (0–180 SECONDS)</div>
    </div>

    <!-- Master 4-Act Horizontal Timeline -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
      <!-- Act I -->
      <div class="glass-card" style="border-top: 3px solid #38bdf8; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="time-badge" style="color: #38bdf8;">00:15</span>
            <span class="callout-pill" style="font-size: 7.5px; padding: 2px 6px;">ACT I</span>
          </div>
          <div style="font-size: 11px; font-weight: 800; color: #ffffff; margin-top: 4px;">FIRST TOUCH</div>
          <p style="font-size: 8.5px; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
            Instant load with zero auth wall. IndexedDB populates 60+ sample transactions. Hero Net Cash and 60 FPS Particle Stream orient the evaluator immediately.
          </p>
        </div>

        <div class="macos-window" style="margin: 6px 0;">
          <div class="macos-header" style="height: 15px;"><div class="macos-dot dot-red" style="width:5px;height:5px;"></div></div>
          <div class="macos-body" style="height: 110px;"><img src="${imgLightDashboard || imgDashboard}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #38bdf8;">
          SUCCESS: &lt;450ms FCP · 0 Login Friction
        </div>
      </div>

      <!-- Act II -->
      <div class="glass-card" style="border-top: 3px solid #a855f7; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="time-badge" style="color: #c084fc;">01:00</span>
            <span class="callout-pill pill-purple" style="font-size: 7.5px; padding: 2px 6px;">ACT II</span>
          </div>
          <div style="font-size: 11px; font-weight: 800; color: #ffffff; margin-top: 4px;">INTERACTIVE EXPLORATION</div>
          <p style="font-size: 8.5px; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
            Evaluator triggers Persona Architect Studio (Global Tech Freelancer), recalibrating cash flow. Opens Omnimodal Command Palette (⌘K) and tests voice HUD.
          </p>
        </div>

        <div class="macos-window" style="margin: 6px 0;">
          <div class="macos-header" style="height: 15px;"><div class="macos-dot dot-red" style="width:5px;height:5px;"></div></div>
          <div class="macos-body" style="height: 110px;"><img src="${imgCopilot || imgDashboard}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #c084fc;">
          SUCCESS: Instant Persona Recalibration
        </div>
      </div>

      <!-- Act III -->
      <div class="glass-card" style="border-top: 3px solid #10b981; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="time-badge" style="color: #34d399;">02:00</span>
            <span class="callout-pill pill-emerald" style="font-size: 7.5px; padding: 2px 6px;">ACT III</span>
          </div>
          <div style="font-size: 11px; font-weight: 800; color: #ffffff; margin-top: 4px;">DEEP VERIFICATION</div>
          <p style="font-size: 8.5px; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
            CPA-grade audit of General Ledger and Trial Balance ($\sum \text{Dr} \equiv \sum \text{Cr}$). Evaluates Bullion Vault in Grams/Tolas and scans foreign receipt via OCR.
          </p>
        </div>

        <div class="macos-window" style="margin: 6px 0;">
          <div class="macos-header" style="height: 15px;"><div class="macos-dot dot-red" style="width:5px;height:5px;"></div></div>
          <div class="macos-body" style="height: 110px;"><img src="${imgTrialBalance || imgGeneralLedger}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #34d399;">
          SUCCESS: Zero Cent Trial Variance ($0.00)
        </div>
      </div>

      <!-- Act IV -->
      <div class="glass-card" style="border-top: 3px solid #f43f5e; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="time-badge" style="color: #fb7185;">03:00</span>
            <span class="callout-pill" style="font-size: 7.5px; padding: 2px 6px; background: rgba(244,63,94,0.15); color: #fb7185; border-color: rgba(244,63,94,0.3);">ACT IV</span>
          </div>
          <div style="font-size: 11px; font-weight: 800; color: #ffffff; margin-top: 4px;">AUDIT &amp; EXPORT</div>
          <p style="font-size: 8.5px; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
            Generates 24H vector statement PDF with real-time SHA-256 seal. Downloads AES-256 encrypted JSON vault. Toggles language to Urdu to verify full RTL layout mirroring.
          </p>
        </div>

        <div class="macos-window" style="margin: 6px 0;">
          <div class="macos-header" style="height: 15px;"><div class="macos-dot dot-red" style="width:5px;height:5px;"></div></div>
          <div class="macos-body" style="height: 110px;"><img src="${imgStatement || imgVault}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #fb7185;">
          SUCCESS: SHA-256 Verified PDF Output
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>MASTER 0–180 SECOND USER JOURNEY MAP</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 04: FIRST TOUCH / 0–15 SECONDS
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">03 · STAGE 1 (00:00–00:15)</span>
      <span class="header-title">FIRST TOUCH: FROM ZERO TO FINANCIAL CONTEXT</span>
    </div>
    <div class="header-right">PAGE 04 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 20px; height: 100%;">
      <!-- Left Column -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: baseline; gap: 10px;">
            <span class="time-badge" style="color: #0284c7; font-size: 32px;">00:15</span>
            <span style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Zero Authentication Wall</span>
          </div>
          <p style="font-size: 10px; color: #64748b; line-height: 1.5; margin-top: 8px;">
            Evaluators do not encounter registration forms or OAuth prompts. AuraFinance OS instantly populates a rich, realistic financial universe directly in the browser's local IndexedDB, providing immediate context.
          </p>

          <!-- Numbered UI Callouts -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 14px;">
            <div class="glass-card" style="padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
              <span class="callout-pill font-mono" style="padding: 1px 5px;">01</span>
              <span style="font-size: 8.5px; font-weight: 700; color: #0f172a;">Opal Ceramic Workstation Aesthetic</span>
            </div>
            <div class="glass-card" style="padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
              <span class="callout-pill font-mono" style="padding: 1px 5px;">02</span>
              <span style="font-size: 8.5px; font-weight: 700; color: #0f172a;">Hero Net Cash Pulse (Accounts 1010+1020)</span>
            </div>
            <div class="glass-card" style="padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
              <span class="callout-pill font-mono" style="padding: 1px 5px;">03</span>
              <span style="font-size: 8.5px; font-weight: 700; color: #0f172a;">Bento KPI System (Burn &amp; 50/30/20 Balance)</span>
            </div>
            <div class="glass-card" style="padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
              <span class="callout-pill font-mono" style="padding: 1px 5px;">04</span>
              <span style="font-size: 8.5px; font-weight: 700; color: #0f172a;">60 FPS Canvas Cash-Flow Particle Stream</span>
            </div>
            <div class="glass-card" style="padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
              <span class="callout-pill font-mono" style="padding: 1px 5px;">05</span>
              <span style="font-size: 8.5px; font-weight: 700; color: #0f172a;">Persona Switcher &amp; Omnimodal Bar</span>
            </div>
          </div>
        </div>

        <!-- Activity Pipeline -->
        <div style="background: #f1f5f9; border-radius: 6px; padding: 8px; font-family: 'JetBrains Mono'; font-size: 7.5px; color: #475569;">
          FLOW: LOAD (0ms) → HYDRATE (80ms) → CALCULATE SSOT (120ms) → ANIMATE (180ms)
        </div>
      </div>

      <!-- Right Column: Big Framed Screenshot -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">FIG. 02 — OPAL CERAMIC FIRST TOUCH</div>
        <div class="fig-caption">Initial Evaluator Landing Screen (Zero-Auth Workstation)</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1;">
          <div class="macos-header">
            <div class="macos-dot dot-red"></div>
            <div class="macos-dot dot-yellow"></div>
            <div class="macos-dot dot-green"></div>
            <div class="macos-url">aura-finance-silk.vercel.app/dashboard</div>
          </div>
          <div class="macos-body" style="height: 100%; min-height: 250px;">
            <img src="${imgLightDashboard || imgDashboard}" style="width: 100%; height: 100%; object-fit: cover;" alt="First Touch Screenshot" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>FIRST TOUCH INTERACTION SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 05: DASHBOARD UI ANATOMY (EXPLODED PRODUCT TEARDOWN)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">04 · INTERFACE ARCHITECTURE</span>
      <span class="header-title">DASHBOARD UI ANATOMY &amp; MODULAR LATTICE</span>
    </div>
    <div class="header-right">PAGE 05 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 03 — MODULAR DASHBOARD ANATOMY TEARDOWN</div>
        <div class="fig-caption">Six Atomic Structural Clusters Bound to the Master SSOT</div>
      </div>
      <div class="fig-sub font-mono">LAYOUT: 4PX/8PX ATOMIC SPATIAL LATTICE</div>
    </div>

    <!-- Exploded Product Design Teardown Grid -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
      <!-- Cluster 1 -->
      <div class="glass-card" style="border-top: 2px solid #38bdf8;">
        <div style="font-size: 10px; font-weight: 800; color: #38bdf8;">1. GLOBAL COMMAND STRIP</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Header Navigation</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 4px;">Hosts Persona Architect Studio, base currency selector, language toggle, and quick audio walkthrough chime.</p>
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 7px; font-family: 'JetBrains Mono'; color: #38bdf8;">
          CMD+K · CMD+J · Voice Orb
        </div>
      </div>

      <!-- Cluster 2 -->
      <div class="glass-card" style="border-top: 2px solid #34d399;">
        <div style="font-size: 10px; font-weight: 800; color: #34d399;">2. HERO LIQUIDITY BANNER</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Opening &amp; Net Position</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 4px;">Dynamic hero readout computing 24H opening balance, operating inflows, outflows, and verified net liquid cash.</p>
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 7px; font-family: 'JetBrains Mono'; color: #34d399;">
          Net Cash ≡ Liquid Accounts 1010+1020
        </div>
      </div>

      <!-- Cluster 3 -->
      <div class="glass-card" style="border-top: 2px solid #f59e0b;">
        <div style="font-size: 10px; font-weight: 800; color: #f59e0b;">3. BENTO 50/30/20 TILES</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Budget Velocity Equilibrium</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 4px;">Real-time partition of income into Needs (50%), Wants (30%), and Savings (20%) with breach sentinel warnings.</p>
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 7px; font-family: 'JetBrains Mono'; color: #f59e0b;">
          Automatic Wants Allowance Sentinel
        </div>
      </div>

      <!-- Cluster 4 -->
      <div class="glass-card" style="border-top: 2px solid #818cf8;">
        <div style="font-size: 10px; font-weight: 800; color: #818cf8;">4. PARTICLE STREAM TELEMETRY</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Visual Cash Flow Stream</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 4px;">WebGL physics particle simulation where particle velocity and stream widths reflect actual transaction volume.</p>
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 7px; font-family: 'JetBrains Mono'; color: #818cf8;">
          60 FPS Hardware-Accelerated Canvas
        </div>
      </div>

      <!-- Cluster 5 -->
      <div class="glass-card" style="border-top: 2px solid #a855f7;">
        <div style="font-size: 10px; font-weight: 800; color: #a855f7;">5. OPERATIONAL DECK</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Core Ledger Modules</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 4px;">General Ledger, Bullion Reserve, Daily Bazaar, Subscriptions Hunter, and P2P Debt Settlement.</p>
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 7px; font-family: 'JetBrains Mono'; color: #a855f7;">
          Direct Navigation &amp; Quick Logging
        </div>
      </div>

      <!-- Cluster 6 -->
      <div class="glass-card" style="border-top: 2px solid #f43f5e;">
        <div style="font-size: 10px; font-weight: 800; color: #f43f5e;">6. INTELLIGENCE &amp; AUDIT</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Copilot &amp; Vector Statements</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 4px;">AI Financial Copilot drawer (Wealth Mentor &amp; Gen-Z Roast) and 24H vector PDF statement download.</p>
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 7px; font-family: 'JetBrains Mono'; color: #f43f5e;">
          SHA-256 Digital Verification Seal
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>DASHBOARD UI ANATOMY TEARDOWN</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 06: INTERACTIVE EXPLORATION / 15–60 SECONDS
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">05 · STAGE 2 (00:15–01:00)</span>
      <span class="header-title">THE USER STARTS TO PUSH THE SYSTEM</span>
    </div>
    <div class="header-right">PAGE 06 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 04 — INTERACTIVE EXPLORATION &amp; RECALIBRATION LOOP</div>
        <div class="fig-caption">From Persona Switching to Sub-Second System-Wide State Recalibration</div>
      </div>
      <div class="fig-sub font-mono">RECALIBRATION LATENCY: &lt;16MS POST-SELECTION</div>
    </div>

    <!-- Interaction Graph & Transformation Spread -->
    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <!-- Left: Interaction Flow -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span class="time-badge" style="color: #0284c7; font-size: 26px;">01:00</span>
            <span style="font-size: 10px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Context Switch</span>
          </div>
          <p style="font-size: 9.5px; color: #64748b; line-height: 1.45; margin-top: 6px;">
            When an evaluator selects a persona (e.g. <em>Global Tech Freelancer</em> or <em>Medical Resident</em>), AuraFinance OS completely regenerates the financial universe. The ledger, cash flow, and 50/30/20 buckets adapt in real time.
          </p>
        </div>

        <!-- SVG Flow -->
        <svg viewBox="0 0 380 140" style="width: 100%; height: auto; margin: 10px 0;">
          <rect x="10" y="45" width="85" height="45" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
          <text x="52" y="66" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0284c7">PERSONA</text>
          <text x="52" y="78" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">Switch Trigger</text>

          <path d="M 95 67 L 135 67" stroke="#0284c7" stroke-width="1.5" />

          <rect x="135" y="35" width="110" height="65" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="2" />
          <text x="190" y="58" text-anchor="middle" font-size="9" font-weight="800" fill="#7c3aed">RECALIBRATE</text>
          <text x="190" y="72" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#0f172a">Dexie Bulk Seed</text>
          <text x="190" y="85" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#6d28d9">Reconciliation SSOT</text>

          <path d="M 245 67 L 285 67" stroke="#7c3aed" stroke-width="1.5" />

          <rect x="285" y="45" width="85" height="45" rx="6" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5" />
          <text x="327" y="66" text-anchor="middle" font-size="8.5" font-weight="700" fill="#047857">UI ADAPT</text>
          <text x="327" y="78" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">15 Modules Sync</text>
        </svg>

        <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #0284c7;">
          CONFIDENCE PRINCIPLE: Zero hardcoded mock numbers; all state derives from IndexedDB.
        </div>
      </div>

      <!-- Right: Before / After KPI Comparison -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 10px; font-weight: 800; color: #0f172a;">BEFORE VS. AFTER RECALIBRATION</div>
          <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono'; margin-top: 1px;">Live Baseline Comparison</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin: 10px 0;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 8.5px; font-weight: 700;">
              <span style="color: #64748b;">BASELINE 1: DEFAULT HOUSEHOLD</span>
              <span class="font-mono text-cyan-600">$48,250.00 Net Cash</span>
            </div>
            <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 3px;">
              Needs: 48% · Wants: 28% · Savings: 24% · Currency: USD ($)
            </div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 8.5px; font-weight: 800;">
              <span style="color: #047857;">BASELINE 2: MEDICAL RESIDENT (PKR)</span>
              <span class="font-mono text-emerald-600">₨ 68,400.00 Net Cash</span>
            </div>
            <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #047857; margin-top: 3px;">
              Needs: 58% · Wants: 34% (Breach Alert) · Savings: 8% · Currency: PKR (₨)
            </div>
          </div>
        </div>

        <div class="callout-pill pill-emerald" style="font-size: 8px; align-self: flex-start;">
          ⚡ AUTOMATIC 50/30/20 BREACH SENTINEL ACTIVATION
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>INTERACTIVE EXPLORATION &amp; RECALIBRATION</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 07: PERSONA SWITCHER JOURNEY
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">06 · USER MODELING</span>
      <span class="header-title">PERSONA ARCHITECT STUDIO &amp; SPECIALIZED JOURNEYS</span>
    </div>
    <div class="header-right">PAGE 07 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 05 — PERSONA JOURNEY MATRIX</div>
        <div class="fig-caption">Four Purpose-Built Personas Mapped to Tailored Interaction Workflows</div>
      </div>
      <div class="fig-sub font-mono">1-TAP SWITCH: TOP NAVIGATION DROPDOWN (30S SYNTHESIS)</div>
    </div>

    <!-- 4 Persona Cards Grid -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      <!-- Student -->
      <div class="glass-card" style="border-top: 2px solid #38bdf8; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 18px;">🩺</div>
          <div style="font-size: 10px; font-weight: 800; color: #38bdf8; margin-top: 2px;">STUDENT / RESIDENT</div>
          <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Tight Living Stipend</div>
          <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">
            Audits grocery receipts in Mandi Sentinel, tracks shared room expenses in P2P Bill Splitter, and uses Impulse Interceptor.
          </p>
        </div>
        <div style="padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 7px; font-family: 'JetBrains Mono'; color: #38bdf8;">
          PRIMARY: Daily Bazaar, IOUs
        </div>
      </div>

      <!-- Freelancer -->
      <div class="glass-card" style="border-top: 2px solid #34d399; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 18px;">💼</div>
          <div style="font-size: 10px; font-weight: 800; color: #34d399; margin-top: 2px;">GLOBAL FREELANCER</div>
          <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Cross-Border Parity</div>
          <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">
            Invoices in USD, converts to local PKR/EUR, manages SaaS renewals with Ghost Subscription Assassin, and reserves taxes.
          </p>
        </div>
        <div style="padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 7px; font-family: 'JetBrains Mono'; color: #34d399;">
          PRIMARY: Multi-Currency, Subs
        </div>
      </div>

      <!-- Auditor -->
      <div class="glass-card" style="border-top: 2px solid #a855f7; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 18px;">⚖️</div>
          <div style="font-size: 10px; font-weight: 800; color: #c084fc; margin-top: 2px;">SYSTEM AUDITOR / CPA</div>
          <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Zero-Variance Audit</div>
          <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">
            Validates general journal entries, checks equalized trial balances ($\sum \text{Dr} \equiv \sum \text{Cr}$), and exports SHA-256 PDF statements.
          </p>
        </div>
        <div style="padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 7px; font-family: 'JetBrains Mono'; color: #c084fc;">
          PRIMARY: General Ledger, 24H PDF
        </div>
      </div>

      <!-- Bullion Investor -->
      <div class="glass-card" style="border-top: 2px solid #f59e0b; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 18px;">🥇</div>
          <div style="font-size: 10px; font-weight: 800; color: #fcd34d; margin-top: 2px;">BULLION INVESTOR</div>
          <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Physical Gold Reserve</div>
          <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">
            Monitors precious metals holdings in Grams &amp; South Asian Tolas, integrates live spot ratios, and models 15-year compound growth.
          </p>
        </div>
        <div style="padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 7px; font-family: 'JetBrains Mono'; color: #fcd34d;">
          PRIMARY: Bullion Vault, Time Machine
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>PERSONA SWITCHER JOURNEYS</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 08: OMNIMODAL COMMAND PALETTE (CMD+K)
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">07 · NATURAL LANGUAGE INTERACTION</span>
      <span class="header-title">OMNIMODAL COMMAND PALETTE (⌘K / CTRL+K)</span>
    </div>
    <div class="header-right">PAGE 08 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 100%;">
      <!-- Left Column: Interaction Pipeline -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span class="time-badge" style="color: #0284c7; font-size: 28px;">⌘K</span>
            <span style="font-size: 10px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Omnimodal Action Bar</span>
          </div>
          <p style="font-size: 10px; color: #64748b; line-height: 1.5; margin-top: 6px;">
            The central nervous system of keyboard-driven interaction. Evaluators can type natural language expense records, navigation commands, or audit requests without clicking menus.
          </p>

          <!-- Interaction Stages -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 12px;">
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #0284c7;">1. KEYBOARD TRIGGER:</strong> Press <code class="font-mono">⌘K</code> or click search icon.
            </div>
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #7c3aed;">2. NATURAL INTENT:</strong> Type <em>"Dinner with team $85"</em> or <em>"Ledger"</em>.
            </div>
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #059669;">3. GAAP TRANSLATION:</strong> Translates to Dr 5050 Dining / Cr 1010 Cash.
            </div>
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #0f172a;">4. IMMEDIATE ESCAPE:</strong> Press <code class="font-mono">ESC</code> to return to dashboard.
            </div>
          </div>
        </div>

        <div class="callout-pill pill-emerald" style="font-size: 8px;">
          ⚡ ZERO LATENCY: PARSING &amp; NAVIGATION COMPLETE IN &lt;24MS
        </div>
      </div>

      <!-- Right Column: Visual Palette Mock / Screenshot Frame -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">FIG. 06 — ⌘K COMMAND PALETTE INTERFACE</div>
        <div class="fig-caption">Natural Language Execution &amp; Instant Navigation</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1; justify-content: center; align-items: center; background: #0b1120; padding: 20px;">
          <!-- Rendered ⌘K Overlay Mockup -->
          <div style="width: 100%; max-width: 320px; background: #0f172a; border: 1px solid rgba(56,189,248,0.4); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden;">
            <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: #38bdf8;">⌘</span>
              <input type="text" value="Dinner with team $85" readonly style="background: transparent; border: none; outline: none; color: #ffffff; font-size: 10px; font-family: 'JetBrains Mono'; width: 100%;" />
            </div>
            <div style="padding: 6px;">
              <div style="padding: 6px; background: rgba(56,189,248,0.1); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 8px; color: #38bdf8; font-weight: 700;">Post Journal: Dr Dining $85 / Cr Cash</span>
                <span style="font-size: 7px; color: #94a3b8; font-family: 'JetBrains Mono';">ENTER ↵</span>
              </div>
              <div style="padding: 6px; display: flex; justify-content: space-between; align-items: center; opacity: 0.7;">
                <span style="font-size: 8px; color: #cbd5e1;">Navigate to General Ledger</span>
                <span style="font-size: 7px; color: #64748b; font-family: 'JetBrains Mono';">TAB ⇥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>OMNIMODAL COMMAND PALETTE (⌘K)</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 09: VOICE / "HEY AURA" JOURNEY (FINITE STATE MACHINE)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">08 · HANDS-FREE INTERACTION</span>
      <span class="header-title">HEY AURA — VOICE ORB FINITE STATE MACHINE</span>
    </div>
    <div class="header-right">PAGE 09 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 07 — VOICE ASSISTANT STATE TRANSITION GRAPH</div>
        <div class="fig-caption">Hands-Busy Context: Hotword Wake → Intent Parse → Double-Entry Commit → Spoken TTS</div>
      </div>
      <div class="fig-sub font-mono">ENGINE: 100% LOCAL WEB SPEECH API (STT / TTS)</div>
    </div>

    <!-- Cinematic Voice FSM Canvas -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 840 220" style="width: 100%; height: auto;">
        <!-- State 1: Passive Listening -->
        <circle cx="80" cy="110" r="45" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
        <text x="80" y="105" text-anchor="middle" font-size="9" font-weight="700" fill="#ffffff">PASSIVE</text>
        <text x="80" y="118" text-anchor="middle" font-size="9" font-weight="700" fill="#ffffff">LISTENING</text>
        <text x="80" y="130" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Hotword Sentinel</text>

        <path d="M 125 110 L 175 110" stroke="#38bdf8" stroke-width="2" />
        <text x="150" y="103" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#38bdf8">"Hey Aura"</text>

        <!-- State 2: Audio Chime & HUD -->
        <rect x="175" y="85" width="115" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <text x="232" y="108" text-anchor="middle" font-size="9" font-weight="800" fill="#38bdf8">VOICE HUD ACTIVE</text>
        <text x="232" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#cbd5e1">Audio Chime + Orb Glow</text>

        <path d="M 290 110 L 340 110" stroke="#38bdf8" stroke-width="2" />

        <!-- State 3: Intent Classification -->
        <polygon points="390,70 440,110 390,150 340,110" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5" />
        <text x="390" y="113" text-anchor="middle" font-size="8.5" font-weight="800" fill="#c084fc">INTENT?</text>

        <!-- Branch A: Transaction -->
        <path d="M 415 90 L 490 60" stroke="#34d399" stroke-width="1.5" />
        <rect x="490" y="40" width="165" height="35" rx="5" fill="#0f172a" stroke="#34d399" stroke-width="1.5" />
        <text x="572" y="58" text-anchor="middle" font-size="8.5" font-weight="700" fill="#34d399">POST BALANCED TRANSACTION</text>
        <text x="572" y="69" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#cbd5e1">"Spent $45 on fuel"</text>

        <!-- Branch B: Ledger Lookup -->
        <path d="M 440 110 L 490 110" stroke="#38bdf8" stroke-width="1.5" />
        <rect x="490" y="92" width="165" height="35" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <text x="572" y="110" text-anchor="middle" font-size="8.5" font-weight="700" fill="#38bdf8">LOOKUP REAL-TIME BALANCE</text>
        <text x="572" y="121" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#cbd5e1">"What is my net cash balance?"</text>

        <!-- Branch C: Runway Evaluation -->
        <path d="M 415 130 L 490 160" stroke="#f59e0b" stroke-width="1.5" />
        <rect x="490" y="145" width="165" height="35" rx="5" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
        <text x="572" y="163" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fcd34d">RUNWAY &amp; BUDGET EVALUATION</text>
        <text x="572" y="174" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#cbd5e1">"Can I afford dinner tonight?"</text>

        <!-- Connect to Spoken Output -->
        <path d="M 655 60 L 710 95" stroke="#34d399" stroke-width="1.5" />
        <path d="M 655 110 L 710 110" stroke="#38bdf8" stroke-width="1.5" />
        <path d="M 655 160 L 710 125" stroke="#f59e0b" stroke-width="1.5" />

        <rect x="710" y="85" width="115" height="50" rx="6" fill="#18181b" stroke="#38bdf8" stroke-width="2" />
        <text x="767" y="108" text-anchor="middle" font-size="9" font-weight="800" fill="#ffffff">SPOKEN TTS</text>
        <text x="767" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#38bdf8">Speech Synthesis</text>

        <!-- Return to Passive -->
        <path d="M 767 135 L 767 195 L 80 195 L 80 155" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,3" />
        <text x="425" y="190" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">AUTO-CLOSE HUD &amp; RETURN TO PASSIVE LISTENING (1200ms)</text>
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>VOICE ASSISTANT FINITE STATE MACHINE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 10: DEEP FEATURE VERIFICATION / 60–120 SECONDS
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">09 · STAGE 3 (01:00–02:00)</span>
      <span class="header-title">DEEP FEATURE VERIFICATION: THE THREE AUDIT PILLARS</span>
    </div>
    <div class="header-right">PAGE 10 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 08 — THREE-PILLAR VERIFICATION SPREAD</div>
        <div class="fig-caption">Auditing Accounting Integrity, Physical Bullion Valuation, and Multimodal OCR</div>
      </div>
      <div class="fig-sub font-mono">AUDIT PATHWAY: VERIFY → MEASURE → INGEST</div>
    </div>

    <!-- 3-Pillar Horizontal Spread -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
      <!-- Pillar 1: Ledger -->
      <div class="glass-card" style="border-top: 3px solid #7c3aed; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 800; color: #7c3aed; font-family: 'JetBrains Mono';">PILLAR 01: LEDGER</span>
            <span class="callout-pill pill-purple" style="font-size: 7px;">VERIFY</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 4px;">General Ledger &amp; Trial Balance</div>
          <p style="font-size: 8.5px; color: #64748b; line-height: 1.35; margin-top: 4px;">
            The evaluator verifies that debits equal credits down to $0.01 precision across standard accounts (1000s–5000s).
          </p>
        </div>

        <div class="macos-window" style="margin: 6px 0;">
          <div class="macos-header" style="height: 15px;"><div class="macos-dot dot-red" style="width:5px;height:5px;"></div></div>
          <div class="macos-body" style="height: 115px;"><img src="${imgGeneralLedger || imgTrialBalance}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #7c3aed;">
          IDENTITY: Σ Debits ≡ Σ Credits (Variance = $0.00)
        </div>
      </div>

      <!-- Pillar 2: Bullion -->
      <div class="glass-card" style="border-top: 3px solid #f59e0b; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 800; color: #b45309; font-family: 'JetBrains Mono';">PILLAR 02: BULLION</span>
            <span class="callout-pill pill-amber" style="font-size: 7px;">MEASURE</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 4px;">Precious Metals Mark-to-Market</div>
          <p style="font-size: 8.5px; color: #64748b; line-height: 1.35; margin-top: 4px;">
            Evaluates physical gold holdings in Grams, Troy Ounces, and South Asian Tolas with live spot exchange ratios.
          </p>
        </div>

        <div class="macos-window" style="margin: 6px 0;">
          <div class="macos-header" style="height: 15px;"><div class="macos-dot dot-red" style="width:5px;height:5px;"></div></div>
          <div class="macos-body" style="height: 115px;"><img src="${imgDashboard}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #b45309;">
          METRIC: 1 Tola ≡ 11.6638g · Asset 1060
        </div>
      </div>

      <!-- Pillar 3: OCR -->
      <div class="glass-card" style="border-top: 3px solid #059669; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 800; color: #047857; font-family: 'JetBrains Mono';">PILLAR 03: OCR</span>
            <span class="callout-pill pill-emerald" style="font-size: 7px;">INGEST</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 4px;">Multimodal Receipt Scanner</div>
          <p style="font-size: 8.5px; color: #64748b; line-height: 1.35; margin-top: 4px;">
            Drops paper receipt into browser; Gemini Vision parses merchant, date, amount, and presents balanced journal entry.
          </p>
        </div>

        <div class="macos-window" style="margin: 6px 0;">
          <div class="macos-header" style="height: 15px;"><div class="macos-dot dot-red" style="width:5px;height:5px;"></div></div>
          <div class="macos-body" style="height: 115px;"><img src="${imgGeneralLedger}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #047857;">
          ENGINE: Gemini 2.0 Flash Vision
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>THREE AUDIT PILLARS VERIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 11: GENERAL LEDGER UX (BALANCE SENTINEL)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">10 · ACCOUNTING SENTINEL</span>
      <span class="header-title">THE LEDGER AS A UX SAFETY MECHANISM (ZERO-VARIANCE CONTROL)</span>
    </div>
    <div class="header-right">PAGE 11 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 100%;">
      <!-- Left: Balance Sentinel Architecture -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="fig-tag">FIG. 09 — BALANCE SENTINEL UX LOGIC</div>
          <div class="fig-caption">Preventing Ledger Corruption at the Interaction Layer</div>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.5; margin-top: 6px;">
            In consumer finance apps, transactions are simple text fields that easily drift out of balance. In AuraFinance OS, the General Ledger acts as a strict guardrail: entries with non-zero variance cannot be committed.
          </p>
        </div>

        <!-- Logic Box -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Case A: Blocked -->
          <div style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 9px; font-weight: 800; color: #f87171;">CASE A: UNBALANCED (BLOCK COMMIT)</span>
              <span class="callout-pill" style="background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); font-size: 7px;">REJECTED</span>
            </div>
            <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #cbd5e1; margin-top: 4px;">
              Debit (Dr): $100.00 | Credit (Cr): $90.00 → Variance: $10.00
            </div>
            <div style="font-size: 7.5px; color: #fca5a5; margin-top: 2px;">
              Sentinel Action: Disables Post Button, pulses crimson warning indicator.
            </div>
          </div>

          <!-- Case B: Allowed -->
          <div style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 9px; font-weight: 800; color: #34d399;">CASE B: EQUALIZED (ALLOW COMMIT)</span>
              <span class="callout-pill pill-emerald" style="font-size: 7px;">APPROVED</span>
            </div>
            <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #cbd5e1; margin-top: 4px;">
              Debit (Dr): $100.00 | Credit (Cr): $100.00 → Variance: $0.00
            </div>
            <div style="font-size: 7.5px; color: #86efac; margin-top: 2px;">
              Sentinel Action: Enables Post Button, writes atomic transaction to Dexie.
            </div>
          </div>
        </div>

        <div style="font-family: 'JetBrains Mono'; font-size: 8px; color: #38bdf8;">
          CORE REPUTATION IDENTITY: Σ DEBITS ≡ Σ CREDITS
        </div>
      </div>

      <!-- Right: Real Trial Balance Screenshot -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">AUDIT PROOF</div>
        <div class="fig-caption">Trial Balance View with Zero-Variance Totals Row</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1;">
          <div class="macos-header">
            <div class="macos-dot dot-red"></div>
            <div class="macos-dot dot-yellow"></div>
            <div class="macos-dot dot-green"></div>
            <div class="macos-url">aura-finance-silk.vercel.app/ledger/trial-balance</div>
          </div>
          <div class="macos-body" style="height: 100%; min-height: 250px;">
            <img src="${imgTrialBalance || imgGeneralLedger}" style="width: 100%; height: 100%; object-fit: cover;" alt="Trial Balance View" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>GENERAL LEDGER BALANCE SENTINEL</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 12: BULLION / COMMODITY UX ("MASS BECOMES VALUE")
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">11 · PHYSICAL ASSETS</span>
      <span class="header-title">MASS BECOMES VALUE: COMMODITY &amp; BULLION VAULT UX</span>
    </div>
    <div class="header-right">PAGE 12 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 10 — COMMODITY UNIT SWITCHER &amp; VALUATION CHAIN</div>
        <div class="fig-caption">Interactive Mass Conversion: Grams ↔ South Asian Tolas ↔ Troy Ounces</div>
      </div>
      <div class="fig-sub font-mono">FORMULA: VALUE = WEIGHT_GRAMS × SPOT_PRICE_PER_GRAM</div>
    </div>

    <!-- Conversion Spread -->
    <div style="flex: 1; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px;">
      <!-- Left: Conversion Flow -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #0f172a;">CULTURAL COMMODITY METRICS</div>
          <p style="font-size: 9.5px; color: #64748b; line-height: 1.45; margin-top: 4px;">
            Gold is predominantly traded in Tolas across South Asian Sarafa Bazaars, whereas international contracts use Troy Ounces or Grams. AuraFinance OS provides a seamless interactive unit toggle.
          </p>
        </div>

        <svg viewBox="0 0 380 120" style="width: 100%; height: auto; margin: 8px 0;">
          <!-- Unit Toggle Box -->
          <rect x="20" y="25" width="100" height="70" rx="6" fill="#f8fafc" stroke="#f59e0b" stroke-width="1.5" />
          <text x="70" y="48" text-anchor="middle" font-size="8.5" font-weight="700" fill="#b45309">UNIT TOGGLE</text>
          <text x="70" y="62" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#0f172a">Grams (g)</text>
          <text x="70" y="74" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#0f172a">Tolas (11.66g)</text>
          <text x="70" y="86" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#0f172a">Troy Oz (31.1g)</text>

          <path d="M 120 60 L 165 60" stroke="#f59e0b" stroke-width="1.5" />

          <!-- Normalizer -->
          <rect x="165" y="30" width="100" height="60" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
          <text x="215" y="55" text-anchor="middle" font-size="8.5" font-weight="800" fill="#92400e">SPOT PARITY</text>
          <text x="215" y="70" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#78350f">Live USD / PKR</text>

          <path d="M 265 60 L 310 60" stroke="#f59e0b" stroke-width="1.5" />

          <!-- Balance Sheet -->
          <rect x="310" y="25" width="60" height="70" rx="6" fill="#f0fdf4" stroke="#10b981" stroke-width="2" />
          <text x="340" y="55" text-anchor="middle" font-size="8" font-weight="800" fill="#047857">ASSET</text>
          <text x="340" y="68" text-anchor="middle" font-size="8" font-weight="800" fill="#047857">1060</text>
          <text x="340" y="80" text-anchor="middle" font-size="6.5" font-family="JetBrains Mono" fill="#059669">Net Worth</text>
        </svg>

        <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #b45309;">
          ACCOUNT BINDING: Real bullion mass marks directly to Asset 1060 Bullion Reserve.
        </div>
      </div>

      <!-- Right: Bullion Card Exhibit -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 10px; font-weight: 800; color: #0f172a;">BULLION RESERVE METRICS EXHIBIT</div>
          <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono'; margin-top: 1px;">Live Precious Metals Portfolio</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin: 10px 0;">
          <div style="padding: 8px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 9px; font-weight: 800; color: #92400e;">
              <span>PHYSICAL GOLD (24K BARS)</span>
              <span class="font-mono">8.57 Tolas (100.00g)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 7.5px; color: #b45309; font-family: 'JetBrains Mono'; margin-top: 3px;">
              <span>Market Spot Valuation</span>
              <span>$8,245.00 (+14.2% P&amp;L)</span>
            </div>
          </div>

          <div style="padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 9px; font-weight: 800; color: #334155;">
              <span>PHYSICAL SILVER (.999 COINS)</span>
              <span class="font-mono">42.87 Tolas (500.00g)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 7.5px; color: #64748b; font-family: 'JetBrains Mono'; margin-top: 3px;">
              <span>Market Spot Valuation</span>
              <span>$485.00 (+8.6% P&amp;L)</span>
            </div>
          </div>
        </div>

        <div class="callout-pill pill-amber" style="font-size: 8px; align-self: flex-start;">
          🥇 TOTAL BULLION RESERVE CONTRIBUTION: +$8,730.00 NET WORTH
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>COMMODITY &amp; BULLION VAULT UX</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 13: RECEIPT OCR UX ("FROM RECEIPT TO JOURNAL ENTRY")
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">12 · MULTIMODAL INGESTION</span>
      <span class="header-title">FROM RECEIPT TO JOURNAL ENTRY: MULTIMODAL OCR PIPELINE</span>
    </div>
    <div class="header-right">PAGE 13 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 11 — RECEIPT-TO-LEDGER OCR PIPELINE</div>
        <div class="fig-caption">Client-Side Compression → Gemini 2.0 Flash Vision → Balanced Proposal → Atomic Write</div>
      </div>
      <div class="fig-sub font-mono">PARSING LATENCY: ~850MS (ZERO DATA TRAINING RETENTION)</div>
    </div>

    <!-- Complete OCR Sequence Flow -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
      <svg viewBox="0 0 850 160" style="width: 100%; height: auto;">
        <!-- Step 1: Upload -->
        <rect x="15" y="25" width="105" height="55" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
        <text x="67" y="48" text-anchor="middle" font-size="9" font-weight="700" fill="#f8fafc">RECEIPT UPLOAD</text>
        <text x="67" y="62" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Drag &amp; Drop Image</text>

        <path d="M 120 52 L 155 52" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Step 2: Compression -->
        <rect x="155" y="25" width="115" height="55" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <text x="212" y="48" text-anchor="middle" font-size="9" font-weight="700" fill="#38bdf8">CLIENT RESIZE</text>
        <text x="212" y="62" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Canvas Max 1200px</text>

        <path d="M 270 52 L 305 52" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Step 3: Gemini Vision -->
        <rect x="305" y="20" width="130" height="65" rx="6" fill="#1e1b4b" stroke="#a855f7" stroke-width="2" />
        <text x="370" y="46" text-anchor="middle" font-size="9.5" font-weight="800" fill="#c084fc">GEMINI 2.0 VISION</text>
        <text x="370" y="60" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#e9d5ff">Multimodal Extraction</text>
        <text x="370" y="72" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#38bdf8">Zero Server Middleman</text>

        <path d="M 435 52 L 470 52" stroke="#a855f7" stroke-width="1.5" />

        <!-- Step 4: Proposal -->
        <rect x="470" y="25" width="125" height="55" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
        <text x="532" y="48" text-anchor="middle" font-size="9" font-weight="700" fill="#fbbf24">JOURNAL PROPOSAL</text>
        <text x="532" y="62" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Dr Expense / Cr Cash</text>

        <path d="M 595 52 L 630 52" stroke="#f59e0b" stroke-width="1.5" />

        <!-- Step 5: User Confirmation -->
        <rect x="630" y="25" width="105" height="55" rx="6" fill="#0f172a" stroke="#34d399" stroke-width="1.5" />
        <text x="682" y="48" text-anchor="middle" font-size="9" font-weight="700" fill="#34d399">1-TAP AUDIT</text>
        <text x="682" y="62" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Approve / Edit Lines</text>

        <path d="M 735 52 L 770 52" stroke="#34d399" stroke-width="1.5" />

        <!-- Step 6: Atomic Commit -->
        <rect x="770" y="20" width="65" height="65" rx="6" fill="#18181b" stroke="#10b981" stroke-width="2" />
        <text x="802" y="48" text-anchor="middle" font-size="9" font-weight="900" fill="#10b981">POST</text>
        <text x="802" y="62" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Dexie Write</text>

        <!-- Downward SSOT notification -->
        <path d="M 802 85 L 802 125 L 430 125" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3" />
        <text x="615" y="118" font-size="8" font-family="JetBrains Mono" fill="#34d399">SYNCHRONIZE OVERVIEW &amp; TRIAL BALANCE (&lt;16ms)</text>
      </svg>

      <div style="display: flex; gap: 8px;">
        <div class="callout-pill" style="font-size: 8px;">📷 CLIENT RESIZING REDUCES PAYLOAD SIZE BY 85%</div>
        <div class="callout-pill pill-purple" style="font-size: 8px;">🤖 MULTIMODAL PROMPT DIRECT FROM BROWSER CONTEXT</div>
        <div class="callout-pill pill-emerald" style="font-size: 8px;">⚖️ PREVENTS UNBALANCED OCR ERRORS</div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>MULTIMODAL RECEIPT OCR PIPELINE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 14: AUDIT + EXPORT / 120–180 SECONDS
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">13 · STAGE 4 (02:00–03:00)</span>
      <span class="header-title">FROM FINANCIAL STATE TO AUDIT ARTIFACT (24H PDF &amp; SHA-256)</span>
    </div>
    <div class="header-right">PAGE 14 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 100%;">
      <!-- Left Column: Process Graph -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span class="time-badge" style="color: #0284c7; font-size: 28px;">03:00</span>
            <span style="font-size: 10px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Cryptographic Statement</span>
          </div>
          <p style="font-size: 10px; color: #64748b; line-height: 1.5; margin-top: 6px;">
            At the conclusion of the evaluation journey, the user requests a verifiable audit statement. The browser queries the last 24 hours of journal entries, computes opening and closing balances, hashes the dataset with SHA-256, and renders an official PDF.
          </p>

          <!-- Numbered Steps -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 12px;">
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #0284c7;">STEP 1:</strong> Query <code class="font-mono text-cyan-700">ledgerDb.journalEntries</code> for preceding 24h.
            </div>
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #0284c7;">STEP 2:</strong> Reconcile Opening Balance against liquid cash (<code class="font-mono">1010+1020</code>).
            </div>
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #7c3aed;">STEP 3:</strong> Compute SHA-256 digital verification digest over record JSON.
            </div>
            <div class="glass-card" style="padding: 6px 10px; font-size: 8.5px;">
              <strong style="color: #059669;">STEP 4:</strong> Stream vector tables and digital seal into PDF blob for download.
            </div>
          </div>
        </div>

        <div class="callout-pill pill-emerald" style="font-size: 8px;">
          🔒 DIGITAL SEAL GUARANTEES MATHEMATICAL IMMUTABILITY
        </div>
      </div>

      <!-- Right Column: Statement Preview Screenshot -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">AUDIT ARTIFACT</div>
        <div class="fig-caption">24-Hour Statement Generator &amp; SHA-256 Hash Display</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1;">
          <div class="macos-header">
            <div class="macos-dot dot-red"></div>
            <div class="macos-dot dot-yellow"></div>
            <div class="macos-dot dot-green"></div>
            <div class="macos-url">aura-finance-silk.vercel.app/settings/statement</div>
          </div>
          <div class="macos-body" style="height: 100%; min-height: 250px;">
            <img src="${imgStatement || imgVault}" style="width: 100%; height: 100%; object-fit: cover;" alt="24H Statement Screenshot" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>24H STATEMENT VECTOR PDF UX</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 15: ENCRYPTED VAULT UX ("YOUR FINANCIAL VAULT")
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">14 · HARDWARE SECURITY</span>
      <span class="header-title">YOUR FINANCIAL VAULT: CLIENT-SIDE AES-GCM-256 SOVEREIGNTY</span>
    </div>
    <div class="header-right">PAGE 15 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 12 — ENCRYPTED VAULT INTERACTION &amp; DECK</div>
        <div class="fig-caption">Password-Derived PBKDF2 Key Generation with Instant Offline JSON Container</div>
      </div>
      <div class="fig-sub font-mono">SPEC: 100,000 SHA-256 HMAC ROUNDS · ZERO BACKEND EXPOSURE</div>
    </div>

    <!-- Vault Teardown & Live Screenshot -->
    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <!-- Left: Crypto Flow Cards -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div class="glass-card">
          <div style="font-size: 10px; font-weight: 800; color: #38bdf8;">1. VAULT EXPORT SEQUENCE</div>
          <p style="font-size: 8.5px; color: #cbd5e1; line-height: 1.4; margin-top: 4px;">
            Evaluator enters a personal passphrase. Web Crypto derives a 256-bit AES-GCM hardware key, encrypts all Dexie collections into a canonical envelope, and prompts browser download.
          </p>
          <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #34d399; margin-top: 6px;">
            OUTPUT: AuraFinance_MasterVault_2026.json
          </div>
        </div>

        <div class="glass-card">
          <div style="font-size: 10px; font-weight: 800; color: #a855f7;">2. AIR-GAPPED RESTORE SEQUENCE</div>
          <p style="font-size: 8.5px; color: #cbd5e1; line-height: 1.4; margin-top: 4px;">
            Dropped vault JSON file is validated. Entering the original passphrase decrypts the ciphertext in memory, wiping and restoring IndexedDB stores with atomic consistency.
          </p>
          <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #c084fc; margin-top: 6px;">
            AUTHENTICATED: 128-Bit GCM Integrity Tag Verification
          </div>
        </div>

        <div class="glass-card">
          <div style="font-size: 10px; font-weight: 800; color: #f43f5e;">3. EMERGENCY DATA WIPEOUT</div>
          <p style="font-size: 8.5px; color: #cbd5e1; line-height: 1.4; margin-top: 4px;">
            One-tap cryptographic wipe deletes all Dexie tables, session caches, and Web Crypto keys instantly, returning the browser to a factory clean state.
          </p>
        </div>
      </div>

      <!-- Right: Real Encrypted Vault Deck Screenshot -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">SECURITY INTERACTION DECK</div>
        <div class="fig-caption">Settings View / Encrypted Master Vault Controls</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1;">
          <div class="macos-header">
            <div class="macos-dot dot-red"></div>
            <div class="macos-dot dot-yellow"></div>
            <div class="macos-dot dot-green"></div>
            <div class="macos-url">aura-finance-silk.vercel.app/settings/vault</div>
          </div>
          <div class="macos-body" style="height: 100%; min-height: 240px;">
            <img src="${imgVault}" style="width: 100%; height: 100%; object-fit: cover;" alt="Encrypted Vault Screenshot" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>ENCRYPTED VAULT UX SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 16: URDU / RTL EXPERIENCE
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">15 · CULTURAL LOCALIZATION</span>
      <span class="header-title">THE INTERFACE CHANGES DIRECTION: URDU &amp; RTL DOM MIRRORING</span>
    </div>
    <div class="header-right">PAGE 16 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 13 — DOM MIRRORING &amp; VERNACULAR VOCABULARY</div>
        <div class="fig-caption">Structural RTL Transformation with Native South Asian Financial Concepts</div>
      </div>
      <div class="fig-sub font-mono">DOM TRANSFORMATION: DIR="LTR" → DIR="RTL" (ZERO HYDRATION JITTER)</div>
    </div>

    <!-- Bilingual RTL Comparison Spread -->
    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <!-- LTR Column -->
      <div class="glass-card" style="border-left: 3px solid #0284c7;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; color: #0284c7; font-family: 'JetBrains Mono';">DEFAULT LTR (ENGLISH)</span>
          <span style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #64748b;">dir="ltr"</span>
        </div>
        <div style="font-size: 9px; color: #64748b; line-height: 1.4; margin-bottom: 8px;">
          Standard navigation anchored on left. Metrics and decimal values formatted with Western left-to-right syntax.
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; font-weight: 700; color: #0f172a;">
            <span>Hero Net Cash</span>
            <span class="font-mono text-cyan-600">$48,250.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748b; margin-top: 4px;">
            <span>Bazaar Sentinel</span>
            <span>Mandi Wholesale Parity</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748b; margin-top: 4px;">
            <span>Rotary Fund</span>
            <span>Kameti Savings Pool</span>
          </div>
        </div>
      </div>

      <!-- RTL Column -->
      <div class="glass-card" style="border-right: 3px solid #10b981; direction: rtl; text-align: right;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; color: #047857; font-family: 'JetBrains Mono';">MIRRORED RTL (اردو)</span>
          <span style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #64748b;">dir="rtl"</span>
        </div>
        <div style="font-size: 9px; color: #64748b; line-height: 1.4; margin-bottom: 8px;">
          مکمل دائیں سے بائیں سٹرکچرل الٹاؤ مع مستند دیسی مالیاتی اصطلاحات (راشن راڈار، مصیبت کا لفافہ، کمیٹی).
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; font-weight: 700; color: #0f172a;">
            <span>خالص نقد بیلنس</span>
            <span class="font-mono text-emerald-600">₨ 48,250.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748b; margin-top: 4px;">
            <span>راشن راڈار</span>
            <span>منڈی ہول سیل قیمت انڈیکس</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748b; margin-top: 4px;">
            <span>کمیٹی فنڈ</span>
            <span>باہمی ماہانہ بچت پول</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>VERNACULAR LOCALIZATION &amp; RTL DOM MIRRORING</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 17: COMPLETE USER ACTIVITY DIAGRAM
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">16 · UML ACTIVITY ARCHITECTURE</span>
      <span class="header-title">COMPLETE EVALUATOR ACTIVITY WORKFLOW</span>
    </div>
    <div class="header-right">PAGE 17 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 14 — COMPLETE EVALUATION JOURNEY ACTIVITY DIAGRAM</div>
        <div class="fig-caption">From System Ingestion to Cryptographic Verification Seal</div>
      </div>
      <div class="fig-sub font-mono">CONVENTIONS: UML 2.5 ACTIVITY SPECIFICATION</div>
    </div>

    <!-- Complete UML Activity Canvas -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 850 220" style="width: 100%; height: auto;">
        <!-- Start Node -->
        <circle cx="40" cy="110" r="12" fill="#38bdf8" />
        <circle cx="40" cy="110" r="16" fill="none" stroke="#38bdf8" stroke-width="1.5" />

        <path d="M 56 110 L 85 110" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Activity 1: App Hydrates -->
        <rect x="85" y="85" width="90" height="50" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <text x="130" y="108" text-anchor="middle" font-size="8.5" font-weight="700" fill="#f8fafc">APP HYDRATES</text>
        <text x="130" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Dexie Seed Data</text>

        <path d="M 175 110 L 205 110" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Activity 2: Select Persona -->
        <rect x="205" y="85" width="95" height="50" rx="8" fill="#0f172a" stroke="#818cf8" stroke-width="1.5" />
        <text x="252" y="108" text-anchor="middle" font-size="8.5" font-weight="700" fill="#a5b4fc">SELECT PERSONA</text>
        <text x="252" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Resident / Freelance</text>

        <path d="M 300 110 L 330 110" stroke="#818cf8" stroke-width="1.5" />

        <!-- Activity 3: Test Command / Voice -->
        <rect x="330" y="85" width="95" height="50" rx="8" fill="#0f172a" stroke="#a855f7" stroke-width="1.5" />
        <text x="377" y="108" text-anchor="middle" font-size="8.5" font-weight="700" fill="#c084fc">COMMAND / VOICE</text>
        <text x="377" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">⌘K / "Hey Aura"</text>

        <path d="M 425 110 L 455 110" stroke="#a855f7" stroke-width="1.5" />

        <!-- Activity 4: Verify Ledger -->
        <rect x="455" y="85" width="95" height="50" rx="8" fill="#0f172a" stroke="#34d399" stroke-width="1.5" />
        <text x="502" y="108" text-anchor="middle" font-size="8.5" font-weight="700" fill="#34d399">VERIFY LEDGER</text>
        <text x="502" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Σ Dr ≡ Σ Cr</text>

        <path d="M 550 110 L 580 110" stroke="#34d399" stroke-width="1.5" />

        <!-- Activity 5: Scan Receipt -->
        <rect x="580" y="85" width="95" height="50" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
        <text x="627" y="108" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fcd34d">SCAN RECEIPT</text>
        <text x="627" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Gemini Vision OCR</text>

        <path d="M 675 110 L 705 110" stroke="#f59e0b" stroke-width="1.5" />

        <!-- Activity 6: Generate Statement -->
        <rect x="705" y="85" width="95" height="50" rx="8" fill="#0f172a" stroke="#f43f5e" stroke-width="2" />
        <text x="752" y="108" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fb7185">GENERATE PDF</text>
        <text x="752" y="122" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">SHA-256 Digest</text>

        <!-- Final Node -->
        <path d="M 800 110 L 825 110" stroke="#f43f5e" stroke-width="2" />
        <circle cx="835" cy="110" r="10" fill="#10b981" />
        <circle cx="835" cy="110" r="14" fill="none" stroke="#10b981" stroke-width="1.5" />
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>COMPLETE USER ACTIVITY DIAGRAM</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 18: UX STATE MACHINE
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">17 · INTERACTION FSM</span>
      <span class="header-title">MASTER INTERACTIVE UX STATE MACHINE</span>
    </div>
    <div class="header-right">PAGE 18 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 15 — MASTER INTERACTION STATE MACHINE</div>
        <div class="fig-caption">Continuous State Lifecycle with Deterministic Error &amp; Voice Recovery Loops</div>
      </div>
      <div class="fig-sub font-mono">FINITE STATES: 8 PRIMARY · 2 ASYNC BYPASS BRANCHES</div>
    </div>

    <!-- UX FSM Canvas -->
    <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 850 190" style="width: 100%; height: auto;">
        <!-- State 1: IDLE -->
        <rect x="20" y="70" width="80" height="45" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
        <text x="60" y="92" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0f172a">IDLE</text>
        <text x="60" y="104" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">Awaiting Input</text>

        <path d="M 100 92 L 140 92" stroke="#0284c7" stroke-width="1.5" />

        <!-- State 2: ORIENTING -->
        <rect x="140" y="70" width="95" height="45" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
        <text x="187" y="92" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0284c7">ORIENTING</text>
        <text x="187" y="104" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">Inspect Net Cash</text>

        <path d="M 235 92 L 275 92" stroke="#0284c7" stroke-width="1.5" />

        <!-- State 3: COMMANDING -->
        <rect x="275" y="70" width="105" height="45" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5" />
        <text x="327" y="92" text-anchor="middle" font-size="8.5" font-weight="700" fill="#7c3aed">COMMANDING</text>
        <text x="327" y="104" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#6d28d9">⌘K / Form Entry</text>

        <path d="M 380 92 L 420 92" stroke="#7c3aed" stroke-width="1.5" />

        <!-- State 4: PROCESSING -->
        <rect x="420" y="70" width="100" height="45" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
        <text x="470" y="92" text-anchor="middle" font-size="8.5" font-weight="700" fill="#b45309">PROCESSING</text>
        <text x="470" y="104" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#78350f">Parse &amp; Normalize</text>

        <path d="M 520 92 L 560 92" stroke="#f59e0b" stroke-width="1.5" />

        <!-- State 5: VALIDATING -->
        <polygon points="605,65 645,92 605,120 565,92" fill="#fdf4ff" stroke="#c026d3" stroke-width="1.5" />
        <text x="605" y="95" text-anchor="middle" font-size="8" font-weight="800" fill="#a21caf">VALID?</text>

        <!-- Error Branch -->
        <path d="M 605 65 L 605 30 L 327 30 L 327 70" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="466" y="24" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#dc2626">ERROR / UNBALANCED → REVISE ENTRY</text>

        <!-- Commit Branch -->
        <path d="M 645 92 L 690 92" stroke="#10b981" stroke-width="2" />

        <!-- State 6: COMMITTED -->
        <rect x="690" y="70" width="95" height="45" rx="6" fill="#f0fdf4" stroke="#10b981" stroke-width="2" />
        <text x="737" y="92" text-anchor="middle" font-size="8.5" font-weight="800" fill="#047857">COMMITTED</text>
        <text x="737" y="104" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#059669">Dexie Atomic</text>

        <!-- Final: Reflected -->
        <path d="M 785 92 L 805 92" stroke="#10b981" stroke-width="2" />
        <circle cx="817" cy="92" r="10" fill="#10b981" />
        <text x="817" y="95" text-anchor="middle" font-size="7" font-weight="900" fill="#ffffff">✓</text>
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>INTERACTIVE UX STATE MACHINE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 19: UX DATA FLOW DIAGRAM (LEVEL-1 DFD)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">18 · FUNCTIONAL MAPPING</span>
      <span class="header-title">LEVEL-1 UX DATA FLOW DIAGRAM (DFD)</span>
    </div>
    <div class="header-right">PAGE 19 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 16 — LEVEL-1 UX FUNCTIONAL DFD</div>
        <div class="fig-caption">From Sensory Human Inputs to Reactive Visual State Outputs</div>
      </div>
      <div class="fig-sub font-mono">INTERACTION SURFACES BOUND STRICTLY TO INDEXEDDB</div>
    </div>

    <!-- Level-1 UX DFD Canvas -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 850 200" style="width: 100%; height: auto;">
        <!-- Inputs Column -->
        <rect x="20" y="20" width="110" height="160" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
        <text x="75" y="40" text-anchor="middle" font-size="9.5" font-weight="800" fill="#ffffff">USER INPUTS</text>
        <text x="75" y="65" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">• ⌘K Text</text>
        <text x="75" y="85" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">• Voice Audio</text>
        <text x="75" y="105" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">• Receipt Photo</text>
        <text x="75" y="125" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">• Ledger Forms</text>
        <text x="75" y="145" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">• JSON Vault</text>

        <path d="M 130 100 L 175 100" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Interaction Layer -->
        <rect x="175" y="20" width="130" height="160" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <text x="240" y="40" text-anchor="middle" font-size="9.5" font-weight="800" fill="#38bdf8">INTERACTION</text>
        <text x="240" y="65" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Command Palette</text>
        <text x="240" y="85" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Voice Orb HUD</text>
        <text x="240" y="105" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Persona Studio</text>
        <text x="240" y="125" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Dropzone Scanner</text>
        <text x="240" y="145" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Sliders &amp; Toggles</text>

        <path d="M 305 100 L 350 100" stroke="#38bdf8" stroke-width="1.5" />

        <!-- SSOT Hub -->
        <circle cx="420" cy="100" r="50" fill="#1e1b4b" stroke="#7c3aed" stroke-width="2" />
        <text x="420" y="95" text-anchor="middle" font-size="10" font-weight="900" fill="#ffffff">RECONCILE</text>
        <text x="420" y="108" text-anchor="middle" font-size="10" font-weight="900" fill="#38bdf8">SSOT</text>
        <text x="420" y="120" text-anchor="middle" font-size="6.5" font-family="JetBrains Mono" fill="#c084fc">GAAP Engine</text>

        <path d="M 470 100 L 515 100" stroke="#7c3aed" stroke-width="1.5" />

        <!-- Persistence -->
        <rect x="515" y="35" width="120" height="130" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
        <text x="575" y="55" text-anchor="middle" font-size="9.5" font-weight="800" fill="#34d399">PERSISTENCE</text>
        <text x="575" y="80" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Dexie.js Tables</text>
        <text x="575" y="100" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">IndexedDB Storage</text>
        <text x="575" y="120" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Web Crypto Vault</text>
        <text x="575" y="140" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Session Cache</text>

        <path d="M 635 100 L 680 100" stroke="#10b981" stroke-width="1.5" />

        <!-- Output Surfaces -->
        <rect x="680" y="20" width="150" height="160" rx="6" fill="#090E1E" stroke="#f43f5e" stroke-width="1.5" />
        <text x="755" y="40" text-anchor="middle" font-size="9.5" font-weight="800" fill="#fb7185">REACTIVE VIEWS</text>
        <text x="755" y="65" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Hero Liquidity Net Cash</text>
        <text x="755" y="85" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">General Ledger Trial</text>
        <text x="755" y="105" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Particle Stream 60FPS</text>
        <text x="755" y="125" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">AI Copilot Chatbot</text>
        <text x="755" y="145" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">24H Vector PDF Seal</text>
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>LEVEL-1 UX DATA FLOW DIAGRAM</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 20: PRODUCT INFORMATION ARCHITECTURE (SITEMAP)
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">19 · INFORMATION ARCHITECTURE</span>
      <span class="header-title">VISUAL SITEMAP &amp; WORKSPACE HIERARCHY</span>
    </div>
    <div class="header-right">PAGE 20 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 17 — HIERARCHICAL WORKSPACE TOPOLOGY</div>
        <div class="fig-caption">Seven Clustered Workspaces Covering 15 Unified Feature Modules</div>
      </div>
      <div class="fig-sub font-mono">NAVIGATION: SINGLE-PAGE APPLICATION REACT ROUTER / STATE</div>
    </div>

    <!-- Visual Sitemap Grid -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      <div class="glass-card" style="border-top: 3px solid #0284c7;">
        <div style="font-size: 10px; font-weight: 800; color: #0284c7;">OVERVIEW</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>Hero Liquidity Pulse</li>
          <li>50/30/20 Capital Bars</li>
          <li>Inflow / Burn Rate</li>
          <li>Cash Flow Particle Stream</li>
        </ul>
      </div>

      <div class="glass-card" style="border-top: 3px solid #7c3aed;">
        <div style="font-size: 10px; font-weight: 800; color: #7c3aed;">ACCOUNTING</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>General Journal (Dr/Cr)</li>
          <li>CPA Trial Balance</li>
          <li>Balance Sheet Report</li>
          <li>Income Statement</li>
        </ul>
      </div>

      <div class="glass-card" style="border-top: 3px solid #059669;">
        <div style="font-size: 10px; font-weight: 800; color: #059669;">WEALTH ENGINES</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>Bullion Reserve (Tolas)</li>
          <li>Wealth Time Machine</li>
          <li>Financial Goal Rings</li>
          <li>Personal Flow (Sankey)</li>
        </ul>
      </div>

      <div class="glass-card" style="border-top: 2px solid #f59e0b;">
        <div style="font-size: 10px; font-weight: 800; color: #b45309;">LIVING &amp; PEER</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>Daily Bazaar &amp; Rashan</li>
          <li>Bazaar Price Sentinel</li>
          <li>P2P Debt Splitter (IOU)</li>
          <li>Kameti Rotary Fund</li>
        </ul>
      </div>

      <div class="glass-card" style="border-top: 2px solid #e11d48;">
        <div style="font-size: 10px; font-weight: 800; color: #be123c;">ACADEMIC SUITE</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>Variance Analysis Lab</li>
          <li>Break-Even Simulator</li>
          <li>Capital NPV &amp; IRR</li>
          <li>VAT &amp; Audit Trail</li>
        </ul>
      </div>

      <div class="glass-card" style="border-top: 2px solid #06b6d4;">
        <div style="font-size: 10px; font-weight: 800; color: #0e7490;">INTELLIGENCE</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>AI Copilot (Mentor/Roast)</li>
          <li>Multimodal Receipt OCR</li>
          <li>Voice Assistant HUD</li>
          <li>Omnimodal Palette (⌘K)</li>
        </ul>
      </div>

      <div class="glass-card" style="border-top: 2px solid #64748b;">
        <div style="font-size: 10px; font-weight: 800; color: #334155;">SECURITY &amp; VAULT</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>AES-256 Encrypted Vault</li>
          <li>PBKDF2 Key Derivation</li>
          <li>Emergency Wipeout</li>
          <li>24H Vector PDF Statement</li>
        </ul>
      </div>

      <div class="glass-card" style="border-top: 2px solid #10b981;">
        <div style="font-size: 10px; font-weight: 800; color: #047857;">LOCALIZATION</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #475569; padding-left: 14px; margin-top: 6px; line-height: 1.5;">
          <li>English / Urdu / Arabic</li>
          <li>RTL DOM Mirroring</li>
          <li>Multi-Currency Normalizer</li>
          <li>Cultural Merchant Mappings</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>PRODUCT INFORMATION ARCHITECTURE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 21: SCREEN-TO-SCREEN JOURNEY STORYBOARD
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">20 · VISUAL STORYTELLING</span>
      <span class="header-title">CINEMATIC SCREEN-TO-SCREEN STORYBOARD</span>
    </div>
    <div class="header-right">PAGE 21 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 18 — 8-FRAME INTERACTION STORYBOARD</div>
        <div class="fig-caption">Sequenced Transitions Across Real Production Interfaces</div>
      </div>
      <div class="fig-sub font-mono">FLOW: INPUT → ACTION → SYSTEM RESPONSE → NEXT STATE</div>
    </div>

    <!-- 8-Panel Grid -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); gap: 8px;">
      <!-- Frame 1 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #38bdf8;">FRAME 01 · DASHBOARD</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgLightDashboard || imgDashboard}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">User lands on Opal Ceramic</div>
      </div>

      <!-- Frame 2 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #a855f7;">FRAME 02 · COPILOT AI</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgCopilot || imgDashboard}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Press CMD+J to open Copilot</div>
      </div>

      <!-- Frame 3 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #34d399;">FRAME 03 · GENERAL LEDGER</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgGeneralLedger}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Review balanced journal rows</div>
      </div>

      <!-- Frame 4 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #f59e0b;">FRAME 04 · TRIAL BALANCE</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgTrialBalance}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Audit zero-variance totals</div>
      </div>

      <!-- Frame 5 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #06b6d4;">FRAME 05 · CASH FLOW</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgCashFlow}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Inspect particle stream velocity</div>
      </div>

      <!-- Frame 6 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #f43f5e;">FRAME 06 · ACADEMIC SUITE</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgAcademicSuite}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Run BEP break-even slider</div>
      </div>

      <!-- Frame 7 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #818cf8;">FRAME 07 · SITEMAP ATLAS</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgSitemap}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Trigger visual topology overlay</div>
      </div>

      <!-- Frame 8 -->
      <div class="glass-card" style="padding: 6px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 8px; font-weight: 800; color: #10b981;">FRAME 08 · ENCRYPTED VAULT</div>
        <div class="macos-window" style="height: 65px;"><img src="${imgVault}" style="width:100%;height:100%;object-fit:cover;" /></div>
        <div style="font-size: 6.5px; font-family: 'JetBrains Mono'; color: #94a3b8;">Export AES-256 JSON backup</div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>SCREEN-TO-SCREEN STORYBOARD</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 22: UX FRICTION / RESPONSE MATRIX
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">21 · INTERACTION DESIGN</span>
      <span class="header-title">INTENT-TO-RESPONSE INTERACTION &amp; FRICTION MATRIX</span>
    </div>
    <div class="header-right">PAGE 22 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 19 — USER INTENT RESPONSE MATRIX</div>
        <div class="fig-caption">How the Interface Eliminates Friction Across Primary Financial Actions</div>
      </div>
      <div class="fig-sub font-mono">PHILOSOPHY: ZERO JARGON · INSTANT FEEDBACK</div>
    </div>

    <!-- Infographic Table / Matrix -->
    <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr 1fr 1fr; background: #0f172a; color: #ffffff; padding: 8px 12px; border-radius: 6px; font-size: 8px; font-weight: 800; font-family: 'JetBrains Mono';">
        <div>USER INTENT</div>
        <div>INTERACTION</div>
        <div>SYSTEM RESPONSE</div>
        <div>FINANCIAL STATE</div>
        <div>UI FEEDBACK</div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr 1fr 1fr; background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 8px; align-items: center;">
        <div style="font-weight: 700; color: #0f172a;">Quick Expense Log</div>
        <div class="font-mono text-cyan-600">⌘K "Lunch $15"</div>
        <div>Generates balanced journal proposal</div>
        <div class="font-mono text-emerald-600">Dr 5020 / Cr 1010</div>
        <div><span class="callout-pill pill-emerald" style="font-size:7px;">Toast + Audio</span></div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr 1fr 1fr; background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 8px; align-items: center;">
        <div style="font-weight: 700; color: #0f172a;">Paper Receipt Digitize</div>
        <div class="font-mono text-purple-600">Drag &amp; Drop Image</div>
        <div>Gemini Vision extracts items &amp; taxes</div>
        <div class="font-mono text-emerald-600">Atomic Dexie Write</div>
        <div><span class="callout-pill pill-purple" style="font-size:7px;">Review Dialog</span></div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr 1fr 1fr; background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 8px; align-items: center;">
        <div style="font-weight: 700; color: #0f172a;">Evaluate Impulse Buy</div>
        <div class="font-mono text-amber-600">Price Slider Drag</div>
        <div>Compares with remaining Wants budget</div>
        <div class="font-mono text-amber-600">Labor Hours Calc</div>
        <div><span class="callout-pill pill-amber" style="font-size:7px;">Lock Badge</span></div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr 1fr 1fr; background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 8px; align-items: center;">
        <div style="font-weight: 700; color: #0f172a;">Change Currency Base</div>
        <div class="font-mono text-cyan-600">Navbar Currency Pill</div>
        <div>Recalculates all 15 views via transitivity</div>
        <div class="font-mono text-cyan-600">Locked Currency Code</div>
        <div><span class="callout-pill" style="font-size:7px;">Zero Page Reload</span></div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr 1fr 1fr; background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 8px; align-items: center;">
        <div style="font-weight: 700; color: #0f172a;">Download 24H Audit</div>
        <div class="font-mono text-rose-600">Click Export PDF</div>
        <div>Computes SHA-256 seal over ledger</div>
        <div class="font-mono text-rose-600">Vector PDF Blob</div>
        <div><span class="callout-pill" style="font-size:7px; background:#ffe4e6; color:#be123c;">Auto Download</span></div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>INTENT-TO-RESPONSE INTERACTION MATRIX</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 23: COMPLETE UX SYSTEM MAP
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">22 · HOLISTIC SYNTHESIS</span>
      <span class="header-title">COMPLETE UX SYSTEM ARCHITECTURE &amp; FEEDBACK LOOP</span>
    </div>
    <div class="header-right">PAGE 23 // 24</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 20 — COMPLETE UX CLOSED-LOOP SYSTEM ARCHITECTURE</div>
        <div class="fig-caption">From Human Perception through Client Intelligence to Reconciled State</div>
      </div>
      <div class="fig-sub font-mono">LAW OF COHERENCE: ONE FINANCIAL STATE. MANY INTERACTIONS.</div>
    </div>

    <!-- Holistic System Loop Canvas -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 850 210" style="width: 100%; height: auto;">
        <!-- USER ENTITY -->
        <circle cx="80" cy="105" r="45" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
        <text x="80" y="100" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">EVALUATOR</text>
        <text x="80" y="115" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#38bdf8">User Perception</text>

        <!-- Forward Action Path -->
        <path d="M 125 105 L 180 105" stroke="#38bdf8" stroke-width="2" />
        <text x="152" y="98" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#38bdf8">Touch/Voice</text>

        <!-- INTERACTION LAYER -->
        <rect x="180" y="35" width="130" height="140" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="1.5" />
        <text x="245" y="58" text-anchor="middle" font-size="10" font-weight="800" fill="#38bdf8">INTERACTION</text>
        <text x="245" y="80" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Opal Ceramic UI</text>
        <text x="245" y="100" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Omnimodal ⌘K</text>
        <text x="245" y="120" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Voice Orb HUD</text>
        <text x="245" y="140" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Persona Studio</text>

        <path d="M 310 105 L 360 105" stroke="#0284c7" stroke-width="2" />

        <!-- CORE INTELLIGENCE & RECONCILIATION -->
        <circle cx="430" cy="105" r="55" fill="#1e1b4b" stroke="#7c3aed" stroke-width="2.5" />
        <text x="430" y="98" text-anchor="middle" font-size="10.5" font-weight="900" fill="#ffffff">SSOT ENGINE</text>
        <text x="430" y="112" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#38bdf8">GAAP Double-Entry</text>
        <text x="430" y="124" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#a5b4fc">&lt;16ms Math Core</text>

        <path d="M 485 105 L 535 105" stroke="#7c3aed" stroke-width="2" />

        <!-- PERSISTENCE -->
        <rect x="535" y="45" width="120" height="120" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
        <text x="595" y="70" text-anchor="middle" font-size="10" font-weight="800" fill="#34d399">PERSISTENCE</text>
        <text x="595" y="95" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Dexie IndexedDB</text>
        <text x="595" y="115" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Web Crypto Vault</text>
        <text x="595" y="135" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Zero Server Leak</text>

        <path d="M 655 105 L 705 105" stroke="#10b981" stroke-width="2" />

        <!-- FEEDBACK SURFACES -->
        <rect x="705" y="35" width="125" height="140" rx="8" fill="#090E1E" stroke="#f43f5e" stroke-width="1.5" />
        <text x="767" y="58" text-anchor="middle" font-size="10" font-weight="800" fill="#fb7185">FEEDBACK</text>
        <text x="767" y="80" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Hero Net Cash</text>
        <text x="767" y="100" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Particle Stream</text>
        <text x="767" y="120" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Trial Balance</text>
        <text x="767" y="140" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">Spoken Audio</text>

        <!-- Feedback Loop Back to User -->
        <path d="M 767 175 L 767 195 L 80 195 L 80 150" stroke="#34d399" stroke-width="2" stroke-dasharray="5,4" />
        <text x="425" y="190" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#34d399">REACTIVE PERCEPTION LOOP: VISUAL &amp; AUDIT CONFIRMATION (&lt;16MS)</text>
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>COMPLETE UX CLOSED-LOOP SYSTEM ARCHITECTURE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 24: FINAL MAGAZINE SPREAD
     ========================================================================= -->
<div class="page theme-obsidian" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at 50% 50%, #151d38 0%, #060913 85%);">
  <div style="max-width: 720px;">
    <div class="header-badge" style="font-size: 9px; padding: 4px 12px; margin-bottom: 24px;">PRODUCT DESIGN SUMMARY</div>
    
    <div style="font-family: 'Cinzel', serif; font-size: 44px; font-weight: 900; letter-spacing: 0.04em; color: #ffffff; line-height: 1.15;">
      FROM FIRST TOUCH<br/>TO FINANCIAL CONFIDENCE.
    </div>

    <div style="width: 60px; height: 2px; background: #38bdf8; margin: 24px auto;"></div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.7; font-weight: 400;">
      AuraFinance OS proves that privacy and financial sophistication can converge into an effortless user experience. By replacing authentication walls with instant local hydration, complex menus with omnimodal commands, and cloud speculation with client-side double-entry mathematics, it sets a new benchmark for autonomous personal finance.
    </p>

    <div style="margin-top: 36px; display: inline-flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="font-family: 'JetBrains Mono'; font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 0.05em;">
        https://aura-finance-silk.vercel.app/
      </div>
      <div style="font-size: 9px; font-family: 'JetBrains Mono'; color: #64748b;">
        AURAFINANCE OS · 7. USER JOURNEY DOCUMENT / UI/UX DESIGN · 2026
      </div>
    </div>
  </div>

  <div class="page-footer" style="position: absolute; bottom: 11mm; left: 16mm; right: 16mm;">
    <span>AURAFINANCE OS // UI/UX DESIGN DOSSIER</span>
    <span>END OF USER JOURNEY SPECIFICATION</span>
    <span>PAGE 24 // 24</span>
  </div>
</div>

</body>
</html>`;
}

// Generate HTML and write to disk
const htmlContent = generateUXJourneyHtml();
const outputPath = path.resolve('docs/AuraFinance_OS_User_Journey_UX_Design.html');
fs.writeFileSync(outputPath, htmlContent);
console.log(`Generated HTML UX dossier at: ${outputPath}`);

// Compile to publication PDF via headless Chrome
const pdfPath = path.resolve('docs/AuraFinance_OS_User_Journey_UX_Design.pdf');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const cmd = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${outputPath}"`;
console.log('Compiling 24-page UX Journey PDF with Chrome headless...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`\n🎉 SUCCESS! Publication-grade UX PDF generated:\n--> ${pdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB, 24 Landscape A4 Pages)`);
} else {
  console.error('Failed to generate UX PDF');
}
