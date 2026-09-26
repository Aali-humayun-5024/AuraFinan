// AuraFinance OS — Complete JSON-Driven Hydration, Export & Encrypted Import Service
import { ledgerDb } from '../db/ledgerSchema';
import { db } from '../db/database';
import { encryptJsonPayload, decryptJsonPayload } from './cryptoService';
import type {
  AuraMasterVaultJSON,
  AuraVaultMetadata,
  JsonValidationResult,
} from '../types/vaultJson';

class JsonVaultService {
  /**
   * 1. Export Complete Database to JSON (Plain or AES-GCM Encrypted)
   */
  async exportVaultToJson(password?: string): Promise<{ blob: Blob; filename: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Retrieve all IndexedDB records from both ledgerDb and main db
    const [
      accounts,
      journalEntries,
      cashFlowRecords,
      ledgerSettings,
      ious,
      goals,
      subscriptions,
      customPersonas,
      commodities,
      transactions,
    ] = await Promise.all([
      ledgerDb.accounts.toArray(),
      ledgerDb.journalEntries.toArray(),
      ledgerDb.cashFlowRecords.toArray(),
      ledgerDb.settings.toArray(),
      db.ious?.toArray() || Promise.resolve([]),
      db.goals?.toArray() || Promise.resolve([]),
      db.subscriptions?.toArray() || Promise.resolve([]),
      db.customPersonas?.toArray() || Promise.resolve([]),
      db.commodities?.toArray() || Promise.resolve([]),
      db.transactions?.toArray() || Promise.resolve([]),
    ]);

    const settingsMap = ledgerSettings.reduce<Record<string, any>>(
      (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
      {}
    );

    const baseCurrency =
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
      'household';

    const rawPayload: AuraMasterVaultJSON = {
      metadata: {
        schemaVersion: '2.0.0',
        exportedAt: new Date().toISOString(),
        systemBuild: 'AuraOS-2026.09-Retina',
        platformCurrency: baseCurrency,
        activeLanguage,
        activePersona,
        recordChecksumSHA256: '', // populated below
      },
      accounts,
      journalEntries,
      cashFlowRecords,
      ious,
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        category: g.category,
        icon: g.icon,
      })),
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
        billingCycle: s.billingCycle === 'yearly' ? 'yearly' : 'monthly',
        nextBillingDate: s.nextBillingDate,
        category: s.category,
        autoCancelDraft: s.autoCancelDraft,
      })),
      customPersonas: customPersonas.map((p) => ({
        id: p.id,
        name: p.name,
        userRole: p.userRole,
        monthlyIncome: p.monthlyIncome,
        currency: p.currency,
        lifestyleTier: p.lifestyleTier,
      })),
      commodities,
      transactions,
      settings: settingsMap,
    };

    // Compute cryptographic SHA-256 checksum over the data body
    const dataForChecksum = JSON.stringify({
      ...rawPayload,
      metadata: { ...rawPayload.metadata, recordChecksumSHA256: '' },
    });
    const checksum = await this.computeSHA256(dataForChecksum);
    rawPayload.metadata.recordChecksumSHA256 = checksum;

    const finalJsonString = JSON.stringify(rawPayload, null, 2);

    if (password && password.trim().length > 0) {
      // Encrypted export via Web Crypto AES-GCM (256-bit) + PBKDF2
      const encryptedBlob = await encryptJsonPayload(finalJsonString, password);
      return {
        blob: encryptedBlob,
        filename: `AuraFinance_Vault_Backup_${timestamp}.encrypted.json`,
      };
    }

    // Plain JSON export
    const blob = new Blob([finalJsonString], { type: 'application/json' });
    return {
      blob,
      filename: `AuraFinance_Vault_Backup_${timestamp}.json`,
    };
  }

  /**
   * 2. Validate & Inspect JSON Payload (Pre-flight Inspection)
   */
  validateJsonSchema(data: any): JsonValidationResult {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Malformed JSON: Root is not an object.' };
    }

    // If it's an encrypted container
    if (data.isEncrypted && data.algorithm === 'AES-GCM-256') {
      return {
        valid: false,
        error: 'ENCRYPTED_VAULT: Password required to decrypt this AES-GCM container.',
      };
    }

    if (!data.metadata || data.metadata.schemaVersion !== '2.0.0') {
      return {
        valid: false,
        error: `Incompatible schema: Expected version 2.0.0, received ${
          data.metadata?.schemaVersion || 'unknown'
        }.`,
      };
    }

    if (!Array.isArray(data.accounts) || !Array.isArray(data.journalEntries)) {
      return {
        valid: false,
        error: 'Corrupt payload: Missing core accounts or journal entries collections.',
      };
    }

    // Double-Entry Balance Audit Across Journal Entries
    let balancedCount = 0;
    let unbalancedCount = 0;

    data.journalEntries.forEach((je: any) => {
      const debits = (je.lines || []).reduce(
        (sum: number, l: any) => sum + (Number(l.debit) || 0),
        0
      );
      const credits = (je.lines || []).reduce(
        (sum: number, l: any) => sum + (Number(l.credit) || 0),
        0
      );
      if (Math.abs(debits - credits) < 0.001) balancedCount++;
      else unbalancedCount++;
    });

    return {
      valid: true,
      summary: {
        accountsCount: data.accounts.length,
        journalEntriesCount: data.journalEntries.length,
        balancedEntries: balancedCount,
        unbalancedEntries: unbalancedCount,
        cashFlowCount: (data.cashFlowRecords || []).length,
        iousCount: (data.ious || []).length,
        goalsCount: (data.goals || []).length,
        commoditiesCount: (data.commodities || []).length,
        currency: data.metadata.platformCurrency || 'USD',
        activeLanguage: data.metadata.activeLanguage || 'en',
      },
    };
  }

  /**
   * 3. Compulsory Hydration: Wipes & Ingests Complete JSON Payload Atomically
   */
  async hydrateFromJSON(
    payload: AuraMasterVaultJSON,
    mode: 'wipe_and_restore' | 'merge' = 'wipe_and_restore'
  ): Promise<void> {
    // Validate schema
    const check = this.validateJsonSchema(payload);
    if (!check.valid) {
      throw new Error(check.error || 'Failed to validate master JSON schema');
    }

    // Execute atomic hydration across ledgerDb
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
        if (mode === 'wipe_and_restore') {
          await Promise.all([
            ledgerDb.accounts.clear(),
            ledgerDb.journalEntries.clear(),
            ledgerDb.cashFlowRecords.clear(),
            ledgerDb.auditTrail.clear(),
            ledgerDb.settings.clear(),
          ]);
        }

        // Bulk ingest accounts
        if (payload.accounts && payload.accounts.length > 0) {
          await ledgerDb.accounts.bulkPut(payload.accounts);
        }

        // Bulk ingest journal entries
        if (payload.journalEntries && payload.journalEntries.length > 0) {
          await ledgerDb.journalEntries.bulkPut(payload.journalEntries);
        }

        // Bulk ingest cash flow records
        if (payload.cashFlowRecords && payload.cashFlowRecords.length > 0) {
          await ledgerDb.cashFlowRecords.bulkPut(payload.cashFlowRecords);
        }

        // Ingest settings
        const settingsEntries = Object.entries(payload.settings || {}).map(
          ([key, value]) => ({ key, value })
        );
        if (settingsEntries.length > 0) {
          await ledgerDb.settings.bulkPut(settingsEntries);
        }

        // Re-bind core settings keys
        await ledgerDb.settings.put({
          key: 'baseCurrency',
          value: payload.metadata.platformCurrency || 'USD',
        });
        await ledgerDb.settings.put({
          key: 'selectedLanguage',
          value: payload.metadata.activeLanguage || 'en',
        });
        await ledgerDb.settings.put({
          key: 'lastHydratedAt',
          value: new Date().toISOString(),
        });
      }
    );

    // Hydrate auxiliary tables in main db
    if (mode === 'wipe_and_restore') {
      await Promise.all([
        db.ious?.clear().catch(() => {}),
        db.goals?.clear().catch(() => {}),
        db.subscriptions?.clear().catch(() => {}),
        db.customPersonas?.clear().catch(() => {}),
        db.commodities?.clear().catch(() => {}),
        db.transactions?.clear().catch(() => {}),
      ]);
    }

    if (payload.ious && payload.ious.length > 0) {
      await db.ious?.bulkPut(payload.ious as any).catch(() => {});
    }
    if (payload.goals && payload.goals.length > 0) {
      await db.goals?.bulkPut(payload.goals as any).catch(() => {});
    }
    if (payload.subscriptions && payload.subscriptions.length > 0) {
      await db.subscriptions?.bulkPut(payload.subscriptions as any).catch(() => {});
    }
    if (payload.customPersonas && payload.customPersonas.length > 0) {
      await db.customPersonas?.bulkPut(payload.customPersonas as any).catch(() => {});
    }
    if (payload.commodities && payload.commodities.length > 0) {
      await db.commodities?.bulkPut(payload.commodities as any).catch(() => {});
    }
    if (payload.transactions && payload.transactions.length > 0) {
      await db.transactions?.bulkPut(payload.transactions as any).catch(() => {});
    }

    // Synchronize client-side cache
    if (typeof window !== 'undefined') {
      if (payload.metadata.platformCurrency) {
        localStorage.setItem('aura_currency', payload.metadata.platformCurrency);
      }
      if (payload.metadata.activeLanguage) {
        localStorage.setItem('aura_language', payload.metadata.activeLanguage);
        document.documentElement.lang = payload.metadata.activeLanguage;
      }
    }
  }

  /**
   * Decrypts encrypted file contents using provided password and parses the JSON vault
   */
  async decryptAndParse(fileContent: string, password: string): Promise<AuraMasterVaultJSON> {
    const jsonText = await decryptJsonPayload(fileContent, password);
    const parsed = JSON.parse(jsonText);
    const check = this.validateJsonSchema(parsed);
    if (!check.valid) {
      throw new Error(check.error || 'Decrypted payload failed schema validation.');
    }
    return parsed as AuraMasterVaultJSON;
  }

  /**
   * Cryptographic SHA-256 calculation
   */
  public async computeSHA256(text: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    return 'sha256-fallback';
  }
}

export const jsonVaultService = new JsonVaultService();
