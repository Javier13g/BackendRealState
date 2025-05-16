import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  async sendPasswordResetEmail(email: string): Promise<void> {
    // Generar un código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Guardar el código en la base de datos
    await this.prisma.passwordReset.upsert({
      where: { email },
      update: { code, expiresAt },
      create: { email, code, expiresAt },
    });

    // Configurar Brevo
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const apiKey = defaultClient.authentications['api-key'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    apiKey.apiKey = process.env.BREVO_API_KEY;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sender = { email: process.env.BREVO_FROM_EMAIL, name: 'RealState' };
    const receivers = [{ email }];

    const emailContent = {
      sender,
      to: receivers,
      subject: 'Recuperación de contraseña',
      htmlContent: `<p>Tu código de recuperación de contraseña es: <strong>${code}</strong></p>`,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await emailApi.sendTransacEmail(emailContent);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al enviar el correo:', error.message);
      } else {
        console.error('Error al enviar el correo:', error);
      }
      throw new BadRequestException(
        'No se pudo enviar el correo de recuperación',
      );
    }
  }
}
