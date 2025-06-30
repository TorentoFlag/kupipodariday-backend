import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findOwn(@GetCurrentUser('id') id: number) {
    return this.usersService.findOneBy({ id });
  }

  @Patch('me')
  async update(@GetCurrentUser('id') id: number, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(id, dto);
  }

  @Get('me/wishes')
  getOwnWishes(@GetCurrentUser('username') username: string) {
    return this.usersService.getUserWishes(username);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOneBy({ username });
  }

  @Get(':username/wishes')
  getWishes(@Param('username') username: string) {
    return this.usersService.getUserWishes(username);
  }

  @Post('find')
  findMany(@Body() dto: FindUsersDto) {
    return this.usersService.findMany(dto);
  }
}