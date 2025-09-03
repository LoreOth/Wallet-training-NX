/**
 * Dominio puro: lÃ³gica de ledger de doble entrada + idempotencia.
 * No depende de Nest, HTTP ni DB â†’ probabilidad alta de reutilizaciÃ³n y testabilidad.
 */
import { randomUUID } from "crypto";
import { BalanceResponse, Currency } from "@wallet-training/shared-dtos";
import type { StatementItem } from "./ports/wallet.port";

export type Entry = {
  id: string;
  accountKey: string;     // `${userId}:${currency}`
  amountSigned: number;   // +credito, -debito
  createdAt: string;
  trxId: string;          // agrupa entries (idempotencia)
  meta?: {
    kind: "TOPUP" | "TRANSFER_OUT" | "TRANSFER_IN";
    counterparty?: string;
  }
};

type User = { id: string; name?: string };

export class Ledger {
  private entries: Entry[] = [];
  private processedKeys = new Set<string>(); // idempotencia
  private users = new Map<string, User>();

  // === Users ===
  createUser(id: string, name?: string) {
    if (!id || !id.trim()) throw new Error("userId requerido");
    if (!this.users.has(id)) this.users.set(id, { id, name });
    return this.users.get(id)!;
  }
  listUsers(): User[] { return Array.from(this.users.values()); }

  // Helpers
  private accountKey(userId: string, currency: Currency) { return `${userId}:${currency}`; }

  // === Queries ===
  getBalance(userId: string, currency: Currency): BalanceResponse {
    const key = this.accountKey(userId, currency);
    const sum = this.entries
      .filter(e => e.accountKey === key)
      .reduce((acc, e) => acc + e.amountSigned, 0);
    return { userId, currency, balance: Number(sum.toFixed(2)) };
  }
  getBalances(userId: string): BalanceResponse[] {
    const currencies = new Set<Currency>();
    this.entries.forEach(e => {
      const [uid, cur] = e.accountKey.split(":");
      if (uid === userId) currencies.add(cur as Currency);
    });
    if (currencies.size === 0) ["ARS", "USD"].forEach(c => currencies.add(c as Currency));
    return Array.from(currencies.values())
      .map(c => this.getBalance(userId, c as Currency))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }
  getStatement(userId: string, currency: Currency, limit = 20): StatementItem[] {
    const key = this.accountKey(userId, currency);
    return this.entries
      .filter(e => e.accountKey === key)
      .slice(-limit)
      .reverse()
      .map(e => ({
        id: e.id,
        trxId: e.trxId,
        userId,
        currency,
        amountSigned: e.amountSigned,
        createdAt: e.createdAt,
        kind: e.meta?.kind ?? "TOPUP",
        counterparty: e.meta?.counterparty
      }));
  }

  // === Commands ===
  topUp(trxId: string, userId: string, amount: number, currency: Currency) {
    if (amount <= 0) throw new Error("Amount must be > 0");
    if (this.processedKeys.has(trxId)) return; // idempotente
    this.createUser(userId);

    const credit: Entry = {
      id: randomUUID(),
      accountKey: this.accountKey(userId, currency),
      amountSigned: amount,
      createdAt: new Date().toISOString(),
      trxId,
      meta: { kind: "TOPUP" }
    };
    this.entries.push(credit);
    this.processedKeys.add(trxId);
  }

  transfer(trxId: string, fromUserId: string, toUserId: string, amount: number, currency: Currency) {
    if (amount <= 0) throw new Error("Amount must be > 0");
    if (this.processedKeys.has(trxId)) return;

    this.createUser(fromUserId);
    this.createUser(toUserId);

    const fromBal = this.getBalance(fromUserId, currency).balance;
    if (fromBal < amount) throw new Error("Insufficient funds");

    const debit: Entry = {
      id: randomUUID(),
      accountKey: this.accountKey(fromUserId, currency),
      amountSigned: -amount,
      createdAt: new Date().toISOString(),
      trxId,
      meta: { kind: "TRANSFER_OUT", counterparty: toUserId }
    };
    const credit: Entry = {
      id: randomUUID(),
      accountKey: this.accountKey(toUserId, currency),
      amountSigned: amount,
      createdAt: new Date().toISOString(),
      trxId,
      meta: { kind: "TRANSFER_IN", counterparty: fromUserId }
    };
    this.entries.push(debit, credit);
    this.processedKeys.add(trxId);
  }
}

export const ledger = new Ledger();
