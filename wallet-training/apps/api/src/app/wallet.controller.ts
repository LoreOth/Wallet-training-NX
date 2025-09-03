import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Controller("wallet")
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Post("users")
  createUser(@Body() dto: { userId: string; name?: string }) {
    return this.service.createUser(dto.userId, dto.name);
  }

  @Get("users")
  listUsers() {
    return this.service.listUsers();
  }

  @Post("topup")
  topUp(@Body() dto: { userId: string; amount: number; currency: string }) {
    return this.service.topUp(dto.userId, dto.amount, dto.currency);
  }

  @Post("transfer")
  transfer(@Body() dto: { fromUserId: string; toUserId: string; amount: number; currency: string }) {
    return this.service.transfer(dto.fromUserId, dto.toUserId, dto.amount, dto.currency);
  }

  @Get("balance/:userId/:currency")
  balance(@Param("userId") userId: string, @Param("currency") currency: string) {
    return this.service.balancesOf(userId).find(b => b.currency === currency);
  }

  @Get("balances/:userId")
  balances(@Param("userId") userId: string) {
    return this.service.balancesOf(userId);
  }

  @Get("statement/:userId/:currency")
  statement(
    @Param("userId") userId: string,
    @Param("currency") currency: string,
    @Query("limit") limit?: string
  ) {
    return this.service.statement(userId, currency, limit ? Number(limit) : undefined);
  }
}
