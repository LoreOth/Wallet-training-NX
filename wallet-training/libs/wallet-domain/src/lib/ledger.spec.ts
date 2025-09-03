import { ledger } from "./ledger";

describe("Ledger domain", () => {
  beforeEach(() => {
    // @ts-ignore - reset interno para tests (sÃ³lo demo)
    ledger["entries"] = [];
    // @ts-ignore
    ledger["processedKeys"] = new Set();
    // @ts-ignore
    ledger["users"] = new Map();
  });

  it("topUp crea crÃ©dito y respeta suma cero por tx (implÃ­cito en doble entrada futura)", () => {
    ledger.createUser("alice");
    ledger.topUp("trx1", "alice", 1000, "ARS");
    const bal = ledger.getBalance("alice", "ARS").balance;
    expect(bal).toBe(1000);
  });

  it("transfer debita y acredita correctamente", () => {
    ledger.createUser("alice");
    ledger.createUser("bob");
    ledger.topUp("trx1", "alice", 1000, "ARS");
    ledger.transfer("trx2", "alice", "bob", 400, "ARS");
    expect(ledger.getBalance("alice", "ARS").balance).toBe(600);
    expect(ledger.getBalance("bob", "ARS").balance).toBe(400);
  });

  it("idempotencia: misma trxId no duplica", () => {
    ledger.createUser("alice");
    ledger.topUp("trxX", "alice", 500, "ARS");
    ledger.topUp("trxX", "alice", 500, "ARS");
    expect(ledger.getBalance("alice", "ARS").balance).toBe(500);
  });

  it("no permite transferir sin fondos", () => {
    ledger.createUser("alice");
    ledger.createUser("bob");
    expect(() => ledger.transfer("t1", "alice", "bob", 1, "ARS")).toThrow(/Insufficient/);
  });
});
