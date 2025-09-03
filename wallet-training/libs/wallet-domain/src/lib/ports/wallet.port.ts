/**
 * Port (interfaz) del dominio: expone lo que el "nÃºcleo" necesita/ofrece,
 * independizando la app de la tecnologÃ­a (DB, memoria, etc).
 * Buena prÃ¡ctica: el dominio define la interfaz; los adapters la implementan.
 */
import { BalanceResponse, Currency } from "@wallet-training/shared-dtos";

export type User = { id: string; name?: string };

export type StatementItem = {
  id: string;
  trxId: string;
  userId: string;
  currency: Currency;
  amountSigned: number;
  createdAt: string;
  kind: "TOPUP" | "TRANSFER_OUT" | "TRANSFER_IN";
  counterparty?: string;
};

export interface WalletPort {
  // Usuarios
  createUser(id: string, name?: string): User;
  listUsers(): User[];

  // Lecturas
  getBalance(userId: string, currency: Currency): BalanceResponse;
  getBalances(userId: string): BalanceResponse[];
  getStatement(userId: string, currency: Currency, limit?: number): StatementItem[];

  // Mutaciones
  topUp(userId: string, amount: number, currency: Currency, idemKey?: string): BalanceResponse;
  transfer(fromUserId: string, toUserId: string, amount: number, currency: Currency, idemKey?: string): {
    from: BalanceResponse;
    to: BalanceResponse;
  };
}
