import { Module } from '@nestjs/common';
import { StatusUserController } from './status-user.controller';
import { StatusUserService } from './status-user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StatusUserController],
  providers: [StatusUserService, PrismaService],
})
export class StatusUserModule {}
