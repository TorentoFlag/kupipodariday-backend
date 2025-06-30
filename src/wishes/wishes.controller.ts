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
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateWishDto, @GetCurrentUser() user: User) {
    return this.wishesService.create(dto, user);
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishDto,
    @GetCurrentUser('id') userId: number,
  ) {
    return this.wishesService.updateWish(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser('id') userId: number,
  ) {
    return this.wishesService.deleteWish(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  copyWish(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: User,
  ) {
    return this.wishesService.copyWish(id, user);
  }
}