// AuraFinance OS — "Hey Aura" Autonomous Voice Assistant Types
export type VoiceAssistantState = 
  | 'idle_listening'     // Background passive listening for "Hey Aura"
  | 'triggered_chime'    // Hotword detected, playing synthesized Web Audio chime
  | 'active_listening'   // HUD open, capturing command with live interim transcription
  | 'processing_ai'      // Classifying intent via Gemini / regex heuristics
  | 'speaking_response'  // Speaking back answer via SpeechSynthesis
  | 'error_state';       // Mic permission denied or recognition error

export type VoiceIntentType = 
  | 'LOG_INFLOW'          // e.g. "Log an inflow of 500 dollars from consulting"
  | 'LOG_OUTFLOW'         // e.g. "Bought groceries for 45 dollars cash"
  | 'QUERY_TRIAL_BALANCE' // e.g. "What is my trial balance?"
  | 'QUERY_NET_CASHFLOW'  // e.g. "What is my net cash flow position this week?"
  | 'QUERY_FINANCIAL_ADVICE' // e.g. "Can I afford dinner at an expensive restaurant tonight?"
  | 'UNKNOWN';

export interface ParsedVoiceCommand {
  intent: VoiceIntentType;
  rawTranscript: string;
  confidence: number;
  extractedData?: {
    amount?: number;
    currency?: string;
    sourceOrCategory?: string;
    accountCodeDebit?: string;
    accountCodeCredit?: string;
    accountNameDebit?: string;
    accountNameCredit?: string;
    narration?: string;
  };
  spokenResponse: string;
  suggestedActionName?: string;
}
