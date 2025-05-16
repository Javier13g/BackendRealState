import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-password-reset')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@ejemplo.com' },
      },
      required: ['email'],
    },
  })
  async sendPasswordReset(@Body('email') email: string): Promise<void> {
    await this.emailService.sendPasswordResetEmail(email);
  }
}
