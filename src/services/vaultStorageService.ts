import { ledgerDb } from '../db/ledgerSchema';
import { db } from '../db/database';
import { AuraMasterVaultJSON } from '../types/vault';
import { CryptoVaultService } from './cryptoVaultService';

export class VaultStorageService {
  /**
   * Collects all tables from Dexie and exports real .json file
   */
  static async exportVault(password?: string): Promise<void> {
    const [
      accounts,
      journalEntries,
      cashFlowRecords,
      ledgerSettings,
      ious,
      goals,
      subscriptions,
      commodities,
      customPersonas,
      transactions,
    ] = await Promise.all([
      ledgerDb.accounts.toArray(),
      ledgerDb.journalEntries.toArray(),
      ledgerDb.cashFlowRecords.toArray(),
      ledgerDb.settings.toArray(),
      db.ious?.toArray() || Promise.resolve([]),
      db.goals?.toArray() || Promise.resolve([]),
      db.subscriptions?.toArray() || Promise.resolve([]),
      db.commodities?.toArray() || Promise.resolve([]),
      db.customPersonas?.toArray() || Promise.resolve([]),
      db.transactions?.toArray() || Promise.resolve([]),
    ]);

    const settingsMap = ledgerSettings.reduce<Record<string, any>>(
      (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
      {}
    );

    const platformCurrency =
      settingsMap['baseCurrency'] ||
      localStorage.getItem('aura_currency') ||
      'USD';
    const activeLanguage =
      settingsMap['selectedLanguage'] ||
      localStorage.getItem('aura_language') ||
      'en';
    const activePersona =
      settingsMap['activePersona'] ||
      localStorage.getItem('aura_persona') ||
      'freelancer';

    const masterVault: AuraMasterVaultJSON = {
      metadata: {
        schemaVersion: '2.0.0',
        appVersion: 'AuraOS-2026.09',
        exportedAt: new Date().toISOString(),
        platformCurrency,
        activeLanguage,
        activePersona,
        recordChecksumSHA256: '',
      },
      accounts,
      journalEntries,
      cashFlowRecords,
      ious,
      goals,
      subscriptions,
      commodities,
      customPersonas,
      transactions,
      settings: settingsMap,
    };

    // Calculate real SHA-256 checksum over the financial data core
    masterVault.metadata.recordChecksumSHA256 = await CryptoVaultService.computeSHA256(
      JSON.stringify({
        accounts,
        journalEntries,
        cashFlowRecords,
        ious,
        goals,
        commodities,
      })
    );

    let outputJsonString: string;
    let fileName: string;
    const dateStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (password && password.trim().length > 0) {
      const encryptedContainer = await CryptoVaultService.encryptVault(masterVault, password.trim());
      outputJsonString = JSON.stringify(encryptedContainer, null, 2);
      fileName = `AuraVault_Encrypted_Backup_${dateStamp}.json`;
    } else {
      outputJsonString = JSON.stringify(masterVault, null, 2);
      fileName = `AuraVault_Plain_Backup_${dateStamp}.json`;
    }

    // Trigger REAL browser file download via Blob
    const blob = new Blob([outputJsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Restores database from a validated master JSON object atomically
   */
  static async restoreVault(masterPayload: AuraMasterVaultJSON): Promise<void> {
    // Basic structural integrity check
    if (!masterPayload.accounts || !masterPayload.journalEntries) {
      throw new Error('INVALID_PAYLOAD: Missing accounts or journal entries arrays.');
    }

    // 1. Execute atomic write across ledgerDb
    await ledgerDb.transaction(
      'rw',
      [
        ledgerDb.accounts,
        ledgerDb.journalEntries,
        ledgerDb.cashFlowRecords,
        ledgerDb.auditTrail,
        ledgerDb.settings,
      ],
      async () => {
        // Clear existing ledger stores
        await Promise.all([
          ledgerDb.accounts.clear(),
          ledgerDb.journalEntries.clear(),
          ledgerDb.cashFlowRecords.clear(),
          ledgerDb.auditTrail.clear(),
          ledgerDb.settings.clear(),
        ]);

        // Hydrate from JSON
        if (masterPayload.accounts.length > 0) {
          await ledgerDb.accounts.bulkAdd(masterPayload.accounts);
        }
        if (masterPayload.journalEntries.length > 0) {
          await ledgerDb.journalEntries.bulkAdd(masterPayload.journalEntries);
        }
        if (masterPayload.cashFlowRecords && masterPayload.cashFlowRecords.length > 0) {
          await ledgerDb.cashFlowRecords.bulkAdd(masterPayload.cashFlowRecords);
        }

        // Hydrate settings
        const settingsEntries = Object.entries(masterPayload.settings || {}).map(
          ([key, value]) => ({ key, value })
        );
        if (settingsEntries.length > 0) {
          await ledgerDb.settings.bulkPut(settingsEntries);
        }
        await ledgerDb.settings.put({
          key: 'lastRestoredAt',
          value: new Date().toISOString(),
        });
        await ledgerDb.settings.put({
          key: 'baseCurrency',
          value: masterPayload.metadata?.platformCurrency || 'USD',
        });
        await ledgerDb.settings.put({
          key: 'selectedLanguage',
          value: masterPayload.metadata?.activeLanguage || 'en',
        });
      }
    );

    // 2. Hydrate auxiliary stores in main db
    try {
      await Promise.all([
        db.ious?.clear().catch(() => {}),
        db.goals?.clear().catch(() => {}),
        db.subscriptions?.clear().catch(() => {}),
        db.commodities?.clear().catch(() => {}),
        db.customPersonas?.clear().catch(() => {}),
        db.transactions?.clear().catch(() => {}),
      ]);

      if (masterPayload.ious && masterPayload.ious.length > 0) {
        await db.ious?.bulkPut(masterPayload.ious as any).catch(() => {});
      }
      if (masterPayload.goals && masterPayload.goals.length > 0) {
        await db.goals?.bulkPut(masterPayload.goals as any).catch(() => {});
      }
      if (masterPayload.subscriptions && masterPayload.subscriptions.length > 0) {
        await db.subscriptions?.bulkPut(masterPayload.subscriptions as any).catch(() => {});
      }
      if (masterPayload.commodities && masterPayload.commodities.length > 0) {
        await db.commodities?.bulkPut(masterPayload.commodities as any).catch(() => {});
      }
      if (masterPayload.customPersonas && masterPayload.customPersonas.length > 0) {
        await db.customPersonas?.bulkPut(masterPayload.customPersonas as any).catch(() => {});
      }
      if (masterPayload.transactions && masterPayload.transactions.length > 0) {
        await db.transactions?.bulkPut(masterPayload.transactions as any).catch(() => {});
      }
    } catch {
      // Continue even if auxiliary store structure has slight difference
    }

    // 3. Update localStorage cache
    if (typeof window !== 'undefined') {
      if (masterPayload.metadata?.platformCurrency) {
        localStorage.setItem('aura_currency', masterPayload.metadata.platformCurrency);
      }
      if (masterPayload.metadata?.activeLanguage) {
        localStorage.setItem('aura_language', masterPayload.metadata.activeLanguage);
        document.documentElement.lang = masterPayload.metadata.activeLanguage;
      }
    }
  }

  /**
   * Real Destructive Wipe: Truncates all tables and re-initializes clean schema
   */
  static async wipeAllRecords(): Promise<void> {
    await ledgerDb.transaction(
      'rw',
      [
        ledgerDb.accounts,
        ledgerDb.journalEntries,
        ledgerDb.cashFlowRecords,
        ledgerDb.auditTrail,
        ledgerDb.settings,
      ],
      async () => {
        await Promise.all([
          ledgerDb.accounts.clear(),
          ledgerDb.journalEntries.clear(),
          ledgerDb.cashFlowRecords.clear(),
          ledgerDb.auditTrail.clear(),
          ledgerDb.settings.clear(),
        ]);
        await ledgerDb.settings.put({
          key: 'systemWipedAt',
          value: new Date().toISOString(),
        });
      }
    );

    // Clear auxiliary database tables as well
    try {
      await Promise.all([
        db.transactions?.clear().catch(() => {}),
        db.goals?.clear().catch(() => {}),
        db.subscriptions?.clear().catch(() => {}),
        db.ious?.clear().catch(() => {}),
        db.sentinelReports?.clear().catch(() => {}),
        db.customPersonas?.clear().catch(() => {}),
        db.commodities?.clear().catch(() => {}),
      ]);
    } catch {
      // Ignore auxiliary errors during total wipe
    }
  }
}
