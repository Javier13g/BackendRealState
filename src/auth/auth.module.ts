import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jtw.constant';
import { ImgurService } from 'src/imgur/imgur.service';
import { RedisModule } from 'src/redis/redis.module';
import { RevokedTokenService } from 'src/redis/redis.service';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    PrismaService,
    ImgurService,
    RevokedTokenService,
  ],
})
export class AuthModule {}
