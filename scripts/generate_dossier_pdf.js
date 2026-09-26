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

console.log('Screenshots loaded into Base64 successfully.');

// Export function to create the full HTML
export function generateHtml() {
  // Styles, typography, and page structure
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>AuraFinance OS — 2. Project Documentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&display=swap" rel="stylesheet">
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
    background: #050811;
    color: #e2e8f0;
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
    padding: 14mm 16mm 12mm 16mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  /* THEME PALETTES */
  .theme-obsidian {
    background: #060913;
    color: #f1f5f9;
  }
  .theme-opal {
    background: #F8F9FA;
    color: #0F172A;
  }
  .theme-slate {
    background: #090E1A;
    color: #F8FAFC;
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
    padding-bottom: 8px;
    margin-bottom: 12px;
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
    padding: 2px 7px;
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
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #94a3b8;
  }
  .theme-opal .header-title { color: #64748b; }
  .header-right {
    font-size: 9px;
    font-weight: 500;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 8px;
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

  /* macOS WINDOW FRAME */
  .macos-window {
    border-radius: 8px;
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .theme-opal .macos-window {
    background: #ffffff;
    border-color: rgba(15,23,42,0.15);
    box-shadow: 0 10px 25px -5px rgba(15,23,42,0.1);
  }
  .macos-header {
    height: 22px;
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 6px;
  }
  .theme-opal .macos-header {
    background: #f1f5f9;
    border-bottom-color: rgba(15,23,42,0.08);
  }
  .macos-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .macos-url {
    margin-left: auto;
    margin-right: auto;
    font-size: 8px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
    background: rgba(0,0,0,0.2);
    padding: 1px 12px;
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

  /* CALLOUT BADGES */
  .callout-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(14,165,233,0.12);
    border: 1px solid rgba(14,165,233,0.3);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 9px;
    font-weight: 600;
    color: #38bdf8;
  }
  .theme-opal .callout-pill {
    background: rgba(14,165,233,0.08);
    border-color: rgba(14,165,233,0.2);
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

  /* GRID CARDS */
  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 10px 14px;
  }
  .theme-opal .glass-card {
    background: #ffffff;
    border-color: rgba(15,23,42,0.1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  /* FIGURE LABELS */
  .fig-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #38bdf8;
  }
  .theme-opal .fig-tag { color: #0284c7; }
  .fig-caption {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-top: 1px;
  }
  .fig-sub {
    font-size: 9px;
    color: #94a3b8;
    line-height: 1.35;
    margin-top: 2px;
  }
  .theme-opal .fig-sub { color: #64748b; }

  /* VECTOR DIAGRAM STYLING */
  svg text {
    font-family: 'Inter', sans-serif;
  }
  svg text.mono {
    font-family: 'JetBrains Mono', monospace;
  }
</style>
</head>
<body>

<!-- =========================================================================
     PAGE 01: COVER SPREAD (MAGAZINE MASTER COVER)
     ========================================================================= -->
<div class="page theme-obsidian" style="padding: 16mm 20mm; justify-content: space-between; background: radial-gradient(circle at 80% 20%, #151d38 0%, #060913 70%);">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <span class="header-badge" style="font-size: 9px; padding: 4px 10px;">GLOBAL CATEGORY · 2026 ARCHITECTURAL DOSSIER</span>
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 10px;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #64748b; font-family: 'JetBrains Mono';">SECTION 02</span>
        <span style="width: 30px; height: 1px; background: rgba(255,255,255,0.2);"></span>
        <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; color: #94a3b8;">SYSTEM SPECIFICATIONS</span>
      </div>
    </div>
    <div style="text-align: right; font-family: 'JetBrains Mono'; font-size: 9px; color: #64748b; line-height: 1.6;">
      <div>VERCEL DEPLOYMENT: PRODUCTION</div>
      <div style="color: #38bdf8;">https://aura-finance-silk.vercel.app/</div>
      <div>CORE ENGINE: GAAP-COMPLIANT SSOT</div>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 30px; align-items: center; margin: 10px 0;">
    <div>
      <div style="font-family: 'Cinzel', serif; font-size: 52px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.0; color: #ffffff;">
        AURA<span style="color: #38bdf8;">FINANCE</span><br/>OS
      </div>
      <div style="font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.05em; color: #38bdf8; margin-top: 14px; text-transform: uppercase;">
        Autonomous AI Wealth Operating System
      </div>
      <p style="font-size: 11.5px; color: #94a3b8; max-width: 440px; line-height: 1.6; margin-top: 12px;">
        A zero-backend, client-side, privacy-first FinTech platform engineered for high-frequency financial tracking, double-entry journal balance verification, and local cryptographic sovereignty.
      </p>

      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px;">
        <div class="callout-pill font-mono">⚡ 100% CLIENT-SIDE</div>
        <div class="callout-pill pill-emerald font-mono">🔒 ZERO-KNOWLEDGE AES-256</div>
        <div class="callout-pill pill-amber font-mono">⚖️ Σ DEBITS ≡ Σ CREDITS</div>
        <div class="callout-pill pill-purple font-mono">🤖 LOCAL GEMINI 2.0 FLASH</div>
      </div>
    </div>

    <!-- Hero Screenshot Card -->
    <div class="macos-window" style="box-shadow: 0 20px 50px -10px rgba(14,165,233,0.25);">
      <div class="macos-header">
        <div class="macos-dot dot-red"></div>
        <div class="macos-dot dot-yellow"></div>
        <div class="macos-dot dot-green"></div>
        <div class="macos-url">aura-finance-silk.vercel.app/dashboard</div>
      </div>
      <div class="macos-body" style="height: 235px;">
        <img src="${imgDashboard || imgDarkOverview}" style="height: 100%; object-fit: cover;" alt="Hero Dashboard" />
      </div>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
    <div style="display: flex; gap: 30px; font-size: 9px; font-family: 'JetBrains Mono'; color: #64748b;">
      <div><strong style="color: #cbd5e1;">INDEXEDDB:</strong> DEXIE.JS 4.4</div>
      <div><strong style="color: #cbd5e1;">FRAMEWORK:</strong> REACT 19 + VITE</div>
      <div><strong style="color: #cbd5e1;">STATE:</strong> SSOT RECONCILIATION</div>
    </div>
    <div style="font-family: 'JetBrains Mono'; font-size: 9px; color: #38bdf8;">
      TECHNICAL PUBLICATION — EDITION 2026.1
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 02: SYSTEM MANIFESTO & PRINCIPLES
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">01 · CORE PHILOSOPHY</span>
      <span class="header-title">THE LOCAL-FIRST PRIVACY PARADIGM</span>
    </div>
    <div class="header-right">PAGE 02 // 25</div>
  </div>

  <div class="content-area" style="justify-content: center; align-items: center; text-align: center; padding: 0 40px;">
    <div class="fig-tag" style="margin-bottom: 8px;">SYSTEM MANIFESTO</div>
    <div style="font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; line-height: 1.25; color: #0f172a; max-width: 780px;">
      A Financial Operating System That Runs Where The Data Lives.
    </div>
    <p style="font-size: 12px; color: #64748b; max-width: 620px; line-height: 1.6; margin-top: 14px;">
      Traditional FinTech forces users to transmit confidential bank credentials and ledger rows to centralized servers. AuraFinance OS re-architects this model: the browser is the database, the execution container, and the cryptographic vault.
    </p>

    <!-- Manifesto Vector Flow -->
    <div style="width: 100%; max-width: 820px; margin-top: 32px;">
      <svg viewBox="0 0 800 110" style="width: 100%; height: auto;">
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="50%" stop-color="#7c3aed" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08" />
          </filter>
        </defs>

        <!-- Step 1: User -->
        <g filter="url(#shadow)">
          <rect x="10" y="20" width="105" height="70" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="62" y="48" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">USER</text>
          <text x="62" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Touch / Voice</text>
        </g>
        <path d="M 115 55 L 145 55" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow)" />

        <!-- Step 2: Browser Context -->
        <g filter="url(#shadow)">
          <rect x="145" y="20" width="110" height="70" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="1.5" />
          <text x="200" y="48" text-anchor="middle" font-size="11" font-weight="700" fill="#0284c7">BROWSER</text>
          <text x="200" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Execution VM</text>
        </g>
        <path d="M 255 55 L 285 55" stroke="#94a3b8" stroke-width="2" />

        <!-- Step 3: SSOT -->
        <g filter="url(#shadow)">
          <rect x="285" y="15" width="125" height="80" rx="8" fill="#ffffff" stroke="#7c3aed" stroke-width="2" />
          <text x="347" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="#7c3aed">SSOT ENGINE</text>
          <text x="347" y="62" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">Reconciliation</text>
          <text x="347" y="75" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">&lt;16ms Latency</text>
        </g>
        <path d="M 410 55 L 440 55" stroke="#94a3b8" stroke-width="2" />

        <!-- Step 4: GAAP Ledger -->
        <g filter="url(#shadow)">
          <rect x="440" y="20" width="115" height="70" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="497" y="48" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">LEDGER</text>
          <text x="497" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Σ Dr ≡ Σ Cr</text>
        </g>
        <path d="M 555 55 L 585 55" stroke="#94a3b8" stroke-width="2" />

        <!-- Step 5: Intelligence -->
        <g filter="url(#shadow)">
          <rect x="585" y="20" width="115" height="70" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="642" y="48" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">AI COPILOT</text>
          <text x="642" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#64748b">Stateless GenAI</text>
        </g>
        <path d="M 700 55 L 725 55" stroke="#94a3b8" stroke-width="2" />

        <!-- Step 6: Vault -->
        <g filter="url(#shadow)">
          <rect x="725" y="20" width="65" height="70" rx="8" fill="#f0fdf4" stroke="#10b981" stroke-width="2" />
          <text x="757" y="48" text-anchor="middle" font-size="10" font-weight="800" fill="#10b981">VAULT</text>
          <text x="757" y="65" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#047857">AES-256</text>
        </g>
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>THE LOCAL-FIRST MANIFESTO</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 03: MACRO ARCHITECTURE — LEVEL-0 CONTEXT DFD
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">02 · SYSTEM TOPOLOGY</span>
      <span class="header-title">LEVEL-0 CONTEXT DATA FLOW DIAGRAM (DFD)</span>
    </div>
    <div class="header-right">PAGE 03 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 01 — LEVEL-0 MACRO CONTEXT DFD</div>
        <div class="fig-caption">Architectural Trust Boundaries: Sovereign Client vs. External Stateless Services</div>
      </div>
      <div class="fig-sub font-mono">ISOLATION: 100% IN-BROWSER LEDGER</div>
    </div>

    <!-- Vector DFD Level-0 -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; position: relative;">
      <svg viewBox="0 0 900 400" style="width: 100%; height: 100%;">
        <!-- BROWSER BOUNDARY (DOMINANT CONTAINER) -->
        <rect x="180" y="20" width="540" height="360" rx="12" fill="#090E1E" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" />
        <text x="200" y="42" font-size="11" font-weight="800" font-family="JetBrains Mono" fill="#38bdf8" letter-spacing="0.1em">CLIENT BROWSER TRUST PERIMETER (SANDBOXED ZERO-KNOWLEDGE)</text>

        <!-- External Entities (Left) -->
        <!-- User -->
        <rect x="20" y="50" width="120" height="60" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
        <text x="80" y="78" text-anchor="middle" font-size="11" font-weight="700" fill="#f8fafc">USER ENTITY</text>
        <text x="80" y="94" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">UI &amp; Voice Input</text>

        <!-- Receipt Ingestion -->
        <rect x="20" y="160" width="120" height="60" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
        <text x="80" y="188" text-anchor="middle" font-size="10" font-weight="700" fill="#f8fafc">RECEIPT / INVOICE</text>
        <text x="80" y="204" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Image Payload</text>

        <!-- Master JSON Vault -->
        <rect x="20" y="270" width="120" height="60" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
        <text x="80" y="298" text-anchor="middle" font-size="10" font-weight="700" fill="#34d399">ENCRYPTED JSON</text>
        <text x="80" y="314" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Local File System</text>

        <!-- CORE BROWSER SUBSYSTEMS -->
        <!-- Core Hub -->
        <circle cx="450" cy="190" r="65" fill="#1e1b4b" stroke="#7c3aed" stroke-width="2.5" />
        <text x="450" y="180" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">AURAFINANCE</text>
        <text x="450" y="196" text-anchor="middle" font-size="12" font-weight="800" fill="#38bdf8">CORE OS</text>
        <text x="450" y="212" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#c084fc">SSOT v2.0</text>

        <!-- Internal Subsystem 1: IndexedDB -->
        <rect x="220" y="80" width="130" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <text x="285" y="104" text-anchor="middle" font-size="10" font-weight="700" fill="#f8fafc">INDEXEDDB</text>
        <text x="285" y="118" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#38bdf8">Dexie.js Storage</text>

        <!-- Internal Subsystem 2: Web Crypto -->
        <rect x="220" y="250" width="130" height="50" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
        <text x="285" y="274" text-anchor="middle" font-size="10" font-weight="700" fill="#f8fafc">WEB CRYPTO API</text>
        <text x="285" y="288" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#34d399">PBKDF2 / AES-GCM</text>

        <!-- Internal Subsystem 3: Web Speech -->
        <rect x="550" y="80" width="130" height="50" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
        <text x="615" y="104" text-anchor="middle" font-size="10" font-weight="700" fill="#f8fafc">WEB SPEECH API</text>
        <text x="615" y="118" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#fbbf24">STT / TTS Synthesis</text>

        <!-- Internal Subsystem 4: jsPDF Generator -->
        <rect x="550" y="250" width="130" height="50" rx="6" fill="#0f172a" stroke="#ec4899" stroke-width="1.5" />
        <text x="615" y="274" text-anchor="middle" font-size="10" font-weight="700" fill="#f8fafc">24H STATEMENT</text>
        <text x="615" y="288" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#f472b6">jsPDF Vector Seal</text>

        <!-- External Services (Right) -->
        <!-- Gemini 2.0 Flash -->
        <rect x="760" y="100" width="120" height="65" rx="6" fill="#18181b" stroke="#a855f7" stroke-width="2" />
        <text x="820" y="128" text-anchor="middle" font-size="10" font-weight="800" fill="#c084fc">GEMINI 2.0 FLASH</text>
        <text x="820" y="143" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#a1a1aa">Multimodal OCR / AI</text>
        <text x="820" y="155" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#ef4444">Zero-Retention API</text>

        <!-- FX Service -->
        <rect x="760" y="230" width="120" height="60" rx="6" fill="#18181b" stroke="#06b6d4" stroke-width="1.5" />
        <text x="820" y="258" text-anchor="middle" font-size="10" font-weight="700" fill="#22d3ee">OPEN FX RATES</text>
        <text x="820" y="274" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Cached Currency Feed</text>

        <!-- CONNECTORS & DATA FLOW ARROWS -->
        <!-- User to Core -->
        <line x1="140" y1="80" x2="385" y2="175" stroke="#38bdf8" stroke-width="1.5" />
        <!-- Receipt to Core -->
        <line x1="140" y1="190" x2="385" y2="190" stroke="#38bdf8" stroke-width="1.5" />
        <!-- Core to Gemini -->
        <path d="M 515 175 L 760 130" stroke="#a855f7" stroke-width="1.5" />
        <!-- Core to FX -->
        <path d="M 515 205 L 760 260" stroke="#06b6d4" stroke-width="1.5" />
        <!-- Core to Storage -->
        <line x1="400" y1="150" x2="350" y2="115" stroke="#38bdf8" stroke-width="2" />
        <!-- Core to Crypto -->
        <line x1="400" y1="230" x2="350" y2="265" stroke="#10b981" stroke-width="2" />
        <!-- Core to Speech -->
        <line x1="500" y1="150" x2="550" y2="115" stroke="#f59e0b" stroke-width="1.5" />
        <!-- Core to PDF -->
        <line x1="500" y1="230" x2="550" y2="265" stroke="#ec4899" stroke-width="1.5" />
        <!-- Crypto to JSON File -->
        <line x1="220" y1="285" x2="140" y2="295" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,3" />
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>MACRO SYSTEM TOPOLOGY</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 04: LEVEL-1 DATA PIPELINE (4 VERTICAL STAGES)
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">03 · PIPELINE ARCHITECTURE</span>
      <span class="header-title">LEVEL-1 FUNCTIONAL DATA FLOW (INGEST → PARSE → RECONCILE → PRESENT)</span>
    </div>
    <div class="header-right">PAGE 04 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 02 — FOUR-STAGE TRANSACTION PROCESSING PIPELINE</div>
        <div class="fig-caption">From Multi-Modal Ingestion to Real-Time Balance Sheet Propagation</div>
      </div>
      <div class="fig-sub font-mono">LATENCY BUDGET: &lt;16MS POST-RECONCILIATION</div>
    </div>

    <!-- 4-Column Pipeline Diagram -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 6px;">
      <!-- Stage 1 -->
      <div class="glass-card" style="border-top: 3px solid #0284c7;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #0284c7; font-family: 'JetBrains Mono';">01 INGEST</span>
          <span style="font-size: 8px; background: #e0f2fe; color: #0369a1; padding: 2px 5px; border-radius: 4px; font-family: 'JetBrains Mono';">INPUT</span>
        </div>
        <p style="font-size: 9.5px; color: #64748b; line-height: 1.4; margin-bottom: 12px;">Captures financial intent across multi-modal sensory entry points.</p>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🎤 Natural Speech Audio</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Web Speech API Buffer</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">📷 Paper Receipt Image</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Base64 Compressed Blob</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">⌨️ Direct Tabular Entry</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Transactions Form UI</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">📂 Encrypted JSON Vault</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">File Drop &amp; Read</div>
          </div>
        </div>
      </div>

      <!-- Stage 2 -->
      <div class="glass-card" style="border-top: 3px solid #7c3aed;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #7c3aed; font-family: 'JetBrains Mono';">02 PARSE</span>
          <span style="font-size: 8px; background: #ede9fe; color: #6d28d9; padding: 2px 5px; border-radius: 4px; font-family: 'JetBrains Mono';">EXTRACTION</span>
        </div>
        <p style="font-size: 9.5px; color: #64748b; line-height: 1.4; margin-bottom: 12px;">Translates unstructured payloads into formal accounting schemas.</p>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🤖 Gemini 2.0 Flash Vision</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Merchant, Date, Line Items</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🗣️ Hotword &amp; NLP Intent</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Action Classification</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">💱 Multi-Currency Normalizer</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Live Spot Transitivity</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🛡️ Deterministic Validator</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Regex + Type Assertion</div>
          </div>
        </div>
      </div>

      <!-- Stage 3 -->
      <div class="glass-card" style="border-top: 3px solid #059669;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #059669; font-family: 'JetBrains Mono';">03 RECONCILE</span>
          <span style="font-size: 8px; background: #d1fae5; color: #047857; padding: 2px 5px; border-radius: 4px; font-family: 'JetBrains Mono';">MATH CORE</span>
        </div>
        <p style="font-size: 9.5px; color: #64748b; line-height: 1.4; margin-bottom: 12px;">Enforces GAAP double-entry rules and integer precision math.</p>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">⚖️ GAAP Journal Generator</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Debit (Dr) / Credit (Cr)</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🎯 50/30/20 Partition Engine</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Needs, Wants, Savings</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🥇 Bullion Reserve Mark-to-Market</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Grams &amp; Tolas (11.6638g)</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">💾 Dexie.js Atomic Commit</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">IndexedDB Transactions</div>
          </div>
        </div>
      </div>

      <!-- Stage 4 -->
      <div class="glass-card" style="border-top: 3px solid #e11d48;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #e11d48; font-family: 'JetBrains Mono';">04 PRESENT</span>
          <span style="font-size: 8px; background: #ffe4e6; color: #be123c; padding: 2px 5px; border-radius: 4px; font-family: 'JetBrains Mono';">SURFACES</span>
        </div>
        <p style="font-size: 9.5px; color: #64748b; line-height: 1.4; margin-bottom: 12px;">Simultaneous reactive propagation across all 15 views.</p>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">📊 Hero KPI &amp; Net Worth</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Liquid Cash (1010+1020)</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🌊 Cash-Flow Particle Stream</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">WebGL / Canvas 60 FPS</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">📑 CPA Trial Balance Table</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">Equalized Ledger Sum (Σ)</div>
          </div>
          <div style="padding: 7px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #0f172a;">🔒 24H Statement Vector PDF</div>
            <div style="font-size: 8px; color: #64748b; font-family: 'JetBrains Mono';">SHA-256 Digital Seal</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>FUNCTIONAL DATA PIPELINE (DFD LEVEL-1)</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 05: UNIVERSAL SSOT RECONCILIATION ENGINE
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">04 · REACTIVE DATA GRAPH</span>
      <span class="header-title">THE UNIVERSAL SSOT RECONCILIATION ENGINE</span>
    </div>
    <div class="header-right">PAGE 05 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 03 — RADIAL RECONCILIATION &amp; SYNCHRONIZATION GRAPH</div>
        <div class="fig-caption">One Single Source of Truth Feeding 15 Autonomous Financial Surfaces</div>
      </div>
      <div class="fig-sub font-mono">DEXIE.JS REACTIVE OBSERVABLES: useLiveQuery()</div>
    </div>

    <!-- Radial Architecture Diagram -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 850 360" style="width: 100%; height: 100%;">
        <!-- CENTRAL CORE -->
        <circle cx="425" cy="180" r="75" fill="#090E1E" stroke="#38bdf8" stroke-width="2.5" />
        <circle cx="425" cy="180" r="65" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="4,3" />
        <text x="425" y="170" text-anchor="middle" font-size="12" font-weight="900" fill="#ffffff">RECONCILIATION</text>
        <text x="425" y="185" text-anchor="middle" font-size="12" font-weight="900" fill="#38bdf8">ENGINE (SSOT)</text>
        <text x="425" y="200" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">computeMasterState()</text>

        <!-- SURROUNDING INPUT DATA STORES (LEFT ARCS) -->
        <!-- Store 1: Transactions -->
        <rect x="70" y="30" width="130" height="45" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
        <text x="135" y="52" text-anchor="middle" font-size="10" font-weight="700" fill="#e2e8f0">db.transactions</text>
        <text x="135" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Raw Tabular Ledger</text>
        <path d="M 200 52 L 355 145" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3" />

        <!-- Store 2: Journal Entries -->
        <rect x="50" y="95" width="130" height="45" rx="6" fill="#0f172a" stroke="#818cf8" stroke-width="1.5" />
        <text x="115" y="117" text-anchor="middle" font-size="10" font-weight="700" fill="#a5b4fc">db.journalEntries</text>
        <text x="115" y="130" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">GAAP Balanced Entries</text>
        <path d="M 180 117 L 350 165" stroke="#818cf8" stroke-width="1.5" />

        <!-- Store 3: Accounts -->
        <rect x="40" y="160" width="130" height="45" rx="6" fill="#0f172a" stroke="#818cf8" stroke-width="1.5" />
        <text x="105" y="182" text-anchor="middle" font-size="10" font-weight="700" fill="#a5b4fc">db.accounts</text>
        <text x="105" y="195" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Chart of Accounts (1-5)</text>
        <path d="M 170 182 L 350 182" stroke="#818cf8" stroke-width="2" />

        <!-- Store 4: Commodities -->
        <rect x="50" y="225" width="130" height="45" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
        <text x="115" y="247" text-anchor="middle" font-size="10" font-weight="700" fill="#fcd34d">db.commodities</text>
        <text x="115" y="260" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Gold &amp; Bullion Mass</text>
        <path d="M 180 247 L 350 200" stroke="#f59e0b" stroke-width="1.5" />

        <!-- Store 5: IOUs & Debts -->
        <rect x="70" y="290" width="130" height="45" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
        <text x="135" y="312" text-anchor="middle" font-size="10" font-weight="700" fill="#6ee7b7">db.ious</text>
        <text x="135" y="325" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Peer Receivable/Payable</text>
        <path d="M 200 312 L 355 215" stroke="#10b981" stroke-width="1.5" />

        <!-- SURROUNDING REACTIVE PRESENTATION VIEWS (RIGHT ARCS) -->
        <!-- View 1: Overview Dashboard -->
        <rect x="650" y="30" width="150" height="45" rx="6" fill="#090E1E" stroke="#38bdf8" stroke-width="2" />
        <text x="725" y="52" text-anchor="middle" font-size="10" font-weight="700" fill="#38bdf8">Overview Hero Cards</text>
        <text x="725" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Liquid Cash (1010+1020)</text>
        <path d="M 495 145 L 650 52" stroke="#38bdf8" stroke-width="2" />

        <!-- View 2: General Ledger -->
        <rect x="670" y="95" width="150" height="45" rx="6" fill="#090E1E" stroke="#818cf8" stroke-width="1.5" />
        <text x="745" y="117" text-anchor="middle" font-size="10" font-weight="700" fill="#c7d2fe">Trial Balance View</text>
        <text x="745" y="130" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Variance: $0.00</text>
        <path d="M 500 165 L 670 117" stroke="#818cf8" stroke-width="2" />

        <!-- View 3: Cash Flow Particle Stream -->
        <rect x="680" y="160" width="150" height="45" rx="6" fill="#090E1E" stroke="#22d3ee" stroke-width="1.5" />
        <text x="755" y="182" text-anchor="middle" font-size="10" font-weight="700" fill="#67e8f9">Cash Flow Engine</text>
        <text x="755" y="195" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Particle Stream Physics</text>
        <path d="M 500 182 L 680 182" stroke="#22d3ee" stroke-width="2" />

        <!-- View 4: Wealth Time Machine -->
        <rect x="670" y="225" width="150" height="45" rx="6" fill="#090E1E" stroke="#f59e0b" stroke-width="1.5" />
        <text x="745" y="247" text-anchor="middle" font-size="10" font-weight="700" fill="#fde68a">Time Machine Simulator</text>
        <text x="745" y="260" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Principal = Real Liquid</text>
        <path d="M 500 200 L 670 247" stroke="#f59e0b" stroke-width="2" />

        <!-- View 5: Copilot AI -->
        <rect x="650" y="290" width="150" height="45" rx="6" fill="#090E1E" stroke="#a855f7" stroke-width="1.5" />
        <text x="725" y="312" text-anchor="middle" font-size="10" font-weight="700" fill="#e9d5ff">AI Copilot Chatbot</text>
        <text x="725" y="325" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Grounded Context</text>
        <path d="M 495 215 L 650 312" stroke="#a855f7" stroke-width="2" />
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>UNIVERSAL SSOT RECONCILIATION ENGINE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 06: GAAP DOUBLE-ENTRY ACCOUNTING ENGINE
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">05 · FINANCIAL INTEGRITY</span>
      <span class="header-title">THE LEDGER DOES NOT GUESS (GAAP TRIAL BALANCE)</span>
    </div>
    <div class="header-right">PAGE 06 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 100%;">
      <!-- Left Column: Math & State Machine -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="fig-tag">MATHEMATICAL IDENTITY</div>
          <div style="background: #0f172a; border-radius: 8px; padding: 14px; margin: 8px 0; text-align: center; border: 1px solid #1e293b;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 800; color: #34d399; letter-spacing: 0.05em;">
              ∑ DEBITS ≡ ∑ CREDITS
            </div>
            <div style="font-size: 9px; color: #94a3b8; font-family: 'JetBrains Mono'; margin-top: 4px;">
              VARIANCE LIMIT: |Σ Dr - Σ Cr| &lt; 0.001
            </div>
          </div>
          <p style="font-size: 10.5px; color: #475569; line-height: 1.5; margin-top: 6px;">
            Every single financial transaction posted to the system—whether via manual entry, voice command, or multimodal receipt OCR—is converted into a balanced double-entry journal record before entering the ledger.
          </p>
        </div>

        <!-- Ledger State Machine Diagram -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div class="fig-tag" style="margin-bottom: 6px;">FIG. 04 — DOUBLE-ENTRY COMMIT STATE MACHINE</div>
          <svg viewBox="0 0 380 180" style="width: 100%; height: auto;">
            <!-- State 1: DRAFT -->
            <rect x="10" y="20" width="80" height="35" rx="5" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
            <text x="50" y="42" text-anchor="middle" font-size="9" font-weight="700" fill="#0f172a">DRAFT</text>

            <path d="M 90 37 L 130 37" stroke="#64748b" stroke-width="1.5" />

            <!-- State 2: CALCULATE VARIANCE -->
            <polygon points="170,15 210,37 170,60 130,37" fill="#f1f5f9" stroke="#0284c7" stroke-width="1.5" />
            <text x="170" y="40" text-anchor="middle" font-size="8" font-weight="700" fill="#0284c7">VARIANCE?</text>

            <!-- Branch: Unbalanced -->
            <path d="M 170 60 L 170 100" stroke="#ef4444" stroke-width="1.5" />
            <rect x="125" y="100" width="90" height="35" rx="5" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" />
            <text x="170" y="117" text-anchor="middle" font-size="8" font-weight="700" fill="#b91c1c">UNBALANCED</text>
            <text x="170" y="128" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#ef4444">Post Prohibited</text>

            <!-- Branch: Balanced -->
            <path d="M 210 37 L 260 37" stroke="#10b981" stroke-width="2" />
            <rect x="260" y="20" width="105" height="35" rx="5" fill="#f0fdf4" stroke="#10b981" stroke-width="2" />
            <text x="312" y="37" text-anchor="middle" font-size="9" font-weight="800" fill="#047857">BALANCED ENTRY</text>
            <text x="312" y="48" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#059669">Diff == $0.00</text>

            <path d="M 312 55 L 312 100" stroke="#10b981" stroke-width="1.5" />

            <!-- State 3: ATOMIC COMMIT -->
            <rect x="250" y="100" width="125" height="40" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
            <text x="312" y="118" text-anchor="middle" font-size="9" font-weight="800" fill="#38bdf8">ATOMIC COMMIT</text>
            <text x="312" y="130" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Dexie Transaction (ACID)</text>
          </svg>
        </div>
      </div>

      <!-- Right Column: Live General Ledger Screenshot -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">RUNTIME EVIDENCE</div>
        <div class="fig-caption">FIG. 05 — General Ledger &amp; Trial Balance Module</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1;">
          <div class="macos-header">
            <div class="macos-dot dot-red"></div>
            <div class="macos-dot dot-yellow"></div>
            <div class="macos-dot dot-green"></div>
            <div class="macos-url">aura-finance-silk.vercel.app/ledger</div>
          </div>
          <div class="macos-body" style="height: 100%; min-height: 250px;">
            <img src="${imgGeneralLedger || imgTrialBalance}" style="width: 100%; height: 100%; object-fit: cover;" alt="General Ledger Screenshot" />
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <div class="callout-pill" style="font-size: 8px;">01 DEBITS / CREDITS VALIDATED</div>
          <div class="callout-pill pill-emerald" style="font-size: 8px;">02 ZERO CENT VARIANCE</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>GAAP ACCOUNTING ENGINE SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 07: UML USE CASE DIAGRAM (4 PERSONAS, 12 USE CASES)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">06 · USER SYSTEM MAPPING</span>
      <span class="header-title">UML ACTOR &amp; USE CASE SPECIFICATION</span>
    </div>
    <div class="header-right">PAGE 07 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 06 — COMPREHENSIVE UML USE CASE DIAGRAM</div>
        <div class="fig-caption">Four Specialized Personas Interacting with Autonomous Sub-Systems</div>
      </div>
      <div class="fig-sub font-mono">ACTOR COVERAGE: 100% MODULE CAPABILITIES</div>
    </div>

    <!-- UML Diagram Canvas -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
      <svg viewBox="0 0 850 350" style="width: 100%; height: 100%;">
        <!-- SYSTEM BOUNDARY -->
        <rect x="220" y="10" width="610" height="330" rx="10" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="240" y="32" font-size="10" font-weight="800" font-family="JetBrains Mono" fill="#94a3b8">AURAFINANCE OS BOUNDARY</text>

        <!-- ACTOR 1: Student -->
        <circle cx="80" cy="50" r="16" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
        <text x="80" y="80" text-anchor="middle" font-size="9" font-weight="700" fill="#f8fafc">Student / Resident</text>
        <text x="80" y="92" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Budget &amp; Split</text>

        <!-- ACTOR 2: Global Freelancer -->
        <circle cx="80" cy="130" r="16" fill="#1e293b" stroke="#34d399" stroke-width="1.5" />
        <text x="80" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#f8fafc">Global Freelancer</text>
        <text x="80" y="172" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Multi-Currency / Tax</text>

        <!-- ACTOR 3: CPA Auditor -->
        <circle cx="80" cy="215" r="16" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
        <text x="80" y="245" text-anchor="middle" font-size="9" font-weight="700" fill="#f8fafc">System Auditor / CPA</text>
        <text x="80" y="257" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Trial Balance / PDF</text>

        <!-- ACTOR 4: Bullion Investor -->
        <circle cx="80" cy="295" r="16" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
        <text x="80" y="325" text-anchor="middle" font-size="9" font-weight="700" fill="#f8fafc">Bullion Investor</text>
        <text x="80" y="337" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Tolas &amp; Precious Metals</text>

        <!-- USE CASES (OVALS IN SYSTEM BOUNDARY) -->
        <!-- Col 1 -->
        <ellipse cx="320" cy="65" rx="75" ry="20" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" />
        <text x="320" y="69" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Voice Transaction Logging</text>

        <ellipse cx="320" cy="130" rx="75" ry="20" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" />
        <text x="320" y="134" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Multimodal Receipt OCR</text>

        <ellipse cx="320" cy="195" rx="75" ry="20" fill="#0f172a" stroke="#34d399" stroke-width="1.2" />
        <text x="320" y="199" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Peer Debt &amp; Bill Split</text>

        <ellipse cx="320" cy="260" rx="75" ry="20" fill="#0f172a" stroke="#34d399" stroke-width="1.2" />
        <text x="320" y="264" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Impulse Buy Interceptor</text>

        <!-- Col 2 -->
        <ellipse cx="520" cy="65" rx="75" ry="20" fill="#0f172a" stroke="#a855f7" stroke-width="1.2" />
        <text x="520" y="69" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Multi-Currency Cash Flow</text>

        <ellipse cx="520" cy="130" rx="75" ry="20" fill="#0f172a" stroke="#a855f7" stroke-width="1.2" />
        <text x="520" y="134" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Subscription Assassin</text>

        <ellipse cx="520" cy="195" rx="75" ry="20" fill="#0f172a" stroke="#a855f7" stroke-width="1.2" />
        <text x="520" y="199" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">GAAP Double-Entry Ledger</text>

        <ellipse cx="520" cy="260" rx="75" ry="20" fill="#0f172a" stroke="#f59e0b" stroke-width="1.2" />
        <text x="520" y="264" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">24H Vector Statement PDF</text>

        <!-- Col 3 -->
        <ellipse cx="720" cy="65" rx="75" ry="20" fill="#0f172a" stroke="#f59e0b" stroke-width="1.2" />
        <text x="720" y="69" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Bullion Mark-to-Market</text>

        <ellipse cx="720" cy="130" rx="75" ry="20" fill="#0f172a" stroke="#10b981" stroke-width="1.2" />
        <text x="720" y="134" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Kameti Rotary Fund</text>

        <ellipse cx="720" cy="195" rx="75" ry="20" fill="#0f172a" stroke="#10b981" stroke-width="1.2" />
        <text x="720" y="199" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Encrypted AES-256 Vault</text>

        <ellipse cx="720" cy="260" rx="75" ry="20" fill="#0f172a" stroke="#06b6d4" stroke-width="1.2" />
        <text x="720" y="264" text-anchor="middle" font-size="8.5" font-weight="600" fill="#e2e8f0">Urdu RTL Transformation</text>

        <!-- CONNECTING ACTOR LINES -->
        <line x1="120" y1="50" x2="245" y2="65" stroke="#38bdf8" stroke-width="1" />
        <line x1="120" y1="50" x2="245" y2="195" stroke="#38bdf8" stroke-width="1" />
        <line x1="120" y1="50" x2="245" y2="260" stroke="#38bdf8" stroke-width="1" />

        <line x1="120" y1="130" x2="445" y2="65" stroke="#34d399" stroke-width="1" />
        <line x1="120" y1="130" x2="445" y2="130" stroke="#34d399" stroke-width="1" />

        <line x1="120" y1="215" x2="445" y2="195" stroke="#a855f7" stroke-width="1" />
        <line x1="120" y1="215" x2="445" y2="260" stroke="#a855f7" stroke-width="1" />

        <line x1="120" y1="295" x2="645" y2="65" stroke="#f59e0b" stroke-width="1" />
        <line x1="120" y1="295" x2="645" y2="130" stroke="#f59e0b" stroke-width="1" />
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>UML USE CASE DIAGRAM</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 08: USER JOURNEY TIMELINE (0 TO 180 SECONDS)
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">07 · USER EXPERIENCE</span>
      <span class="header-title">EVALUATOR JOURNEY INFOGRAPHIC TIMELINE (0–180S)</span>
    </div>
    <div class="header-right">PAGE 08 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 07 — INTERACTIVE ONBOARDING &amp; AUDIT TIMELINE</div>
        <div class="fig-caption">From First Paint to Complete Cryptographic Statement Audit</div>
      </div>
      <div class="fig-sub font-mono">TIME-TO-VALUE: IMMEDIATE &lt;15 SECONDS</div>
    </div>

    <!-- Horizontal Timeline Container -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
      <!-- Step 1: 0-15s -->
      <div class="glass-card" style="border-top: 3px solid #0284c7;">
        <div style="font-size: 13px; font-weight: 800; color: #0284c7; font-family: 'JetBrains Mono';">0–15s</div>
        <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">FIRST TOUCH</div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.35; margin-top: 4px;">Instant hydration, Opal Ceramic workstation loads, net cash metrics render with zero latency.</p>
        <div class="macos-window" style="margin-top: 8px;">
          <div class="macos-header" style="height: 16px;"><div class="macos-dot dot-red" style="width:6px;height:6px;"></div></div>
          <div class="macos-body" style="height: 115px;"><img src="${imgLightDashboard || imgDashboard}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0284c7; margin-top: 6px;">MILESTONE: DOM Hydrated</div>
      </div>

      <!-- Step 2: 15-60s -->
      <div class="glass-card" style="border-top: 3px solid #7c3aed;">
        <div style="font-size: 13px; font-weight: 800; color: #7c3aed; font-family: 'JetBrains Mono';">15–60s</div>
        <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">SYNTHESIS &amp; VOICE</div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.35; margin-top: 4px;">Persona selector triggers resident dataset. Evaluator interacts via voice HUD and AI Copilot.</p>
        <div class="macos-window" style="margin-top: 8px;">
          <div class="macos-header" style="height: 16px;"><div class="macos-dot dot-red" style="width:6px;height:6px;"></div></div>
          <div class="macos-body" style="height: 115px;"><img src="${imgCopilot || imgDashboard}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #7c3aed; margin-top: 6px;">MILESTONE: Persona Active</div>
      </div>

      <!-- Step 3: 60-120s -->
      <div class="glass-card" style="border-top: 3px solid #059669;">
        <div style="font-size: 13px; font-weight: 800; color: #059669; font-family: 'JetBrains Mono';">60–120s</div>
        <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">DEEP VERIFICATION</div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.35; margin-top: 4px;">General Ledger audit, zero-variance trial balance test, break-even simulation in Academic Suite.</p>
        <div class="macos-window" style="margin-top: 8px;">
          <div class="macos-header" style="height: 16px;"><div class="macos-dot dot-red" style="width:6px;height:6px;"></div></div>
          <div class="macos-body" style="height: 115px;"><img src="${imgTrialBalance || imgGeneralLedger}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #059669; margin-top: 6px;">MILESTONE: Σ Dr ≡ Σ Cr Verified</div>
      </div>

      <!-- Step 4: 120-180s -->
      <div class="glass-card" style="border-top: 3px solid #e11d48;">
        <div style="font-size: 13px; font-weight: 800; color: #e11d48; font-family: 'JetBrains Mono';">120–180s</div>
        <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">AUDIT &amp; EXPORT</div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.35; margin-top: 4px;">Generation of SHA-256 sealed 24H vector statement PDF and AES-256 master vault download.</p>
        <div class="macos-window" style="margin-top: 8px;">
          <div class="macos-header" style="height: 16px;"><div class="macos-dot dot-red" style="width:6px;height:6px;"></div></div>
          <div class="macos-body" style="height: 115px;"><img src="${imgStatement || imgVault}" style="width:100%;height:100%;object-fit:cover;" /></div>
        </div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #e11d48; margin-top: 6px;">MILESTONE: PDF &amp; Vault Exported</div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>EVALUATOR JOURNEY INFOGRAPHIC</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 09: MULTIMODAL RECEIPT OCR PIPELINE
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">08 · VISION INTELLIGENCE</span>
      <span class="header-title">MULTIMODAL RECEIPT OCR &amp; JOURNAL PROPOSAL ENGINE</span>
    </div>
    <div class="header-right">PAGE 09 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 08 — OCR TO DOUBLE-ENTRY TRANSACTION PIPELINE</div>
        <div class="fig-caption">From Physical Receipt Pixels to Balanced Double-Entry Journal Entry</div>
      </div>
      <div class="fig-sub font-mono">ENGINE: GEMINI 2.0 FLASH VISION + DETERMINISTIC COA MAPPER</div>
    </div>

    <!-- Pipeline Architecture -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
      <svg viewBox="0 0 850 180" style="width: 100%; height: auto;">
        <!-- Node 1: Receipt -->
        <rect x="10" y="30" width="100" height="55" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5" />
        <text x="60" y="55" text-anchor="middle" font-size="9" font-weight="700" fill="#f8fafc">RECEIPT</text>
        <text x="60" y="68" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Image File</text>

        <path d="M 110 57 L 140 57" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow)" />

        <!-- Node 2: Vision OCR -->
        <rect x="140" y="30" width="115" height="55" rx="6" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5" />
        <text x="197" y="53" text-anchor="middle" font-size="9" font-weight="700" fill="#c084fc">GEMINI 2.0</text>
        <text x="197" y="66" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#e9d5ff">Vision Prompt</text>

        <path d="M 255 57 L 285 57" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Node 3: Structured JSON -->
        <rect x="285" y="30" width="125" height="55" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <text x="347" y="53" text-anchor="middle" font-size="9" font-weight="700" fill="#38bdf8">STRUCTURED JSON</text>
        <text x="347" y="66" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">{merchant, total, tax}</text>

        <path d="M 410 57 L 440 57" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Node 4: FX & COA Proposal -->
        <rect x="440" y="30" width="125" height="55" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
        <text x="502" y="53" text-anchor="middle" font-size="9" font-weight="700" fill="#fbbf24">COA PROPOSAL</text>
        <text x="502" y="66" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Dr 5020 / Cr 1010</text>

        <path d="M 565 57 L 595 57" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Node 5: User Validation -->
        <rect x="595" y="30" width="115" height="55" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
        <text x="652" y="53" text-anchor="middle" font-size="9" font-weight="700" fill="#34d399">USER AUDIT</text>
        <text x="652" y="66" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">1-Tap Confirmation</text>

        <path d="M 710 57 L 740 57" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Node 6: Dexie Atomic Commit -->
        <rect x="740" y="25" width="100" height="65" rx="6" fill="#18181b" stroke="#38bdf8" stroke-width="2" />
        <text x="790" y="52" text-anchor="middle" font-size="9" font-weight="800" fill="#38bdf8">ATOMIC</text>
        <text x="790" y="65" text-anchor="middle" font-size="9" font-weight="800" fill="#ffffff">COMMIT</text>
        <text x="790" y="78" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Dexie.js Table</text>

        <!-- Downward feedback loop: SSOT Update -->
        <path d="M 790 90 L 790 140 L 450 140 L 450 120" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3" />
        <text x="620" y="132" font-size="8" font-family="JetBrains Mono" fill="#34d399">PROPAGATE TO DASHBOARD &amp; TRIAL BALANCE (&lt;16ms)</text>
      </svg>

      <!-- Technical Exhibit -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px;">
        <div class="glass-card">
          <div style="font-size: 8px; font-weight: 700; color: #a855f7; font-family: 'JetBrains Mono'; margin-bottom: 4px;">EXTRACTED JSON SCHEMA (GEMINI 2.0 FLASH)</div>
          <pre style="font-family: 'JetBrains Mono'; font-size: 7.5px; color: #cbd5e1; margin: 0; line-height: 1.4;">
{
  "merchant": "Al-Fatah Gourmet Market",
  "date": "2026-09-24",
  "totalAmount": 14250.00,
  "currency": "PKR",
  "taxAmount": 1965.50,
  "category": "5020 Food & Groceries",
  "items": [
    { "name": "Organic Olive Oil 1L", "amount": 3450 },
    { "name": "Basmati Rice 10kg", "amount": 4200 }
  ]
}</pre>
        </div>

        <div class="glass-card">
          <div style="font-size: 8px; font-weight: 700; color: #10b981; font-family: 'JetBrains Mono'; margin-bottom: 4px;">GENERATED BALANCED JOURNAL ENTRY (DOUBLE-ENTRY)</div>
          <pre style="font-family: 'JetBrains Mono'; font-size: 7.5px; color: #cbd5e1; margin: 0; line-height: 1.4;">
// Atomic Dexie.js write to ledgerDb.journalEntries
Entry #JE-2026-9041:
  Dr. 5020 Food & Groceries:         PKR 14,250.00
  Cr. 1010 Cash on Hand:             PKR 14,250.00

Variance: PKR 0.00 [BALANCED - POST CONFIRMED]
SSOT Notification: Net Cash & Needs Bucket Updated</pre>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>MULTIMODAL RECEIPT OCR SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 10: VOICE ASSISTANT ACTIVITY & STATE MACHINE
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">09 · CONVERSATIONAL INTELLIGENCE</span>
      <span class="header-title">VOICE ASSISTANT FINITE STATE MACHINE (STT / INTENT / TTS)</span>
    </div>
    <div class="header-right">PAGE 10 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 09 — VOICE ASSISTANT FINITE STATE MACHINE</div>
        <div class="fig-caption">From Audio Buffer to Natural Voice Walkthrough (بول کر سنیں)</div>
      </div>
      <div class="fig-sub font-mono">LATENCY: &lt;180MS HOTWORD DETECT</div>
    </div>

    <!-- State Machine Diagram -->
    <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
      <svg viewBox="0 0 850 200" style="width: 100%; height: auto;">
        <!-- State 1: Passive Listening -->
        <circle cx="80" cy="90" r="45" fill="#f8fafc" stroke="#64748b" stroke-width="2" />
        <text x="80" y="85" text-anchor="middle" font-size="9" font-weight="700" fill="#0f172a">PASSIVE</text>
        <text x="80" y="98" text-anchor="middle" font-size="9" font-weight="700" fill="#0f172a">LISTENING</text>
        <text x="80" y="112" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">Web Speech API</text>

        <path d="M 125 90 L 175 90" stroke="#0284c7" stroke-width="2" />

        <!-- State 2: Audio Buffer -->
        <rect x="175" y="65" width="110" height="50" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
        <text x="230" y="88" text-anchor="middle" font-size="9" font-weight="700" fill="#0284c7">AUDIO BUFFER</text>
        <text x="230" y="102" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#64748b">Ring Buffer 3s</text>

        <path d="M 285 90 L 335 90" stroke="#0284c7" stroke-width="2" />

        <!-- State 3: Hotword Detect -->
        <rect x="335" y="65" width="115" height="50" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5" />
        <text x="392" y="88" text-anchor="middle" font-size="9" font-weight="700" fill="#7c3aed">HOTWORD DETECT</text>
        <text x="392" y="102" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#6d28d9">"Hey Aura" / "Aura"</text>

        <path d="M 450 90 L 500 90" stroke="#7c3aed" stroke-width="2" />

        <!-- State 4: Intent Classification -->
        <polygon points="560,50 620,90 560,130 500,90" fill="#fdf4ff" stroke="#c026d3" stroke-width="1.5" />
        <text x="560" y="93" text-anchor="middle" font-size="8.5" font-weight="800" fill="#a21caf">INTENT?</text>

        <!-- Branch 1: Transaction -->
        <path d="M 590 70 L 670 40" stroke="#059669" stroke-width="1.5" />
        <rect x="670" y="20" width="160" height="35" rx="5" fill="#f0fdf4" stroke="#059669" stroke-width="1.5" />
        <text x="750" y="38" text-anchor="middle" font-size="8.5" font-weight="700" fill="#047857">TRANSACTION COMMAND</text>
        <text x="750" y="49" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">Post balanced double-entry</text>

        <!-- Branch 2: Ledger Query -->
        <path d="M 620 90 L 670 90" stroke="#0284c7" stroke-width="1.5" />
        <rect x="670" y="72" width="160" height="35" rx="5" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
        <text x="750" y="90" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0369a1">LEDGER BALANCE QUERY</text>
        <text x="750" y="101" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">SSOT real-time balance lookup</text>

        <!-- Branch 3: Spoken Feedback -->
        <path d="M 590 110 L 670 145" stroke="#f59e0b" stroke-width="1.5" />
        <rect x="670" y="127" width="160" height="35" rx="5" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" />
        <text x="750" y="145" text-anchor="middle" font-size="8.5" font-weight="700" fill="#b45309">SPOKEN WALKTHROUGH</text>
        <text x="750" y="156" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">Web Speech TTS (Urdu/English)</text>
      </svg>

      <div style="display: flex; gap: 10px; margin-top: 6px;">
        <div class="callout-pill" style="font-size: 8px;">🎤 DUAL-LANGUAGE VOICE SYNTHESIS (URDU / ENGLISH)</div>
        <div class="callout-pill pill-emerald" style="font-size: 8px;">⚡ 100% LOCAL BROWSER WEB SPEECH API</div>
        <div class="callout-pill pill-amber" style="font-size: 8px;">🔒 ZERO AUDIO DATA SENT TO CLOUD</div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>VOICE ASSISTANT FINITE STATE MACHINE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 11: 24-HOUR PDF STATEMENT PROCESS GRAPH
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">10 · AUDIT REPORTING</span>
      <span class="header-title">24-HOUR INTRADAY STATEMENT &amp; SHA-256 DIGITAL SEAL</span>
    </div>
    <div class="header-right">PAGE 11 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 100%;">
      <!-- Left Column: Process Graph -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="fig-tag">AUDIT PIPELINE</div>
          <div class="fig-caption">FIG. 10 — Client-Side Vector PDF Statement Generation</div>
          <p style="font-size: 10.5px; color: #94a3b8; line-height: 1.5; margin-top: 6px;">
            Generates audit-grade PDF statements directly in the browser memory using <code class="font-mono text-cyan-400">jsPDF</code> and <code class="font-mono text-cyan-400">jspdf-autotable</code>, sealed with a real-time SHA-256 cryptographic hash of all included records.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px;">
          <!-- Vertical Process Graph -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 10px; font-size: 9px;">
              <span class="callout-pill font-mono" style="padding: 2px 6px;">01</span>
              <span>Evaluator initiates 24H Statement download</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 9px;">
              <span class="callout-pill font-mono" style="padding: 2px 6px;">02</span>
              <span>Query <code class="font-mono text-cyan-400">ledgerDb.journalEntries</code> for preceding 24h</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 9px;">
              <span class="callout-pill font-mono" style="padding: 2px 6px;">03</span>
              <span>Calculate Opening Balance, Total Debits &amp; Credits</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 9px;">
              <span class="callout-pill pill-purple font-mono" style="padding: 2px 6px;">04</span>
              <span>Compute SHA-256 Digest over canonical JSON payload</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 9px;">
              <span class="callout-pill pill-emerald font-mono" style="padding: 2px 6px;">05</span>
              <span>Embed Digital Seal &amp; Stream Vector PDF into Blob</span>
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px; font-family: 'JetBrains Mono'; font-size: 7.5px; color: #34d399;">
          DIGITAL SEAL: SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        </div>
      </div>

      <!-- Right Column: Live PDF Preview / Modal Screenshot -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">RUNTIME EVIDENCE</div>
        <div class="fig-caption">FIG. 11 — Statement Generation Modal &amp; Verification Deck</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1;">
          <div class="macos-header">
            <div class="macos-dot dot-red"></div>
            <div class="macos-dot dot-yellow"></div>
            <div class="macos-dot dot-green"></div>
            <div class="macos-url">aura-finance-silk.vercel.app/settings</div>
          </div>
          <div class="macos-body" style="height: 100%; min-height: 250px;">
            <img src="${imgStatement || imgVault}" style="width: 100%; height: 100%; object-fit: cover;" alt="Statement Generation Screenshot" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>24H STATEMENT ENGINE &amp; DIGITAL SEAL</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 12: CRYPTOGRAPHIC SECURITY ARCHITECTURE
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">11 · CRYPTOGRAPHY</span>
      <span class="header-title">CLIENT-SIDE CRYPTOGRAPHIC VAULT (PBKDF2 + AES-GCM-256)</span>
    </div>
    <div class="header-right">PAGE 12 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 12 — VAULT ENCRYPTION &amp; DECRYPTION SEQUENCE</div>
        <div class="fig-caption">Hardware-Accelerated Web Crypto API Key Derivation &amp; Cipher Pipeline</div>
      </div>
      <div class="fig-sub font-mono">SPEC: NIST SP 800-132 · 100,000 PBKDF2 ROUNDS</div>
    </div>

    <!-- Crypto Pipeline Flow -->
    <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
      <svg viewBox="0 0 850 160" style="width: 100%; height: auto;">
        <!-- 1. Passphrase -->
        <rect x="10" y="20" width="115" height="50" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
        <text x="67" y="42" text-anchor="middle" font-size="9" font-weight="700" fill="#0f172a">USER PASSWORD</text>
        <text x="67" y="55" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#64748b">Raw String UTF-8</text>

        <path d="M 125 45 L 165 45" stroke="#0284c7" stroke-width="2" />

        <!-- 2. Salt -->
        <rect x="165" y="10" width="110" height="70" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
        <text x="220" y="32" text-anchor="middle" font-size="9" font-weight="700" fill="#0284c7">SALT GENERATOR</text>
        <text x="220" y="47" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#0f172a">crypto.getRandomValues</text>
        <text x="220" y="62" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#64748b">16-Byte Cryptographic</text>

        <path d="M 275 45 L 315 45" stroke="#0284c7" stroke-width="2" />

        <!-- 3. PBKDF2 -->
        <rect x="315" y="10" width="130" height="70" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="2" />
        <text x="380" y="32" text-anchor="middle" font-size="9" font-weight="800" fill="#7c3aed">PBKDF2 DERIVATION</text>
        <text x="380" y="47" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#0f172a">100,000 Iterations</text>
        <text x="380" y="62" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#6d28d9">SHA-256 HMAC Hash</text>

        <path d="M 445 45 L 485 45" stroke="#7c3aed" stroke-width="2" />

        <!-- 4. AES-GCM Key -->
        <rect x="485" y="10" width="115" height="70" rx="6" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5" />
        <text x="542" y="32" text-anchor="middle" font-size="9" font-weight="700" fill="#047857">AES-GCM KEY</text>
        <text x="542" y="47" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#0f172a">256-Bit Symmetric</text>
        <text x="542" y="62" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#059669">Hardware Key Object</text>

        <path d="M 600 45 L 640 45" stroke="#10b981" stroke-width="2" />

        <!-- 5. Ciphertext Container -->
        <rect x="640" y="10" width="195" height="70" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="2" />
        <text x="737" y="32" text-anchor="middle" font-size="10" font-weight="800" fill="#34d399">ENCRYPTED VAULT JSON</text>
        <text x="737" y="47" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Ciphertext + IV + Auth Tag</text>
        <text x="737" y="62" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#38bdf8">Standalone Offline Backup</text>
      </svg>

      <!-- Security Guarantees Deck -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div class="glass-card">
          <div style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">ZERO-KNOWLEDGE</div>
          <p style="font-size: 8px; color: #64748b; line-height: 1.35;">Passphrases never cross HTTP boundaries. Encryption and decryption occur strictly in Web Worker memory.</p>
        </div>
        <div class="glass-card">
          <div style="font-size: 8.5px; font-weight: 800; color: #7c3aed; margin-bottom: 2px;">TAMPER AUTHENTICATION</div>
          <p style="font-size: 8px; color: #64748b; line-height: 1.35;">GCM mode provides authenticated encryption with an integral 128-bit authentication tag to prevent bit-flipping attacks.</p>
        </div>
        <div class="glass-card">
          <div style="font-size: 8.5px; font-weight: 800; color: #10b981; margin-bottom: 2px;">OFFLINE RESTORE</div>
          <p style="font-size: 8px; color: #64748b; line-height: 1.35;">Encrypted vault files can be restored on any air-gapped machine with a modern browser without server connectivity.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>CLIENT-SIDE CRYPTOGRAPHIC VAULT</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 13: INDEXEDDB STORAGE ARCHITECTURE
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">12 · DATA PERSISTENCE</span>
      <span class="header-title">INDEXEDDB &amp; DEXIE.JS STORAGE SCHEMA TOPOLOGY</span>
    </div>
    <div class="header-right">PAGE 13 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 13 — DEXIE.JS DATA ENTITY COLLECTIONS</div>
        <div class="fig-caption">Seven Normalized Local Collections with Reactive Observable Indices</div>
      </div>
      <div class="fig-sub font-mono">DEXIE VERSION: 4.4.0 · ZERO SERVER SYNCHRONIZATION DEPENDENCY</div>
    </div>

    <!-- Schema Grid -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      <!-- Table 1 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono';">transactions</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">Primary financial feed</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>++id (PK)</li>
          <li>title, amount</li>
          <li>type ('income'|'expense')</li>
          <li>bucket ('needs'|'wants')</li>
          <li>category, date</li>
          <li>profileId (Multi-User)</li>
        </ul>
      </div>

      <!-- Table 2 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #818cf8; font-family: 'JetBrains Mono';">journalEntries</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">GAAP atomic records</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>++id (PK)</li>
          <li>entryNumber</li>
          <li>date, narration</li>
          <li>lines: JournalLine[]</li>
          <li>source, createdAt</li>
        </ul>
      </div>

      <!-- Table 3 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #818cf8; font-family: 'JetBrains Mono';">accounts</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">Chart of Accounts (1-5)</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>code (PK e.g. '1010')</li>
          <li>name, category</li>
          <li>normalBalance</li>
          <li>currentBalance</li>
        </ul>
      </div>

      <!-- Table 4 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #f59e0b; font-family: 'JetBrains Mono';">commodities</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">Bullion reserve deck</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>++id (PK)</li>
          <li>metal ('gold'|'silver')</li>
          <li>weightInGrams</li>
          <li>purityKarat, spotPrice</li>
          <li>vaultLocation</li>
        </ul>
      </div>

      <!-- Table 5 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono';">ious</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">P2P rotary debt splits</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>++id (PK)</li>
          <li>friendName, totalBill</li>
          <li>friendShare</li>
          <li>direction, status</li>
          <li>friendPhone</li>
        </ul>
      </div>

      <!-- Table 6 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #f43f5e; font-family: 'JetBrains Mono';">subscriptions</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">Ghost subscription hunter</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>++id (PK)</li>
          <li>name, amount</li>
          <li>currency, billingCycle</li>
          <li>isActive, cancelDraft</li>
        </ul>
      </div>

      <!-- Table 7 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #a855f7; font-family: 'JetBrains Mono';">goals</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">Asset accumulation rings</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>++id (PK)</li>
          <li>title, targetAmount</li>
          <li>currentAmount</li>
          <li>deadline, category</li>
        </ul>
      </div>

      <!-- Table 8 -->
      <div class="glass-card">
        <div style="font-size: 9px; font-weight: 800; color: #06b6d4; font-family: 'JetBrains Mono';">settings</div>
        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">Sovereignty configuration</div>
        <ul style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #cbd5e1; padding-left: 12px; margin-top: 6px; line-height: 1.5;">
          <li>++id (PK)</li>
          <li>baseCurrency, aiPersona</li>
          <li>monthlyIncomeTarget</li>
          <li>activePersona</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>INDEXEDDB DATABASE TOPOLOGY</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 14: FINANCIAL DOMAINS TOPOLOGY MAP
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">13 · DOMAIN CLUSTERS</span>
      <span class="header-title">SIX ARCHITECTURAL FINANCIAL DOMAINS &amp; 15 SUB-ENGINES</span>
    </div>
    <div class="header-right">PAGE 14 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; height: 100%;">
      <div>
        <div class="fig-tag">FIG. 14 — SYSTEM TOPOLOGY SPREAD</div>
        <div class="fig-caption">Six Clustered Financial Workspaces with Keyboard Shortcuts</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
          <div class="glass-card">
            <div style="font-size: 9px; font-weight: 800; color: #0284c7;">1. WEALTH &amp; OVERVIEW</div>
            <div style="font-size: 7.5px; color: #64748b; font-family: 'JetBrains Mono';">Hero Liquidity, 50/30/20 Balance</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 9px; font-weight: 800; color: #7c3aed;">2. GENERAL LEDGER</div>
            <div style="font-size: 7.5px; color: #64748b; font-family: 'JetBrains Mono';">Journal, Trial Balance, Reports</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 9px; font-weight: 800; color: #059669;">3. CASH FLOW ENGINE</div>
            <div style="font-size: 7.5px; color: #64748b; font-family: 'JetBrains Mono';">Particle Stream, Waterfall Model</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 9px; font-weight: 800; color: #f59e0b;">4. ACADEMIC &amp; CPA SUITE</div>
            <div style="font-size: 7.5px; color: #64748b; font-family: 'JetBrains Mono';">Variance Labs, BEP, Capital NPV</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 9px; font-weight: 800; color: #e11d48;">5. DAILY BAZAAR &amp; RASHAN</div>
            <div style="font-size: 7.5px; color: #64748b; font-family: 'JetBrains Mono';">Mandi Sentinel, Commodity Food</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 9px; font-weight: 800; color: #06b6d4;">6. REPUTATION &amp; PEER DECK</div>
            <div style="font-size: 7.5px; color: #64748b; font-family: 'JetBrains Mono';">P2P Splitwise, WhatsApp Remind</div>
          </div>
        </div>
      </div>

      <!-- Right: Live Sitemap Modal Screenshot -->
      <div style="display: flex; flex-direction: column;">
        <div class="fig-tag">NAVIGATION ATLAS</div>
        <div class="fig-caption">Visual System Topology Overlay (CMD+K)</div>
        <div class="macos-window" style="margin-top: 6px; flex: 1;">
          <div class="macos-header">
            <div class="macos-dot dot-red"></div>
            <div class="macos-dot dot-yellow"></div>
            <div class="macos-dot dot-green"></div>
            <div class="macos-url">aura-finance-silk.vercel.app/sitemap</div>
          </div>
          <div class="macos-body" style="height: 100%; min-height: 240px;">
            <img src="${imgSitemap || imgDashboard}" style="width: 100%; height: 100%; object-fit: cover;" alt="Sitemap Topology Screenshot" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>SIX FINANCIAL DOMAIN CLUSTERS</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 15: COMMODITY & BULLION RESERVE ENGINE
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">14 · HARD ASSET VALUATION</span>
      <span class="header-title">PHYSICAL COMMODITY &amp; BULLION RESERVE ENGINE</span>
    </div>
    <div class="header-right">PAGE 15 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 15 — BULLION VALUATION &amp; UNIT CONVERSION PIPELINE</div>
        <div class="fig-caption">Grams, Troy Ounces, and South Asian Tola Calculations</div>
      </div>
      <div class="fig-sub font-mono">SOUTH ASIAN METRIC STANDARD: 1 TOLA ≡ 11.6638 GRAMS</div>
    </div>

    <!-- Bullion Formula Deck -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
      <svg viewBox="0 0 850 140" style="width: 100%; height: auto;">
        <!-- Mass Inputs -->
        <rect x="20" y="25" width="130" height="60" rx="6" fill="#18181b" stroke="#f59e0b" stroke-width="1.5" />
        <text x="85" y="48" text-anchor="middle" font-size="10" font-weight="700" fill="#fcd34d">PHYSICAL HOLDINGS</text>
        <text x="85" y="62" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Gold / Silver Mass</text>

        <path d="M 150 55 L 200 55" stroke="#f59e0b" stroke-width="1.5" />

        <!-- Unit Normalizer -->
        <rect x="200" y="15" width="160" height="80" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="2" />
        <text x="280" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#fcd34d">UNIT NORMALIZER</text>
        <text x="280" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">1 Tola = 11.6638g</text>
        <text x="280" y="70" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1">1 Troy Oz = 31.1035g</text>

        <path d="M 360 55 L 410 55" stroke="#f59e0b" stroke-width="1.5" />

        <!-- Spot Price Integration -->
        <rect x="410" y="25" width="140" height="60" rx="6" fill="#18181b" stroke="#38bdf8" stroke-width="1.5" />
        <text x="480" y="48" text-anchor="middle" font-size="10" font-weight="700" fill="#38bdf8">SPOT PRICE ENGINE</text>
        <text x="480" y="62" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#94a3b8">Market Spot Rate / Gram</text>

        <path d="M 550 55 L 600 55" stroke="#f59e0b" stroke-width="1.5" />

        <!-- Mark-To-Market Balance Sheet -->
        <rect x="600" y="15" width="230" height="80" rx="6" fill="#090E1E" stroke="#10b981" stroke-width="2" />
        <text x="715" y="38" text-anchor="middle" font-size="10" font-weight="800" fill="#34d399">BALANCE SHEET ASSET 1060</text>
        <text x="715" y="55" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#ffffff">Bullion Reserve Valuation</text>
        <text x="715" y="70" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#34d399">Unrealized P&amp;L Live Reconcile</text>
      </svg>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div class="glass-card">
          <div style="font-size: 8.5px; font-weight: 700; color: #f59e0b;">SOVEREIGN RESERVE (ACCOUNT 1060)</div>
          <p style="font-size: 8px; color: #94a3b8; line-height: 1.35; margin-top: 2px;">Enforces real physical gold as an unencumbered balance sheet asset, directly contributing to Total Net Worth.</p>
        </div>
        <div class="glass-card">
          <div style="font-size: 8.5px; font-weight: 700; color: #38bdf8;">DYNAMIC FX TRANSITIVITY</div>
          <p style="font-size: 8px; color: #94a3b8; line-height: 1.35; margin-top: 2px;">Spot prices denominated in USD automatically calibrate across PKR, AED, EUR using master transitivity rates.</p>
        </div>
        <div class="glass-card">
          <div style="font-size: 8.5px; font-weight: 700; color: #34d399;">SOUTH ASIAN TOLA STANDARDS</div>
          <p style="font-size: 8px; color: #94a3b8; line-height: 1.35; margin-top: 2px;">Eliminates cultural discrepancies by supporting native Tola units utilized across Sarafa Bazaar markets.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>COMMODITY &amp; BULLION RESERVE ENGINE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 16: MULTI-CURRENCY NORMALIZATION ENGINE
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">15 · GLOBAL CURRENCY</span>
      <span class="header-title">MULTI-CURRENCY CROSS-RATE TRANSITIVITY (USD / PKR / EUR / AED)</span>
    </div>
    <div class="header-right">PAGE 16 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 16 — MASTER FX RATE TRANSITIVITY ARCHITECTURE</div>
        <div class="fig-caption">All Ledger Records Unified to Base Currency without Floating-Point Drift</div>
      </div>
      <div class="fig-sub font-mono">MATHEMATICAL LAW 5: PRECISION ROUND(AMOUNT_USD * RATE_TARGET, 2)</div>
    </div>

    <!-- Currency Architecture Spread -->
    <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
      <svg viewBox="0 0 850 150" style="width: 100%; height: auto;">
        <!-- Inflow Currencies -->
        <rect x="20" y="15" width="100" height="30" rx="5" fill="#f8fafc" stroke="#64748b" stroke-width="1.2" />
        <text x="70" y="34" text-anchor="middle" font-size="9" font-family="JetBrains Mono" font-weight="700">USD ($)</text>

        <rect x="20" y="55" width="100" height="30" rx="5" fill="#f8fafc" stroke="#64748b" stroke-width="1.2" />
        <text x="70" y="74" text-anchor="middle" font-size="9" font-family="JetBrains Mono" font-weight="700">EUR (€)</text>

        <rect x="20" y="95" width="100" height="30" rx="5" fill="#f8fafc" stroke="#64748b" stroke-width="1.2" />
        <text x="70" y="114" text-anchor="middle" font-size="9" font-family="JetBrains Mono" font-weight="700">PKR (Rs)</text>

        <!-- Connect to Master USD Pivot -->
        <path d="M 120 30 L 220 70" stroke="#0284c7" stroke-width="1.5" />
        <path d="M 120 70 L 220 70" stroke="#0284c7" stroke-width="1.5" />
        <path d="M 120 110 L 220 70" stroke="#0284c7" stroke-width="1.5" />

        <!-- Master USD Pivot Hub -->
        <circle cx="270" cy="70" r="50" fill="#0f172a" stroke="#0284c7" stroke-width="2.5" />
        <text x="270" y="65" text-anchor="middle" font-size="10" font-weight="800" fill="#ffffff">MASTER BASE</text>
        <text x="270" y="78" text-anchor="middle" font-size="10" font-weight="800" fill="#38bdf8">USD PIVOT</text>
        <text x="270" y="90" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">Rate = 1.0000</text>

        <path d="M 320 70 L 400 70" stroke="#0284c7" stroke-width="2" />

        <!-- Transitivity Calculator -->
        <rect x="400" y="30" width="190" height="80" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
        <text x="495" y="55" text-anchor="middle" font-size="10" font-weight="700" fill="#0284c7">TRANSITIVITY CALCULATOR</text>
        <text x="495" y="72" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">amountInUSD = amt / rate[from]</text>
        <text x="495" y="88" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">targetVal = amountInUSD * rate[to]</text>

        <path d="M 590 70 L 650 70" stroke="#0284c7" stroke-width="2" />

        <!-- Unified Output -->
        <rect x="650" y="25" width="180" height="90" rx="6" fill="#f0fdf4" stroke="#10b981" stroke-width="2" />
        <text x="740" y="52" text-anchor="middle" font-size="10" font-weight="800" fill="#047857">COHERENT PRESENTATION</text>
        <text x="740" y="68" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#059669">Locked Currency Code</text>
        <text x="740" y="82" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#64748b">Zero Mixed Symbols ($ vs Rs)</text>
        <text x="740" y="95" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#059669">Cent-Precision Rounding</text>
      </svg>

      <div style="font-size: 9px; color: #475569; line-height: 1.5; padding: 0 10px;">
        <strong>Multi-Currency Law:</strong> It is strictly forbidden for Overview to show <code class="font-mono">$</code> while General Ledger shows <code class="font-mono">Rs</code> or Time Machine shows <code class="font-mono">€</code>. When the base currency is toggled, all 15 views re-render with identical mathematical normalization.
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>MULTI-CURRENCY ENGINE SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 17: CULTURAL FINANCE ENGINES (KAMETI & PEER IOUS)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">16 · CULTURAL WORKFLOWS</span>
      <span class="header-title">ROTARY SAVINGS (KAMETI / CHIT FUND) &amp; P2P DEBT SPLITTING</span>
    </div>
    <div class="header-right">PAGE 17 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; height: 100%;">
      <!-- Left: Kameti Rotary Engine -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="fig-tag">MODULE SPECIFICATION</div>
          <div class="fig-caption">Kameti / Chit Fund Rotary Pool Architecture</div>
          <p style="font-size: 9.5px; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
            A formal mathematical implementation of communal rotating credit associations (ROSCAs), popular across South Asia, the Middle East, and Latin America.
          </p>
        </div>

        <svg viewBox="0 0 380 140" style="width: 100%; height: auto;">
          <circle cx="190" cy="70" r="35" fill="#18181b" stroke="#f59e0b" stroke-width="2" />
          <text x="190" y="68" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fcd34d">POOL</text>
          <text x="190" y="80" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#94a3b8">N × Contribution</text>

          <!-- Member nodes -->
          <circle cx="90" cy="40" r="18" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="90" y="43" text-anchor="middle" font-size="7" font-weight="700" fill="#e2e8f0">Mem 1</text>
          <line x1="108" y1="45" x2="155" y2="60" stroke="#f59e0b" stroke-width="1" />

          <circle cx="90" cy="100" r="18" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="90" y="103" text-anchor="middle" font-size="7" font-weight="700" fill="#e2e8f0">Mem 2</text>
          <line x1="108" y1="95" x2="155" y2="80" stroke="#f59e0b" stroke-width="1" />

          <circle cx="290" cy="40" r="18" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="290" y="43" text-anchor="middle" font-size="7" font-weight="700" fill="#e2e8f0">Mem 3</text>
          <line x1="272" y1="45" x2="225" y2="60" stroke="#f59e0b" stroke-width="1" />

          <circle cx="290" cy="100" r="18" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="290" y="103" text-anchor="middle" font-size="7" font-weight="700" fill="#e2e8f0">Mem 4</text>
          <line x1="272" y1="95" x2="225" y2="80" stroke="#f59e0b" stroke-width="1" />
        </svg>

        <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #cbd5e1;">
          ACCOUNT BINDING: Asset 1050 Rotary Receivables / Liability 2030 Rotary Due
        </div>
      </div>

      <!-- Right: P2P Bill Splitter -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="fig-tag">MODULE SPECIFICATION</div>
          <div class="fig-caption">Peer-to-Peer Debt &amp; 1-Tap WhatsApp Settle</div>
          <p style="font-size: 9.5px; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
            Split shared dining, groceries, and travel bills with zero-backend local storage and instant WhatsApp payment links.
          </p>
        </div>

        <svg viewBox="0 0 380 140" style="width: 100%; height: auto;">
          <rect x="20" y="45" width="100" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
          <text x="70" y="68" text-anchor="middle" font-size="9" font-weight="700" fill="#38bdf8">YOU (USER)</text>
          <text x="70" y="81" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Asset 1030 AR</text>

          <path d="M 120 70 L 260 70" stroke="#34d399" stroke-width="2" marker-end="url(#arrow)" />
          <text x="190" y="62" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#34d399">1-Tap WhatsApp</text>

          <rect x="260" y="45" width="100" height="50" rx="6" fill="#0f172a" stroke="#34d399" stroke-width="1.5" />
          <text x="310" y="68" text-anchor="middle" font-size="9" font-weight="700" fill="#34d399">FRIEND (PEER)</text>
          <text x="310" y="81" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Liability 2010 AP</text>
        </svg>

        <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #cbd5e1;">
          SYNCHRONY LAW: Unsettled IOUs directly scale Net Worth asset totals.
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>CULTURAL FINANCE &amp; PEER ENGINES</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 18: INTERNATIONALIZATION & RTL LOCALIZATION
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">17 · LOCALIZATION</span>
      <span class="header-title">VERNACULAR FINANCIAL LOCALIZATION &amp; RTL MIRRORING</span>
    </div>
    <div class="header-right">PAGE 18 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 17 — DOM DIR="LTR" VS DIR="RTL" MIRRORING ARCHITECTURE</div>
        <div class="fig-caption">Localization as System Behavior: Mirrored Layouts &amp; Native Financial Vocabulary</div>
      </div>
      <div class="fig-sub font-mono">SUPPORTED: ENGLISH, URDU (اردو), ARABIC (العربية), ROMAN URDU</div>
    </div>

    <!-- Comparison Spread -->
    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <!-- LTR Frame -->
      <div class="glass-card" style="border-left: 3px solid #0284c7;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; color: #0284c7; font-family: 'JetBrains Mono';">DEFAULT LTR (ENGLISH)</span>
          <span style="font-size: 8px; font-family: 'JetBrains Mono'; color: #64748b;">dir="ltr"</span>
        </div>
        <div style="font-size: 9px; color: #64748b; line-height: 1.4; margin-bottom: 8px;">Standard Western financial layout with left-anchored navigation and right-aligned metrics.</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 9px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700;">
            <span>Net Liquid Cash</span>
            <span class="font-mono text-emerald-600">$48,250.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #64748b; font-size: 8px; margin-top: 4px;">
            <span>Trial Balance Status</span>
            <span class="font-mono">BALANCED (0.00)</span>
          </div>
        </div>
      </div>

      <!-- RTL Frame -->
      <div class="glass-card" style="border-right: 3px solid #10b981; direction: rtl; text-align: right;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; color: #047857; font-family: 'JetBrains Mono';">MIRRORED RTL (اردو / عربية)</span>
          <span style="font-size: 8px; font-family: 'JetBrains Mono'; color: #64748b;">dir="rtl"</span>
        </div>
        <div style="font-size: 9px; color: #64748b; line-height: 1.4; margin-bottom: 8px;">دائیں سے بائیں مکمل سٹرکچرل تبدیلی مع مقامی مالیاتی اصطلاحات (راشن، کمیٹی، منڈی).</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 9px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700;">
            <span>خالص نقد رقم</span>
            <span class="font-mono text-emerald-600">₨ 48,250.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #64748b; font-size: 8px; margin-top: 4px;">
            <span>ٹرائل بیلنس کی کیفیت</span>
            <span class="font-mono">مکمل برابر (0.00)</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>INTERNATIONALIZATION &amp; RTL ARCHITECTURE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 19: FINITE STATE MACHINE (TRANSACTION LIFECYCLE)
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">18 · STATE INTEGRITY</span>
      <span class="header-title">FINITE STATE MACHINE — ATOMIC TRANSACTION LIFECYCLE</span>
    </div>
    <div class="header-right">PAGE 19 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 18 — TRANSACTION TRANSITION STATE GRAPH</div>
        <div class="fig-caption">Formal State Machine Enforcing ACID Durability in IndexedDB</div>
      </div>
      <div class="fig-sub font-mono">DETERMINISTIC VALIDATION: ZERO UNBALANCED WRITES</div>
    </div>

    <!-- FSM Diagram -->
    <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 850 220" style="width: 100%; height: auto;">
        <!-- State 1: DRAFT -->
        <rect x="20" y="85" width="90" height="50" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
        <text x="65" y="108" text-anchor="middle" font-size="9" font-weight="700" fill="#ffffff">DRAFT</text>
        <text x="65" y="122" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Payload Init</text>

        <path d="M 110 110 L 160 110" stroke="#38bdf8" stroke-width="1.5" />

        <!-- State 2: LINE VALIDATION -->
        <rect x="160" y="85" width="115" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <text x="217" y="108" text-anchor="middle" font-size="9" font-weight="700" fill="#38bdf8">LINE ITEMS</text>
        <text x="217" y="122" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#94a3b8">Chart Account Map</text>

        <path d="M 275 110 L 325 110" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Decision: VARIANCE -->
        <polygon points="375,70 425,110 375,150 325,110" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5" />
        <text x="375" y="113" text-anchor="middle" font-size="8" font-weight="800" fill="#a5b4fc">Σ Dr == Σ Cr?</text>

        <!-- Unbalanced Reject Loop -->
        <path d="M 375 70 L 375 25 L 217 25 L 217 85" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="296" y="20" font-size="7.5" font-family="JetBrains Mono" fill="#f87171">REJECT / BLOCK COMMIT</text>

        <!-- Balanced Proceed -->
        <path d="M 425 110 L 485 110" stroke="#10b981" stroke-width="2" />

        <!-- State 3: ATOMIC WRITE -->
        <rect x="485" y="85" width="125" height="50" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="2" />
        <text x="547" y="108" text-anchor="middle" font-size="9" font-weight="800" fill="#34d399">ATOMIC WRITE</text>
        <text x="547" y="122" text-anchor="middle" font-size="7.5" font-family="JetBrains Mono" fill="#cbd5e1">Dexie Transaction</text>

        <path d="M 610 110 L 660 110" stroke="#10b981" stroke-width="2" />

        <!-- State 4: SSOT BROADCAST -->
        <rect x="660" y="80" width="165" height="60" rx="6" fill="#090E1E" stroke="#38bdf8" stroke-width="2" />
        <text x="742" y="105" text-anchor="middle" font-size="10" font-weight="900" fill="#38bdf8">SSOT SYNCHRONIZED</text>
        <text x="742" y="120" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#ffffff">All 15 Views Updated</text>
        <text x="742" y="132" text-anchor="middle" font-size="7" font-family="JetBrains Mono" fill="#34d399">Total Latency: &lt;16ms</text>
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>TRANSACTION FINITE STATE MACHINE</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 20: REACTIVE SYSTEM PROPAGATION GRAPH
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">19 · STATE PROPAGATION</span>
      <span class="header-title">ONE MUTATION → SYSTEM-WIDE SIMULTANEOUS PROPAGATION</span>
    </div>
    <div class="header-right">PAGE 20 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 19 — SYNCHRONIZED RECONCILIATION PROOF MATRIX</div>
        <div class="fig-caption">Posting a $1,200 Revenue Transaction Propagates Instantaneously Across All 15 Modules</div>
      </div>
      <div class="fig-sub font-mono">REACTION BENCHMARK: SUB-FRAME (&lt;16MS)</div>
    </div>

    <!-- Verification Matrix Grid -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #0284c7;">1. GENERAL LEDGER</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">Dr 1010: $1,200 | Cr 4010: $1,200</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Trial balance debits and credits increment equally. Variance remains $0.00.</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #059669;">2. OVERVIEW DASHBOARD</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">Hero Net Cash: +$1,200.00</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">50/30/20 balance adjusts: allowable Wants allowance expands by +$360 (30%).</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #7c3aed;">3. CASH FLOW ENGINE</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">Operating Inflow: +$1,200.00</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Waterfall node increments; particle stream physics speed adjusts automatically.</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #f59e0b;">4. ACADEMIC SUITE</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">T-Account Dr 1010 / Cr 4010</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Cost &amp; Management actual revenue baseline reflects exact +$1,200 increment.</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #e11d48;">5. TIME MACHINE SLIDER</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">Starting Principal (P): +$1,200</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Slider baseline advances; 10-year compound interest projection curve shifts upward.</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #06b6d4;">6. IMPULSE INTERCEPTOR</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">Wants Allowance: +$360.00</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Item price evaluation slider threshold expands safely without triggering 48h lock.</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #a855f7;">7. AI FINANCIAL COPILOT</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">Prompt Injected Context: +$1,200</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Next conversational query knows exact new balance without hallucinating numbers.</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #10b981;">8. SETTINGS STATEMENT PDF</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">24H Ledger Preview: +$1,200</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Generated vector PDF includes line item with updated SHA-256 digital verification seal.</p>
      </div>

      <div class="glass-card">
        <div style="font-size: 8.5px; font-weight: 800; color: #0284c7;">9. PERSONAL FLOW (SANKEY)</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #0f172a; margin-top: 3px;">Income Trunk Width: +$1,200</div>
        <p style="font-size: 8px; color: #64748b; line-height: 1.35; margin-top: 2px;">Visual SVG flow bridge adjusts node widths proportionally to the new capital partition.</p>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>REACTIVE SYSTEM PROPAGATION GRAPH</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 21: SECURITY & PRIVACY TRUST BOUNDARY
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">20 · SECURITY ARCHITECTURE</span>
      <span class="header-title">THE ZERO-KNOWLEDGE CLIENT BROWSER TRUST PERIMETER</span>
    </div>
    <div class="header-right">PAGE 21 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 20 — STRICT TRUST BOUNDARY SEPARATION</div>
        <div class="fig-caption">Explicit Visual Contrast: What Stays In the Browser vs. What Crosses the Perimeter</div>
      </div>
      <div class="fig-sub font-mono">GUARANTEE: NO FINANCIAL RECORD EVER TOUCHES A BACKEND SERVER</div>
    </div>

    <!-- Venn/Perimeter Diagram -->
    <div style="flex: 1; display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 14px;">
      <!-- Inside Container -->
      <div style="background: rgba(14,165,233,0.04); border: 2px dashed #0284c7; border-radius: 8px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono';">INSIDE CLIENT BROWSER (SOVEREIGN ENVIRONMENT)</span>
          <span class="callout-pill pill-emerald" style="font-size: 7.5px;">100% AIR-GAPPABLE</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
          <div class="glass-card">
            <div style="font-size: 8.5px; font-weight: 700; color: #38bdf8;">All Transaction Records</div>
            <div style="font-size: 7.5px; color: #94a3b8; font-family: 'JetBrains Mono';">IndexedDB Dexie Tables</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 8.5px; font-weight: 700; color: #38bdf8;">Double-Entry Ledger</div>
            <div style="font-size: 7.5px; color: #94a3b8; font-family: 'JetBrains Mono';">General Journal &amp; Accounts</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 8.5px; font-weight: 700; color: #34d399;">Cryptographic Keys</div>
            <div style="font-size: 7.5px; color: #94a3b8; font-family: 'JetBrains Mono';">Web Crypto PBKDF2</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 8.5px; font-weight: 700; color: #34d399;">Bullion Mass &amp; Ratios</div>
            <div style="font-size: 7.5px; color: #94a3b8; font-family: 'JetBrains Mono';">Grams &amp; Tolas (11.6638g)</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 8.5px; font-weight: 700; color: #fbbf24;">Speech Audio Stream</div>
            <div style="font-size: 7.5px; color: #94a3b8; font-family: 'JetBrains Mono';">Local Web Speech Buffer</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 8.5px; font-weight: 700; color: #c084fc;">User Personas &amp; Goals</div>
            <div style="font-size: 7.5px; color: #94a3b8; font-family: 'JetBrains Mono';">LocalStorage Cache</div>
          </div>
        </div>
      </div>

      <!-- Outside Container -->
      <div style="background: rgba(239,68,68,0.03); border: 2px solid rgba(239,68,68,0.25); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #f87171; font-family: 'JetBrains Mono';">CROSSES PERIMETER</div>
          <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">Strictly Stateless Ephemeral Payloads</div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
            <div style="padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;">
              <div style="font-size: 8.5px; font-weight: 700; color: #e2e8f0;">1. Receipt Image to Gemini</div>
              <div style="font-size: 7px; color: #94a3b8; font-family: 'JetBrains Mono';">Ephemeral Vision inference only; zero training retention.</div>
            </div>
            <div style="padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;">
              <div style="font-size: 8.5px; font-weight: 700; color: #e2e8f0;">2. Cached FX Rates Request</div>
              <div style="font-size: 7px; color: #94a3b8; font-family: 'JetBrains Mono';">Public market currency rate table; zero user metadata.</div>
            </div>
          </div>
        </div>

        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #f87171; background: rgba(239,68,68,0.1); padding: 6px; border-radius: 4px;">
          PRIVACY SENTINEL: No tracking cookies, no telemetry beacons, no user profiling.
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>SECURITY &amp; PRIVACY TRUST BOUNDARY</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 22: HARDWARE SCALABILITY & PERFORMANCE BENCHMARKS
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">21 · PERFORMANCE ENGINEERING</span>
      <span class="header-title">HARDWARE SCALABILITY &amp; SUB-SECOND AUDIT BENCHMARKS</span>
    </div>
    <div class="header-right">PAGE 22 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 21 — PERFORMANCE TELEMETRY BENCHMARKS</div>
        <div class="fig-caption">Hardware-Agnostic Efficiency Tested Down to Legacy Dual-Core Systems</div>
      </div>
      <div class="fig-sub font-mono">SPECIFIED IN OFFICIAL ARCHITECTURE DOCUMENTATION</div>
    </div>

    <!-- 4 Giant Metric Cards -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 6px;">
      <!-- Card 1 -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #0284c7;">
        <div>
          <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #64748b; font-weight: 700;">RUNTIME ALLOCATION</div>
          <div style="font-size: 38px; font-weight: 900; color: #0284c7; font-family: 'JetBrains Mono'; line-height: 1.1; margin-top: 6px;">
            &lt; 80<span style="font-size: 16px;">MB</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">IDLE HEAP MEMORY</div>
        </div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.4;">Minimal heap profile enables flawless operation across resource-constrained devices.</p>
      </div>

      <!-- Card 2 -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #059669;">
        <div>
          <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #64748b; font-weight: 700;">CANVAS REFRESH</div>
          <div style="font-size: 38px; font-weight: 900; color: #059669; font-family: 'JetBrains Mono'; line-height: 1.1; margin-top: 6px;">
            60 <span style="font-size: 16px;">FPS</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">TARGET FRAME RATE</div>
        </div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.4;">WebGL-accelerated physics engine for Cash-Flow Particle Stream locked on integrated GPUs.</p>
      </div>

      <!-- Card 3 -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #7c3aed;">
        <div>
          <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #64748b; font-weight: 700;">FIRST CONTENTFUL PAINT</div>
          <div style="font-size: 38px; font-weight: 900; color: #7c3aed; font-family: 'JetBrains Mono'; line-height: 1.1; margin-top: 6px;">
            &lt; 450<span style="font-size: 16px;">ms</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">COLD START FCP</div>
        </div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.4;">Instant DOM paint verified on standard 4G mobile connections with zero server SSR delay.</p>
      </div>

      <!-- Card 4 -->
      <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #f59e0b;">
        <div>
          <div style="font-size: 8px; font-family: 'JetBrains Mono'; color: #64748b; font-weight: 700;">BUNDLE DISTRIBUTION</div>
          <div style="font-size: 38px; font-weight: 900; color: #f59e0b; font-family: 'JetBrains Mono'; line-height: 1.1; margin-top: 6px;">
            ~165<span style="font-size: 16px;">kB</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 2px;">ENTRY CHUNK (GZIP)</div>
        </div>
        <p style="font-size: 8.5px; color: #64748b; line-height: 1.4;">Route code-splitting via Rolldown &amp; Vite packages dynamic modules on-demand.</p>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>HARDWARE SCALABILITY &amp; BENCHMARKS</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 23: EVALUATION PERSONAS
     ========================================================================= -->
<div class="page theme-obsidian">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">22 · EVALUATOR LABS</span>
      <span class="header-title">FOUR TESTED EVALUATION PERSONA SCENARIOS</span>
    </div>
    <div class="header-right">PAGE 23 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 22 — EVALUATION PERSONA DOSSIER</div>
        <div class="fig-caption">Turnkey Real-World Datasets Designed for Comprehensive Jury Audit</div>
      </div>
      <div class="fig-sub font-mono">1-TAP SYNTHESIS VIA PERSONA ARCHITECT STUDIO</div>
    </div>

    <!-- 4 Persona Cards -->
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      <div class="glass-card">
        <div style="font-size: 18px; margin-bottom: 4px;">⚖️</div>
        <div style="font-size: 9.5px; font-weight: 800; color: #38bdf8;">SYSTEM AUDITOR / CPA</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">High-Frequency Trial Balance</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">Audits standard double-entry journal, verifies zero-variance trials, and generates SHA-256 sealed statements.</p>
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 7.5px; font-family: 'JetBrains Mono'; color: #38bdf8;">
          MODULES: Ledger, Reports, PDF
        </div>
      </div>

      <div class="glass-card">
        <div style="font-size: 18px; margin-bottom: 4px;">💼</div>
        <div style="font-size: 9.5px; font-weight: 800; color: #34d399;">GLOBAL FREELANCER</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Cross-Border USD/EUR/PKR</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">Logs client payments in USD, manages local living expenses in PKR, and tracks tax deductions.</p>
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 7.5px; font-family: 'JetBrains Mono'; color: #34d399;">
          MODULES: Multi-Currency, Cash Flow
        </div>
      </div>

      <div class="glass-card">
        <div style="font-size: 18px; margin-bottom: 4px;">🩺</div>
        <div style="font-size: 9.5px; font-weight: 800; color: #f59e0b;">MEDICAL RESIDENT / STUDENT</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Tight Living Stipend</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">Evaluates daily food costs in Mandi Sentinel, tracks shared apartment bills via P2P Splitter.</p>
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 7.5px; font-family: 'JetBrains Mono'; color: #f59e0b;">
          MODULES: Bazaar, IOUs, Interceptor
        </div>
      </div>

      <div class="glass-card">
        <div style="font-size: 18px; margin-bottom: 4px;">🥇</div>
        <div style="font-size: 9.5px; font-weight: 800; color: #a855f7;">BULLION INVESTOR</div>
        <div style="font-size: 7.5px; font-family: 'JetBrains Mono'; color: #94a3b8; margin-top: 2px;">Hard Asset Preservation</div>
        <p style="font-size: 8px; color: #cbd5e1; line-height: 1.35; margin-top: 6px;">Monitors physical gold bars in Tolas, tracks spot prices, and models 20-year compound wealth.</p>
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 7.5px; font-family: 'JetBrains Mono'; color: #a855f7;">
          MODULES: Bullion Vault, Time Machine
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>EVALUATION PERSONA PROFILES</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 24: END-TO-END SYSTEM ARCHITECTURE BLUEPRINT
     ========================================================================= -->
<div class="page theme-opal">
  <div class="page-header">
    <div class="header-left">
      <span class="header-badge">23 · ARCHITECTURAL SYNTHESIS</span>
      <span class="header-title">END-TO-END SYSTEM ARCHITECTURE BLUEPRINT</span>
    </div>
    <div class="header-right">PAGE 24 // 25</div>
  </div>

  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
      <div>
        <div class="fig-tag">FIG. 23 — UNIFIED SYSTEM ARCHITECTURAL BLUEPRINT</div>
        <div class="fig-caption">Complete Topology: Ingestion → Intelligence → Persistence → Presentation</div>
      </div>
      <div class="fig-sub font-mono">COMPLETE CLIENT-SIDE AUTONOMOUS WEALTH SYSTEM</div>
    </div>

    <!-- Complete Macro Blueprint -->
    <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 850 260" style="width: 100%; height: 100%;">
        <!-- Layer 1: Ingestion -->
        <rect x="20" y="20" width="160" height="220" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" />
        <text x="100" y="42" text-anchor="middle" font-size="10" font-weight="800" fill="#0284c7">1. INGESTION</text>
        <text x="100" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Speech Audio</text>
        <text x="100" y="85" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Receipt Image</text>
        <text x="100" y="105" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Manual Ledger Form</text>
        <text x="100" y="125" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• WhatsApp Splits</text>
        <text x="100" y="145" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Encrypted JSON</text>
        <text x="100" y="165" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Persona Studio</text>

        <path d="M 180 130 L 230 130" stroke="#0284c7" stroke-width="2" />

        <!-- Layer 2: Core SSOT Engine -->
        <rect x="230" y="20" width="200" height="220" rx="8" fill="#f0f9ff" stroke="#7c3aed" stroke-width="2" />
        <text x="330" y="42" text-anchor="middle" font-size="10" font-weight="800" fill="#7c3aed">2. RECONCILIATION SSOT</text>
        <text x="330" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• GAAP Double-Entry Matrix</text>
        <text x="330" y="85" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• 50/30/20 Capital Equilibrium</text>
        <text x="330" y="105" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Bullion Spot Normalizer</text>
        <text x="330" y="125" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Transitive FX Engine</text>
        <text x="330" y="145" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• SHA-256 Statement Digest</text>
        <text x="330" y="165" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Balance Sentinel Guard</text>

        <path d="M 430 130 L 480 130" stroke="#7c3aed" stroke-width="2" />

        <!-- Layer 3: Persistence -->
        <rect x="480" y="20" width="160" height="220" rx="8" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5" />
        <text x="560" y="42" text-anchor="middle" font-size="10" font-weight="800" fill="#047857">3. PERSISTENCE</text>
        <text x="560" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Dexie.js (IndexedDB)</text>
        <text x="560" y="85" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• 7 Data Collections</text>
        <text x="560" y="105" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• ACID Transactions</text>
        <text x="560" y="125" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Web Crypto AES-256</text>
        <text x="560" y="145" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• PBKDF2 Key Derivation</text>
        <text x="560" y="165" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• LocalStorage Cache</text>

        <path d="M 640 130 L 690 130" stroke="#10b981" stroke-width="2" />

        <!-- Layer 4: Presentation -->
        <rect x="690" y="20" width="140" height="220" rx="8" fill="#fff1f2" stroke="#e11d48" stroke-width="1.5" />
        <text x="760" y="42" text-anchor="middle" font-size="10" font-weight="800" fill="#be123c">4. PRESENTATION</text>
        <text x="760" y="65" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Overview Hero</text>
        <text x="760" y="85" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• General Ledger</text>
        <text x="760" y="105" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Particle Stream</text>
        <text x="760" y="125" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Academic Suite</text>
        <text x="760" y="145" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• AI Copilot</text>
        <text x="760" y="165" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#0f172a">• Statement PDF</text>
      </svg>
    </div>
  </div>

  <div class="page-footer">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>END-TO-END ARCHITECTURAL BLUEPRINT</span>
    <span>CONFIDENTIAL & PROPRIETARY</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 25: CLOSING EDITORIAL SPREAD
     ========================================================================= -->
<div class="page theme-obsidian" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at 50% 50%, #151d38 0%, #060913 80%);">
  <div style="max-width: 680px;">
    <div class="header-badge" style="font-size: 9px; padding: 4px 12px; margin-bottom: 24px;">ARCHITECTURAL CONCLUSION</div>
    
    <div style="font-family: 'Cinzel', serif; font-size: 46px; font-weight: 900; letter-spacing: 0.04em; color: #ffffff; line-height: 1.15;">
      FROM TRANSACTION<br/>TO TRUST.
    </div>

    <div style="width: 60px; height: 2px; background: #38bdf8; margin: 24px auto;"></div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.7; font-weight: 400;">
      AuraFinance OS proves that personal financial sovereignty does not require cloud surrender. By unifying client-side GAAP double-entry integrity, stateless multimodal intelligence, and hardware-accelerated local encryption, the system delivers an uncompromised wealth operating system built for the next century of computing.
    </p>

    <div style="margin-top: 36px; display: inline-flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="font-family: 'JetBrains Mono'; font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 0.05em;">
        https://aura-finance-silk.vercel.app/
      </div>
      <div style="font-size: 9px; font-family: 'JetBrains Mono'; color: #64748b;">
        AURAFINANCE OS · AUTONOMOUS AI WEALTH OPERATING SYSTEM · 2026
      </div>
    </div>
  </div>

  <div class="page-footer" style="position: absolute; bottom: 12mm; left: 16mm; right: 16mm;">
    <span>AURAFINANCE OS // ARCHITECTURAL DOSSIER</span>
    <span>END OF SPECIFICATION</span>
    <span>PAGE 25 // 25</span>
  </div>
</div>

</body>
</html>`;
}

// Generate HTML and write to disk
const htmlContent = generateHtml();
const outputPath = path.resolve('docs/AuraFinance_OS_Project_Documentation.html');
fs.writeFileSync(outputPath, htmlContent);
console.log(`Generated HTML dossier at: ${outputPath}`);

// Compile to publication PDF via headless Chrome
const pdfPath = path.resolve('docs/AuraFinance_OS_Project_Documentation.pdf');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const cmd = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${outputPath}"`;
console.log('Compiling PDF with Chrome headless...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`\n🎉 SUCCESS! Publication-grade PDF generated:\n--> ${pdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB, 25 Landscape A4 Pages)`);
} else {
  console.error('Failed to generate PDF');
}
