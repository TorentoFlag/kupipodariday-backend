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

    const hashedPassword = await this.hashService.hashPassword(password);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      delete savedUser.password;
      return savedUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new NotFoundException('Пользователь с таким email или username уже зарегистрирован');
      }
      throw error;
    }
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

    try {
      const hashedPassword = await this.hashService.hashPassword(password);
      await this.userRepository.update(id, {
        ...dto,
        password: hashedPassword,
      });
      return this.findOneBy({ id });
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Пользователь с такими данными уже существует');
      }
      throw error;
    }


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