import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RevokedTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async revokeToken(token: string, expiresAt: Date): Promise<void> {
    await this.prisma.revokedToken.create({
      data: {
        token,
        expiresAt,
      },
    });
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const revokedToken = await this.prisma.revokedToken.findUnique({
      where: { token },
    });
    return !revokedToken;
  }

  async cleanExpiredTokens(): Promise<void> {
    const result = await this.prisma.revokedToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    console.log(`Tokens expirados eliminados: ${result.count}`);
  }

  async deleteToken(token: string): Promise<void> {
    await this.prisma.revokedToken.delete({
      where: { token },
    });
  }
}
