export type Currency = 'ARS' | 'USD';

export interface TopUpDto {
  userId: string;
  amount: number;
  currency: Currency;
}

export interface TransferDto {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: Currency;
  idempotencyKey?: string;
}

export interface BalanceResponse {
  userId: string;
  currency: Currency;
  balance: number;
}
