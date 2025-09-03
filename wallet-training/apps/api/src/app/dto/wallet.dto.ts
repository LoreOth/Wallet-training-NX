/**
 * DTOs con class-validator.
 * Buena prÃ¡ctica: validar inputs en el borde del sistema (controller) + pipes globales.
 */
import { IsString, IsIn, IsNumber, Min, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsString() userId!: string;
  @IsOptional() @IsString() name?: string;
}

export class CurrencyDto {
  @IsIn(["ARS", "USD"]) currency!: "ARS" | "USD";
}

export class TopUpDto extends CurrencyDto {
  @IsString() userId!: string;
  @IsNumber() @Min(0.01) amount!: number;
  @IsOptional() @IsString() idempotencyKey?: string;
}

export class TransferDto extends CurrencyDto {
  @IsString() fromUserId!: string;
  @IsString() toUserId!: string;
  @IsNumber() @Min(0.01) amount!: number;
  @IsOptional() @IsString() idempotencyKey?: string;
}
