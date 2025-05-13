import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { RevokedTokenService } from 'src/redis/redis.service';

@Module({
  imports: [RedisModule],
  controllers: [RolesController],
  providers: [RolesService, PrismaService, RevokedTokenService],
})
export class RolesModule {}
