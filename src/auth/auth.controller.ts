import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    delete user.password;
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signin(@GetCurrentUser() user: { id: number, username: string }) {
    return this.authService.signIn(user);
  }
}