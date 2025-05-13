import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImgurService } from 'src/imgur/imgur.service';
import { RedisModule } from 'src/redis/redis.module';
import { RevokedTokenService } from 'src/redis/redis.service';

@Module({
  imports: [RedisModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, ImgurService, RevokedTokenService],
})
export class UsersModule {}
