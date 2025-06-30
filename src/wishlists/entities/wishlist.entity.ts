import { IsUrl, Length } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class Wishlist extends BaseEntity {
  @Column({ length: 250 })
  @Length(1, 250)
  name: string;

  @Column({ length: 1500, nullable: true })
  @Length(0, 1500)
  description: string;

  @Column({ type: 'text' })
  @IsUrl()
  image: string;

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;

  @ManyToMany(() => Wish)
  @JoinTable()
  items: Wish[];
}