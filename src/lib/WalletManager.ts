export type WalletType = 'main' | 'savings' | 'dev';

export interface SmartWallet {
  id: string;
  address: `0x${string}`;
  name: string;
  type: WalletType;
  ownerId: string;
  balance: {
    native: string;
    tokens: Record<string, string>;
  };
  isDeployed: boolean;
  createdAt: number;
}

export interface TransactionRequest {
  to: `0x${string}`;
  value: string; // ETH amount
  data?: `0x${string}`;
}

export interface GaslessQuote {
  eligible: boolean;
  sponsorName?: string;
  feeToken?: string;
  reason?: string;
}

export interface RecoveryConfig {
  method: 'social' | 'biometric' | 'guardian';
  guardians?: string[];
  lastUpdated: number;
}