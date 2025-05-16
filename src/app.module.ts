import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { StatusUserModule } from './status-user/status-user.module';
import { AuthModule } from './auth/auth.module';
import { ImgurService } from './imgur/imgur.service';
import { UploadController } from './upload/upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    RolesModule,
    StatusUserModule,
    AuthModule,
    MulterModule.register({
      dest: './uploads', // Directorio donde se guardarán los archivos subidos
      limits: {
        fileSize: 5 * 1024 * 1024, // Tamaño máximo del archivo (5 MB)
      },
    }),
    RedisModule,
    EmailModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, ImgurService],
})
export class AppModule {}
