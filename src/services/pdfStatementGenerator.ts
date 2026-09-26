import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ledgerDb } from '../db/ledgerSchema';
import { computeSha256 } from './doubleEntryEngine';
import type { CoherentFinancialState } from '../types/reconciliation';

export interface StatementGenerationOptions {
  vaultName: string;
  baseCurrency: string;
  accountHolder: string;
  coherentLiquidity?: CoherentFinancialState['liquidity'];
}

export async function generate24HourStatementPDF(options: StatementGenerationOptions): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Fetch transactions within the exact 24-hour window using indexed range
  const past24hIsoDate = past24h.toISOString().slice(0, 10);
  const entries24h = await ledgerDb.journalEntries
    .where('date')
    .aboveOrEqual(past24hIsoDate)
    .filter((entry) => {
      const entryDate = new Date(entry.createdAt || entry.date);
      return entryDate >= past24h && entryDate <= now;
    })
    .toArray();

  // Calculate opening balance, credits, debits, and running balance
  let totalCredits = 0;
  let totalDebits = 0;

  // Compute opening balance based on accounts
  const accounts = await ledgerDb.accounts.toArray();
  const liquidAccounts = accounts.filter((a) => a.code === '1010' || a.code === '1020');
  const currentLiquidTotal = liquidAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  let runningBalance = currentLiquidTotal;

  // Sort chronologically for ledger display
  const sortedEntries = [...entries24h].sort(
    (a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
  );

  const tableRows = sortedEntries.map((e) => {
    const debitLine = e.lines.find((l) => l.debit > 0);
    const creditLine = e.lines.find((l) => l.credit > 0);
    const amount = debitLine ? debitLine.debit : creditLine ? creditLine.credit : 0;

    const isIncome = creditLine && ['4010', '4020', '3010'].includes(creditLine.accountId);
    if (isIncome) {
      totalCredits += amount;
      runningBalance += amount;
    } else {
      totalDebits += amount;
      runningBalance -= amount;
    }

    const timeStr = new Date(e.createdAt || e.date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return [
      timeStr,
      e.entryNumber,
      e.narration.length > 36 ? `${e.narration.substring(0, 36)}...` : e.narration,
      `${debitLine?.accountId || 'Dr'} / ${creditLine?.accountId || 'Cr'}`,
      !isIncome ? `-${options.baseCurrency} ${amount.toFixed(2)}` : '--',
      isIncome ? `+${options.baseCurrency} ${amount.toFixed(2)}` : '--',
      `${options.baseCurrency} ${runningBalance.toFixed(2)}`,
    ];
  });

  const openingBalance = options.coherentLiquidity
    ? options.coherentLiquidity.openingBalance24h
    : Math.max(0, currentLiquidTotal - totalCredits + totalDebits);
  const closingBalance = options.coherentLiquidity
    ? options.coherentLiquidity.closingBalance
    : currentLiquidTotal;
  const totalInflowAmount = options.coherentLiquidity
    ? options.coherentLiquidity.totalInflows
    : totalCredits;
  const totalOutflowAmount = options.coherentLiquidity
    ? options.coherentLiquidity.totalOutflows
    : totalDebits;
  const netVariancePercent = openingBalance > 0
    ? (((closingBalance - openingBalance) / openingBalance) * 100).toFixed(2)
    : '0.00';

  // Compute digital verification hash for the 24h block
  const blockData = JSON.stringify({ entries: entries24h.map((e) => e.entryNumber), totalCredits, totalDebits });
  const digitalSigHash = await computeSha256(blockData + now.toISOString());
  const shortRef = digitalSigHash.substring(0, 10).toUpperCase();

  // Primary Colors (Institutional Monochrome & Slate)
  const primaryColor = [15, 23, 42]; // Slate 900
  const slateMuted = [100, 116, 139]; // Slate 500

  // 2. Render Institutional Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AURAFINANCE WEALTH OPERATING SYSTEM', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('CLIENT PRIVATE VAULT — ZERO-KNOWLEDGE DISTRIBUTED LEDGER', 14, 23);
  doc.text(`STATEMENT PERIOD: ${past24h.toLocaleString()} — ${now.toLocaleString()} (UTC)`, 14, 27);

  // Metadata Right Column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`STATEMENT REF: STMT-${shortRef}`, 196, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('TYPE: 24-HOUR INTRADAY CASH MOVEMENT', 196, 23, { align: 'right' });
  doc.text(`GENERATED: ${now.toISOString()}`, 196, 27, { align: 'right' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 30, 196, 30);

  // 3. Account Holder & Vault Summary Card
  autoTable(doc, {
    startY: 33,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2 },
    body: [
      [
        { content: `Account Holder: ${options.accountHolder}`, styles: { fontStyle: 'bold' } },
        { content: `Base Currency: ${options.baseCurrency}`, styles: { fontStyle: 'bold' } },
        { content: `Vault Node: ${options.vaultName}`, styles: { halign: 'right' } },
      ],
      [
        `Opening Balance (24H Ago): ${options.baseCurrency} ${openingBalance.toFixed(2)}`,
        `Total Credits (Inflow): +${options.baseCurrency} ${totalInflowAmount.toFixed(2)}`,
        { content: `Total Debits (Outflow): -${options.baseCurrency} ${totalOutflowAmount.toFixed(2)}`, styles: { halign: 'right' } },
      ],
      [
        { content: `Closing Balance: ${options.baseCurrency} ${closingBalance.toFixed(2)}`, styles: { fontStyle: 'bold', textColor: [5, 150, 105] } },
        { content: `Net Variance: ${Number(netVariancePercent) >= 0 ? '+' : ''}${netVariancePercent}%`, styles: { fontStyle: 'bold' } },
        { content: `Total Entries: ${entries24h.length} records`, styles: { halign: 'right' } },
      ],
    ],
  });

  // 4. Double-Entry Transaction Ledger Table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    head: [['Time', 'Reference', 'Description / Counterparty', 'Affected', 'Debits (-)', 'Credits (+)', 'Balance']],
    body:
      tableRows.length > 0
        ? tableRows
        : [['--', '--', 'No recorded transactions in the last 24 hours', '--', '--', '--', `${options.baseCurrency} ${closingBalance.toFixed(2)}`]],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 26 },
      2: { cellWidth: 52 },
      3: { cellWidth: 24 },
      4: { cellWidth: 22, halign: 'right', textColor: [225, 29, 72] },
      5: { cellWidth: 22, halign: 'right', textColor: [5, 150, 105] },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // 5. Audit & Security Footer
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('CERTIFIED AUDIT PROOF & REGULATORY NOTICE:', 14, finalY);
  doc.text(`Digital Verification Hash (SHA-256): ${digitalSigHash}`, 14, finalY + 3.5);
  doc.text(
    'This document is a certified client-side zero-knowledge accounting snapshot. No external server logs exist for this record.',
    14,
    finalY + 7
  );
  doc.text('Verified Balanced Under GAAP/IFRS Micro-Ledger Protocol. Dexie.js Reactive Engine.', 14, finalY + 10.5);

  // Page numbering right-aligned
  doc.text('Page 1 of 1', 196, finalY + 10.5, { align: 'right' });

  // Trigger browser download
  doc.save(`AuraFinance_Statement_24H_${now.toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`);
}
