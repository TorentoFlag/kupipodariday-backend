import { IsBoolean, IsNumber, Min, IsInt, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount: number;

  @IsInt()
  itemId: number;

  @IsBoolean()
  @IsOptional()
  hidden: boolean;
}