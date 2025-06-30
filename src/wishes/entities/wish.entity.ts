import { IsInt, IsNumber, IsUrl, Length, Min } from 'class-validator';
import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Wish extends BaseEntity {
  @Column({ length: 250 })
  @Length(1, 250)
  name: string;

  @Column({ type: 'text' })
  @IsUrl()
  link: string;

  @Column({ type: 'text' })
  @IsUrl()
  image: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  raised: number;

  @Column({ length: 1024 })
  @Length(1, 1024)
  description: string;

  @Column('int', { default: 0 })
  @IsInt()
  @Min(0)
  copied: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];
}