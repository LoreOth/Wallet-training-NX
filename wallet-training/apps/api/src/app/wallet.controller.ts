import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { CreateUserDto, TopUpDto, TransferDto } from "./dto/wallet.dto";

@Controller("wallet")
export class WalletController {
  constructor(private readonly service: WalletService) {}

  // Users
  @Post("users")
  createUser(@Body() dto: CreateUserDto) { return this.service.createUser(dto.userId, dto.name); }
  @Get("users")
  listUsers() { return this.service.listUsers(); }

  // Balances / Statement
  @Get("balance/:userId/:currency")
  getBalance(@Param("userId") userId: string, @Param("currency") currency: any) {
    return this.service.balance(userId, currency);
  }
  @Get("balances/:userId")
  getBalances(@Param("userId") userId: string) { return this.service.balances(userId); }

  @Get("statement/:userId/:currency")
  getStatement(
    @Param("userId") userId: string,
    @Param("currency") currency: any,
    @Query("limit") limit?: string
  ) { return this.service.statement(userId, currency, limit ? Number(limit) : undefined); }

  // Movements
  @Post("topup")
  topUp(@Body() dto: TopUpDto) {
    return this.service.topUp(dto.userId, dto.amount, dto.currency, dto.idempotencyKey);
  }
  @Post("transfer")
  transfer(@Body() dto: TransferDto) {
    return this.service.transfer(dto.fromUserId, dto.toUserId, dto.amount, dto.currency, dto.idempotencyKey);
  }
}
