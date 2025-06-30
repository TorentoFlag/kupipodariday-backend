import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(dto: CreateWishlistDto, owner: User) {
    const { itemsId, ...rest } = dto;

    const items = await this.wishesService.findMany(itemsId);

    const wishlist = this.wishlistRepository.create({
      items,
      owner,
      ...rest,
    });

    const savedWishlist = await this.wishlistRepository.save(wishlist);

    return this.findOne({ id: savedWishlist.id });
  }

  async findOne(where: FindOptionsWhere<Wishlist>) {
    const wishlist = await this.wishlistRepository.findOne({
      where,
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }

    return wishlist;
  }

  async findMany(where: FindOptionsWhere<Wishlist>) {
    return await this.wishlistRepository.find({
      where,
      relations: ['owner', 'items'],
    });
  }

  async updateOne(id: number, dto: UpdateWishlistDto, userId: number) {
    const wishlist = await this.findOne({ id });

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(
        'Вы не можете обновить чужой список желаний',
      );
    }

    const { itemsId = [], name, image } = dto;
    const items = await this.wishesService.findMany(itemsId);

    await this.wishlistRepository.save({
      ...wishlist,
      name,
      image,
      items,
    });

    return await this.findOne({ id });
  }

  async removeOne(id: number, userId: number) {
    const wishlist = await this.findOne({ id });

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужой список желаний');
    }

    return await this.wishlistRepository.remove(wishlist);
  }
}