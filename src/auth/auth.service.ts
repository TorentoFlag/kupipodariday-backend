import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashService } from '../utils/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOneBy({ username }, true);

    if (
      !user ||
      !(await this.hashService.comparePassword(password, user.password))
    ) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return user;
  }

  async signIn(user: any) {
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }
}