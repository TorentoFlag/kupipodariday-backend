import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(dto: CreateOfferDto, user: User) {
    const { itemId, amount } = dto;

    const wish = await this.wishesService.findOne({ id: itemId });

    if (wish.owner.id === user.id) {
      throw new BadRequestException(
        'Вы не можете скинуться на собственное желание',
      );
    }

    const raised = +wish.raised + +amount;

    if (raised > +wish.price) {
      throw new BadRequestException(
        'Сумма предложения превышает сумму, оставшуюся для сбора',
      );
    }

    await this.wishesService.updateRaised(itemId, raised);

    const offer = this.offerRepository.create({ ...dto, user, item: wish });

    return await this.offerRepository.save(offer);
  }

  async findOne(where: FindOptionsWhere<Offer>) {
    const offer = await this.offerRepository.findOne({
      where,
      relations: ['user', 'item'],
    });

    if (!offer) {
      throw new NotFoundException('Запрашиваемый ресурс не найден');
    }

    return offer;
  }

  async findMany(where: FindOptionsWhere<Offer>) {
    return await this.offerRepository.find({
      where,
      relations: ['item', 'user'],
    });
  }

  async updateOne(where: FindOptionsWhere<Offer>, data: Partial<Offer>) {
    const offer = await this.findOne(where);
    if (!offer) return null;
    Object.assign(offer, data);
    return await this.offerRepository.save(offer);
  }

  async removeOne(where: FindOptionsWhere<Offer>) {
    const offer = await this.findOne(where);
    if (!offer) return null;
    return await this.offerRepository.remove(offer);
  }
}