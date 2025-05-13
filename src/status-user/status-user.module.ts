import { Module } from '@nestjs/common';
import { StatusUserController } from './status-user.controller';
import { StatusUserService } from './status-user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { RevokedTokenService } from 'src/redis/redis.service';

@Module({
  imports: [RedisModule],
  controllers: [StatusUserController],
  providers: [StatusUserService, PrismaService, RevokedTokenService],
})
export class StatusUserModule {}
