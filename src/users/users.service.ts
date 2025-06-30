import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashService } from 'src/utils/hash.service';
import { FindOneOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(dto: CreateUserDto) {
    const { email, username, password } = dto;

    const existingUser = await this.userRepository.findOneBy([
      { email },
      { username },
    ]);

    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }

  async findOne(options: FindOneOptions<User>, withPassword = false) {
    const user = await this.userRepository.findOne(options);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!withPassword) {
      delete user.password;
    }

    return user;
  }

  async findOneBy(where: FindOptionsWhere<User>, withPassword = false) {
    const user = await this.userRepository.findOne({ where });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!withPassword) {
      delete user.password;
    }

    return user;
  }

  async findMany(dto: FindUsersDto) {
    const where: any = {};

    if (dto.username) where.username = Like(`%${dto.username}%`);
    if (dto.email) where.email = Like(`%${dto.email}%`);

    return await this.userRepository.find({ where });
  }

  async update(id: number, dto: UpdateUserDto) {
    const { password, username, email } = dto;

    if (username) {
      const usernameOwner = await this.userRepository.findOneBy({ username });

      if (usernameOwner && usernameOwner.id !== id) {
        throw new ConflictException(
          'Пользователь с таким username уже существует',
        );
      }
    }

    if (email) {
      const emailOwner = await this.userRepository.findOneBy({ email });

      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
    }

    if (password) {
      const hashedPassword = await this.hashService.hashPassword(password);
      await this.userRepository.update(id, {
        ...dto,
        password: hashedPassword,
      });
    } else {
      await this.userRepository.update(id, dto);
    }

    return this.findOneBy({ id });
  }

  async getUserWishes(username: string) {
    const user = await this.findOne({
      where: { username },
      relations: [
        'wishes',
        'wishes.offers',
        'wishes.offers.item',
        'wishes.offers.user',
        'wishes.offers.item.owner',
      ],
    });

    if (!user) {
      throw new NotFoundException(
        'Пользователь с указанным username не найден',
      );
    }

    return user.wishes || [];
  }
}