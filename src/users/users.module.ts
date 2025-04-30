import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImgurService } from 'src/imgur/imgur.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, ImgurService],
})
export class UsersModule {}
