// AuraFinance OS — Gemini 2.0 / Flash Voice Intent Parser with Deterministic CPA Heuristics
import { ledgerDb } from '../db/ledgerSchema';
import { generateTrialBalance } from './financialReportGen';
import { useAppStore } from '../store/useAppStore';
import { getActiveGeminiKey } from './geminiKeyConfig';
import type { ParsedVoiceCommand, VoiceIntentType } from '../types/voice';

export class VoiceIntentParserService {
  /**
   * Main entry point: Parses user voice transcript with Gemini with embedded fallback
   */
  async parseCommand(rawTranscript: string): Promise<ParsedVoiceCommand> {
    const text = rawTranscript.trim();
    if (!text) {
      return {
        intent: 'UNKNOWN',
        rawTranscript: '',
        confidence: 0,
        spokenResponse: 'I did not catch that. Please speak a command or question.',
      };
    }

    const apiKey = useAppStore.getState().geminiApiKey || getActiveGeminiKey();
    if (apiKey && apiKey.trim().length > 5) {
      try {
        const aiResult = await this.parseWithGemini(text, apiKey);
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn('Gemini voice intent parsing failed, falling back to heuristics:', err);
      }
    }

    return this.parseWithDeterministicHeuristics(text);
  }

  /**
   * Gemini 2.0 / 1.5 Flash structured intent classifier
   */
  private async parseWithGemini(rawTranscript: string, apiKey: string): Promise<ParsedVoiceCommand | null> {
    const accounts = await ledgerDb.accounts.toArray();
    const trialBalance = await generateTrialBalance();
    const cashflows = await ledgerDb.cashFlowRecords.toArray();

    const cashAccount = accounts.find((a) => a.code === '1010')?.currentBalance || 0;
    const bankAccount = accounts.find((a) => a.code === '1020')?.currentBalance || 0;
    const totalLiquidCash = cashAccount + bankAccount;

    const totalInflows = cashflows.filter((c) => c.type === 'inflow').reduce((s, c) => s + c.amount, 0);
    const totalOutflows = cashflows.filter((c) => c.type === 'outflow').reduce((s, c) => s + c.amount, 0);
    const netCashPosition = totalInflows - totalOutflows;

    const systemPrompt = `You are "Aura", an autonomous CPA-grade wealth copilot.
Classify the user voice command and return ONLY a valid JSON object matching this schema:
{
  "intent": "LOG_INFLOW" | "LOG_OUTFLOW" | "QUERY_TRIAL_BALANCE" | "QUERY_NET_CASHFLOW" | "QUERY_FINANCIAL_ADVICE" | "UNKNOWN",
  "rawTranscript": "${rawTranscript}",
  "confidence": 0.95,
  "extractedData": {
    "amount": 500,
    "currency": "USD",
    "sourceOrCategory": "string",
    "accountCodeDebit": "string (e.g. 1010, 1020, 5020)",
    "accountCodeCredit": "string (e.g. 1010, 4010)",
    "narration": "string"
  },
  "spokenResponse": "Crisp, professional single-sentence answer to be spoken aloud to user",
  "suggestedActionName": "string"
}

Financial Context:
- Liquid Cash: $${totalLiquidCash.toLocaleString()} (Cash on Hand: $${cashAccount}, Bank: $${bankAccount})
- Trial Balance: Debits $${trialBalance.totalDebits.toLocaleString()}, Credits $${trialBalance.totalCredits.toLocaleString()}, IsBalanced: ${trialBalance.isBalanced}
- Net Cashflow: Inflows $${totalInflows.toLocaleString()}, Outflows $${totalOutflows.toLocaleString()}, Net: $${netCashPosition.toLocaleString()}

Available Account Codes:
- 1010 Cash on Hand (Asset)
- 1020 Bank Operating Account (Asset)
- 2010 Accounts Payable (Liability)
- 3010 Owner's Capital (Equity)
- 4010 Sales / Consulting Revenue (Revenue)
- 5010 COGS, 5020 Food & Dining, 5030 Office Supplies & SaaS, 5040 Utilities, 5050 Travel (Expenses)

Rules for Journal Entries:
- LOG_INFLOW: Debit 1010 or 1020, Credit 4010.
- LOG_OUTFLOW: Debit expense (5010-5050), Credit 1010.
- For advice queries, evaluate if user can afford it given liquid cash of $${totalLiquidCash}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Voice Input: "${rawTranscript}"` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText) as ParsedVoiceCommand;
    parsed.rawTranscript = rawTranscript;
    return parsed;
  }

  /**
   * Deterministic local heuristic parser when offline or without Gemini API key
   */
  async parseWithDeterministicHeuristics(rawTranscript: string): Promise<ParsedVoiceCommand> {
    const text = rawTranscript.toLowerCase().trim();

    // 1. Check for Trial Balance Query
    if (
      text.includes('trial balance') ||
      text.includes('balance sheet') ||
      text.includes('debit and credit') ||
      text.includes('balanced')
    ) {
      const tb = await generateTrialBalance();
      const balancePhrase = tb.isBalanced
        ? `perfectly balanced with total debits and credits both equal to $${tb.totalDebits.toLocaleString()}`
        : `unbalanced with total debits of $${tb.totalDebits.toLocaleString()} and total credits of $${tb.totalCredits.toLocaleString()}`;

      return {
        intent: 'QUERY_TRIAL_BALANCE',
        rawTranscript,
        confidence: 0.98,
        spokenResponse: `Your trial balance is ${balancePhrase}.`,
        suggestedActionName: 'Inspect Trial Balance Ledger',
      };
    }

    // 2. Check for Net Cash Flow Query
    if (
      text.includes('cash flow') ||
      text.includes('net cash') ||
      text.includes('net position') ||
      text.includes('liquidity')
    ) {
      const records = await ledgerDb.cashFlowRecords.toArray();
      const totalInflows = records.filter((r) => r.type === 'inflow').reduce((s, r) => s + r.amount, 0);
      const totalOutflows = records.filter((r) => r.type === 'outflow').reduce((s, r) => s + r.amount, 0);
      const net = totalInflows - totalOutflows;

      return {
        intent: 'QUERY_NET_CASHFLOW',
        rawTranscript,
        confidence: 0.96,
        spokenResponse: `Your net cash flow position is ${net >= 0 ? 'positive' : 'negative'} at $${Math.abs(net).toLocaleString()}, with total inflows of $${totalInflows.toLocaleString()} and outflows of $${totalOutflows.toLocaleString()}.`,
        suggestedActionName: 'View Cash Flow Waterfall',
      };
    }

    // 3. Check for Financial Advice / Can I afford query
    if (
      text.includes('can i afford') ||
      text.includes('afford') ||
      text.includes('should i buy') ||
      text.includes('dinner') ||
      text.includes('restaurant') ||
      text.includes('budget for')
    ) {
      const accounts = await ledgerDb.accounts.toArray();
      const cash = (accounts.find((a) => a.code === '1010')?.currentBalance || 0) +
        (accounts.find((a) => a.code === '1020')?.currentBalance || 0);

      const amountMatch = text.match(/(\d[\d,]*\.?\d*)/);
      const estimatedCost = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 120;

      let advice = '';
      if (cash > estimatedCost * 5) {
        advice = `Yes, you have $${cash.toLocaleString()} in liquid cash reserves, comfortably exceeding the estimated expense of $${estimatedCost.toLocaleString()}. Enjoy your evening!`;
      } else {
        advice = `Caution recommended. Your liquid reserves stand at $${cash.toLocaleString()}. An expense of $${estimatedCost.toLocaleString()} represents a notable portion of your discretionary runway.`;
      }

      return {
        intent: 'QUERY_FINANCIAL_ADVICE',
        rawTranscript,
        confidence: 0.94,
        spokenResponse: advice,
        suggestedActionName: 'Review Discretionary Budget',
      };
    }

    // Extract numerical amount for Inflow / Outflow logging
    const amountMatch = text.match(/(\d[\d,]*\.?\d*)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    // 4. Check for Inflow Command
    if (
      text.includes('inflow') ||
      text.includes('received') ||
      text.includes('earned') ||
      text.includes('deposit') ||
      text.includes('client paid') ||
      text.includes('revenue')
    ) {
      const finalAmount = amount > 0 ? amount : 500;
      return {
        intent: 'LOG_INFLOW',
        rawTranscript,
        confidence: 0.95,
        extractedData: {
          amount: finalAmount,
          currency: 'USD',
          sourceOrCategory: 'Sales / Consulting Revenue',
          accountCodeDebit: '1010',
          accountCodeCredit: '4010',
          accountNameDebit: 'Cash on Hand',
          accountNameCredit: 'Sales / Consulting Revenue',
          narration: `Voice Recorded Inflow: ${rawTranscript}`,
        },
        spokenResponse: `Recording cash inflow of $${finalAmount.toLocaleString()} balanced against Consulting Revenue.`,
        suggestedActionName: 'Post Inflow Journal Entry',
      };
    }

    // 5. Check for Outflow Command
    if (
      text.includes('outflow') ||
      text.includes('spent') ||
      text.includes('bought') ||
      text.includes('paid') ||
      text.includes('purchased') ||
      text.includes('expense') ||
      text.includes('groceries')
    ) {
      const finalAmount = amount > 0 ? amount : 45;

      let debitCode = '5020';
      let debitName = 'Food & Dining Expense';
      if (text.includes('groceries') || text.includes('food') || text.includes('dining') || text.includes('lunch') || text.includes('dinner')) {
        debitCode = '5020';
        debitName = 'Food & Dining Expense';
      } else if (text.includes('supplies') || text.includes('software') || text.includes('subscription') || text.includes('saas') || text.includes('aws')) {
        debitCode = '5030';
        debitName = 'Office Supplies & SaaS';
      } else if (text.includes('electricity') || text.includes('utility') || text.includes('bill') || text.includes('rent')) {
        debitCode = '5040';
        debitName = 'Utilities & Living';
      } else if (text.includes('uber') || text.includes('gas') || text.includes('travel') || text.includes('flight') || text.includes('fuel')) {
        debitCode = '5050';
        debitName = 'Travel & Transit';
      }

      return {
        intent: 'LOG_OUTFLOW',
        rawTranscript,
        confidence: 0.95,
        extractedData: {
          amount: finalAmount,
          currency: 'USD',
          sourceOrCategory: debitName,
          accountCodeDebit: debitCode,
          accountCodeCredit: '1010',
          accountNameDebit: debitName,
          accountNameCredit: 'Cash on Hand',
          narration: `Voice Recorded Expense: ${rawTranscript}`,
        },
        spokenResponse: `Recording expense of $${finalAmount.toLocaleString()} for ${debitName} balanced from Cash on Hand.`,
        suggestedActionName: 'Post Outflow Journal Entry',
      };
    }

    // 6. Default UNKNOWN / Guidance
    return {
      intent: 'UNKNOWN',
      rawTranscript,
      confidence: 0.5,
      spokenResponse: `I heard "${rawTranscript}". You can say "Log an inflow of 500 dollars", "Bought groceries for 45 dollars", or "What is my trial balance?".`,
      suggestedActionName: 'Voice Assistant Guidance',
    };
  }
}

export const voiceIntentParser = new VoiceIntentParserService();
