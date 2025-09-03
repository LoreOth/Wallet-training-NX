/**
 * Adapter de salida (driven): implementaciÃ³n InMemory del Port usando el servicio de dominio (Ledger).
 * Esto permite swappear a otra implementaciÃ³n (Postgres/Redis) sin tocar el resto.
 */
import { ledger } from "@wallet-training/wallet-domain";
import type { WalletPort } from "@wallet-training/wallet-domain";
import type { BalanceResponse, Currency } from "@wallet-training/shared-dtos";

export class InMemoryWalletAdapter implements WalletPort {
  createUser(id: string, name?: string) { return ledger.createUser(id, name); }
  listUsers() { return ledger.listUsers(); }
  getBalance(userId: string, currency: Currency): BalanceResponse { return ledger.getBalance(userId, currency); }
  getBalances(userId: string) { return ledger.getBalances(userId); }
  getStatement(userId: string, currency: Currency, limit?: number) { return ledger.getStatement(userId, currency, limit); }
  topUp(userId: string, amount: number, currency: Currency, idemKey?: string) {
    ledger.topUp(idemKey ?? crypto.randomUUID(), userId, amount, currency);
    return ledger.getBalance(userId, currency);
  }
  transfer(fromUserId: string, toUserId: string, amount: number, currency: Currency, idemKey?: string) {
    ledger.transfer(idemKey ?? crypto.randomUUID(), fromUserId, toUserId, amount, currency);
    return { from: ledger.getBalance(fromUserId, currency), to: ledger.getBalance(toUserId, currency) };
  }
}
