import {
  IsString,
  IsUrl,
  IsArray,
  IsInt,
  ArrayNotEmpty,
  Length,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsUrl()
  image: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  itemsId: number[];
}