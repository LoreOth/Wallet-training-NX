import { Module } from "@nestjs/common";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { InMemoryWalletAdapter } from "../infra/inmemory-wallet.adapter";

// Token de inyecciÃ³n para el Port
export const WALLET_PORT = "WALLET_PORT";

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    // Binding del Port â†’ Adapter (swap fÃ¡cil por otro adapter)
    { provide: WALLET_PORT, useClass: InMemoryWalletAdapter },
  ],
})
export class AppModule {}
