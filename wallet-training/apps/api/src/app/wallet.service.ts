/**
 * Capa de aplicaciÃ³n (use-cases). Orquesta el dominio vÃ­a el Port inyectado.
 * Buena prÃ¡ctica: la app depende de la interfaz (Port), no de la implementaciÃ³n.
 */
import { Inject, Injectable } from "@nestjs/common";
import type { Currency } from "@wallet-training/shared-dtos";
import type { WalletPort } from "@wallet-training/wallet-domain";
import { WALLET_PORT } from "./app.module";

@Injectable()
export class WalletService {
  constructor(@Inject(WALLET_PORT) private readonly port: WalletPort) {}

  // Users
  createUser(userId: string, name?: string) { return this.port.createUser(userId, name); }
  listUsers() { return this.port.listUsers(); }

  // Queries
  balance(userId: string, currency: Currency) { return this.port.getBalance(userId, currency); }
  balances(userId: string) { return this.port.getBalances(userId); }
  statement(userId: string, currency: Currency, limit?: number) { return this.port.getStatement(userId, currency, limit); }

  // Commands
  topUp(userId: string, amount: number, currency: Currency, idemKey?: string) {
    return this.port.topUp(userId, amount, currency, idemKey);
  }
  transfer(fromUserId: string, toUserId: string, amount: number, currency: Currency, idemKey?: string) {
    return this.port.transfer(fromUserId, toUserId, amount, currency, idemKey);
  }
}
