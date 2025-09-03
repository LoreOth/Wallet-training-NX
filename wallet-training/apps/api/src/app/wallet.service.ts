import { Injectable } from "@nestjs/common";

interface Balance {
  userId: string;
  currency: string;
  balance: number;
}

interface StatementItem {
  id: string;
  userId: string;
  currency: string;
  amount: number;
  type: "TOPUP" | "TRANSFER_IN" | "TRANSFER_OUT";
  counterparty?: string;
  createdAt: Date;
}

@Injectable()
export class WalletService {
  private users = new Set<string>();
  private balances: Balance[] = [];
  private statements: StatementItem[] = [];

  createUser(userId: string, name?: string) {
    this.users.add(userId);
    return { userId, name };
  }

  listUsers() {
    return Array.from(this.users).map(id => ({ id }));
  }

  private getBalance(userId: string, currency: string) {
    let b = this.balances.find(x => x.userId === userId && x.currency === currency);
    if (!b) {
      b = { userId, currency, balance: 0 };
      this.balances.push(b);
    }
    return b;
  }

  topUp(userId: string, amount: number, currency: string) {
    const bal = this.getBalance(userId, currency);
    bal.balance += amount;
    const item: StatementItem = {
      id: Math.random().toString(36).slice(2),
      userId,
      currency,
      amount,
      type: "TOPUP",
      createdAt: new Date(),
    };
    this.statements.push(item);
    return bal;
  }

  transfer(fromUserId: string, toUserId: string, amount: number, currency: string) {
    const fromBal = this.getBalance(fromUserId, currency);
    const toBal = this.getBalance(toUserId, currency);

    if (fromBal.balance < amount) throw new Error("Fondos insuficientes");

    fromBal.balance -= amount;
    toBal.balance += amount;

    this.statements.push({
      id: Math.random().toString(36).slice(2),
      userId: fromUserId,
      currency,
      amount: -amount,
      type: "TRANSFER_OUT",
      counterparty: toUserId,
      createdAt: new Date(),
    });
    this.statements.push({
      id: Math.random().toString(36).slice(2),
      userId: toUserId,
      currency,
      amount,
      type: "TRANSFER_IN",
      counterparty: fromUserId,
      createdAt: new Date(),
    });

    return { from: fromBal, to: toBal };
  }

  balancesOf(userId: string) {
    return this.balances.filter(b => b.userId === userId);
  }

  statement(userId: string, currency: string, limit = 10) {
    return this.statements
      .filter(s => s.userId === userId && s.currency === currency)
      .slice(-limit)
      .reverse();
  }
}
