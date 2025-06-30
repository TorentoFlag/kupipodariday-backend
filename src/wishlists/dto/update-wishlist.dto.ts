import {
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
  IsInt,
  Length,
} from 'class-validator';

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  @Length(1, 250)
  name?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  itemsId?: number[];
}