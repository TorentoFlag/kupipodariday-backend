import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(dto: CreateWishDto, owner: User) {
    const wish = this.wishRepository.create({ ...dto, owner });
    return this.wishRepository.save(wish);
  }

  async findOne(where: FindOptionsWhere<Wish>) {
    const wish = await this.wishRepository.findOne({
      where,
      relations: ['owner', 'offers', 'offers.user'],
    });

    if (!wish) {
      throw new NotFoundException('Запрашиваемый ресурс не найден');
    }

    return wish;
  }

  async findTop() {
    return await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async findLast() {
    return await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async findMany(ids: number[]) {
    const wishes = await this.wishRepository.find({
      where: { id: In(ids) },
    });

    if (wishes.length !== ids.length) {
      throw new NotFoundException('Одно или несколько желаний не найдены');
    }

    return wishes;
  }

  async updateWish(id: number, dto: UpdateWishDto, userId: number) {
    const wish = await this.findOne({ id });

    if (wish.owner.id !== userId) throw new ForbiddenException();

    if ('price' in dto && dto.price !== wish.price && wish.raised > 0) {
      throw new BadRequestException('Нельзя менять цену при наличии заявок');
    }

    await this.wishRepository.update(id, dto);

    const updatedWish = await this.findOne({ id });

    return updatedWish;
  }

  async updateRaised(id: number, amount: number) {
    await this.wishRepository.update(id, { raised: amount });

    const updatedWish = await this.findOne({ id });

    return updatedWish;
  }

  async deleteWish(id: number, userId: number) {
    const wish = await this.findOne({ id });

    if (wish.owner.id !== userId) throw new ForbiddenException();

    return await this.wishRepository.remove(wish);
  }

  async copyWish(id: number, owner: User) {
    const wish = await this.findOne({ id });

    if (wish.owner.id === owner.id) {
      throw new ConflictException('Вы не можете скопировать свое желание');
    }

    const copiedWish = this.wishRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner,
      copied: 0,
      raised: 0,
    });

    wish.copied++;
    await this.wishRepository.save(wish);

    return await this.wishRepository.save(copiedWish);
  }
}