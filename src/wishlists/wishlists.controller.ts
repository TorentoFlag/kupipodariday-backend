import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistsService } from './wishlists.service';

@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  findAll() {
    return this.wishlistsService.findMany({});
  }

  @Post()
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @GetCurrentUser() user: User,
  ) {
    return await this.wishlistsService.create(createWishlistDto, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistsService.findOne({ id });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @GetCurrentUser('id') userId: number,
  ) {
    return this.wishlistsService.updateOne(id, updateWishlistDto, userId);
  }

  @Delete(':id')
  removeOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser('id') userId: number,
  ) {
    return this.wishlistsService.removeOne(id, userId);
  }
}