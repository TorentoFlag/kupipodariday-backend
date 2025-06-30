import { IsOptional, IsString, IsEmail } from 'class-validator';

export class FindUsersDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}