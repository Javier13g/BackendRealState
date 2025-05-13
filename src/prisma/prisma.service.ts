import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma conectado a MongoDB');
    } catch (error) {
      console.error('❌ Error al conectar Prisma:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  //   enableShutdownHooks(app: any) {
  //     this.$on('beforeExit', async () => {
  //       await app.close();
  //     });
  //   }
}
