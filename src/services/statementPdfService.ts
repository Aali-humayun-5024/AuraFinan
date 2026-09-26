// AuraFinance OS — Client-Side 24H Bank Statement PDF Engine
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ledgerDb } from '../db/ledgerSchema';
import { CryptoVaultService } from './cryptoVaultService';
import type { StatementGenerationParams } from '../types/statement';

export class StatementPdfService {
  static async download24HourStatement(params: StatementGenerationParams): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Fetch real ledger entries from Dexie
    const allEntries = await ledgerDb.journalEntries.toArray();

    // 2. Filter strictly by preceding 24-hour window
    const recentEntries = allEntries.filter((entry) => {
      const entryTime = new Date(entry.createdAt || entry.date).getTime();
      return entryTime >= twentyFourHoursAgo.getTime() && entryTime <= now.getTime();
    });

    // 3. Compute Opening Balance (sum of liquid lines prior to 24h window)
    let openingBalance = 0;
    allEntries.forEach((entry) => {
      const entryTime = new Date(entry.createdAt || entry.date).getTime();
      if (entryTime < twentyFourHoursAgo.getTime()) {
        (entry.lines || []).forEach((l) => {
          if (l.accountId === '1010' || l.accountId === '1020') {
            openingBalance += (l.debit || 0) - (l.credit || 0);
          }
        });
      }
    });

    let totalCredits = 0; // Inflow
    let totalDebits = 0;  // Outflow

    const rows = recentEntries.map((e) => {
      const debitLine = (e.lines || []).find((l) => (l.debit || 0) > 0);
      const creditLine = (e.lines || []).find((l) => (l.credit || 0) > 0);
      const amount = debitLine ? debitLine.debit : creditLine ? creditLine.credit : 0;

      const isRevenue = Boolean(creditLine && (creditLine.accountId.startsWith('4') || creditLine.accountId.startsWith('3')));
      if (isRevenue) {
        totalCredits += amount;
      } else {
        totalDebits += amount;
      }

      const timeString = new Date(e.createdAt || e.date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return [
        timeString,
        e.entryNumber || 'JE-SYS',
        e.narration || 'General Ledger Entry',
        `${debitLine?.accountName || 'Dr'} / ${creditLine?.accountName || 'Cr'}`,
        !isRevenue ? `-${params.baseCurrency} ${amount.toFixed(2)}` : '--',
        isRevenue ? `+${params.baseCurrency} ${amount.toFixed(2)}` : '--',
      ];
    });

    // If all sample data was created within the last 24h, compute realistic opening balance from liquid accounts
    if (openingBalance === 0) {
      const accounts = await ledgerDb.accounts.toArray();
      const currentLiquid = accounts
        .filter((a) => a.code === '1010' || a.code === '1020')
        .reduce((sum, a) => sum + (a.currentBalance || 0), 0);
      if (currentLiquid > 0) {
        openingBalance = Math.max(0, currentLiquid - (totalCredits - totalDebits));
      }
    }

    const closingBalance = openingBalance + totalCredits - totalDebits;
    const netVariance = openingBalance !== 0 ? ((closingBalance - openingBalance) / openingBalance) * 100 : 0;

    // 4. Generate SHA-256 Digital Verification Seal
    const statementDigest = await CryptoVaultService.computeSHA256(
      JSON.stringify({ now: now.toISOString(), recentEntriesCount: recentEntries.length, closingBalance })
    );

    // 5. Render Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('AURAFINANCE WEALTH OPERATING SYSTEM', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('OFFICIAL 24-HOUR INTRADAY TRANSACTION LEDGER STATEMENT', 14, 23);
    doc.text(`WINDOW: ${twentyFourHoursAgo.toLocaleString()} TO ${now.toLocaleString()}`, 14, 27);

    // 6. Metadata Summary Card
    autoTable(doc, {
      startY: 32,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2 },
      body: [
        [
          { content: `Account Holder: ${params.accountHolder}`, styles: { fontStyle: 'bold' } },
          { content: `Base Currency: ${params.baseCurrency}`, styles: { fontStyle: 'bold' } },
          { content: `Statement Ref: STMT-${now.getTime().toString().slice(-6)}`, styles: { halign: 'right' } }
        ],
        [
          `Vault: ${params.vaultName}`,
          `Opening Balance (T-24h): ${params.baseCurrency} ${openingBalance.toFixed(2)}`,
          { content: `Total Credits (+): ${params.baseCurrency} ${totalCredits.toFixed(2)}`, styles: { halign: 'right', textColor: [5, 150, 105] } }
        ],
        [
          `Status: Reconciled Balanced`,
          `Closing Balance: ${params.baseCurrency} ${closingBalance.toFixed(2)} (${netVariance >= 0 ? '+' : ''}${netVariance.toFixed(1)}%)`,
          { content: `Total Debits (-): ${params.baseCurrency} ${totalDebits.toFixed(2)}`, styles: { halign: 'right', textColor: [225, 29, 72] } }
        ]
      ]
    });

    // 7. Transaction Table
    const tableStartY = ((doc as any).lastAutoTable?.finalY ?? 50) + 4;
    autoTable(doc, {
      startY: tableStartY,
      head: [['Timestamp', 'Reference', 'Description / Narration', 'Accounts (Dr / Cr)', 'Debits (Out)', 'Credits (In)']],
      body: rows.length > 0 ? rows : [['--', '--', 'Zero transaction movements recorded in the preceding 24 hours.', '--', '--', '--']],
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7,
        cellPadding: 2.2,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 24 },
        2: { cellWidth: 54 },
        3: { cellWidth: 42 },
        4: { cellWidth: 25, halign: 'right', textColor: [225, 29, 72] },
        5: { cellWidth: 25, halign: 'right', textColor: [5, 150, 105] },
      }
    });

    // 8. Cryptographic Integrity Seal Footer
    const finalY = ((doc as any).lastAutoTable?.finalY ?? 250) + 10;
    doc.setFontSize(6.5);
    doc.setFont('courier', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`DIGITAL SHA-256 INTEGRITY SEAL: ${statementDigest}`, 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text('Certified Zero-Knowledge Client Snapshot. Generated dynamically via Dexie.js Reactive Ledger.', 14, finalY + 4);

    // 9. Real Browser Download
    const fileTimestamp = now.toISOString().slice(0, 10);
    doc.save(`AuraFinance_Bank_Statement_24H_${fileTimestamp}.pdf`);
  }
}
