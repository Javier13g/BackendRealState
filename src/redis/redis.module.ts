import { Module } from '@nestjs/common';
import { RevokedTokenService } from './redis.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [RevokedTokenService, PrismaService],
  exports: [RevokedTokenService], // Exportar el servicio para que otros módulos puedan usarlo
})
export class RedisModule {}
