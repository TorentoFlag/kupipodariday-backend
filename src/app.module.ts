import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { Offer } from './offers/entities/offer.entity';
import { OffersModule } from './offers/offers.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { HashModule } from './utils/hash.module';
import { Wish } from './wishes/entities/wish.entity';
import { WishesModule } from './wishes/wishes.module';
import { Wishlist } from './wishlists/entities/wishlist.entity';
import { WishlistsModule } from './wishlists/wishlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: parseInt(configService.get('DB_PORT')) || 5432,
        username: configService.get('DB_USERNAME') || 'student',
        password: configService.get('DB_PASSWORD') || 'student',
        database: configService.get('DB_DATABASE') || 'kupipodariday',
        entities: [User, Offer, Wish, Wishlist],
        synchronize: Boolean(configService.get('DB_SYNC')) || true,
      }),
    }),
    UsersModule,
    WishesModule,
    WishlistsModule,
    OffersModule,
    HashModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}