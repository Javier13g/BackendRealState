import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from 'src/users/dto/users.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request } from 'express';
import { ResetPasswordDto, ValidateRecoveryCodeDto } from './dto/auth.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard) // Proteger el endpoint
  async logout(@Req() request: Request) {
    const token: string | undefined =
      request.headers.authorization?.split(' ')[1]; // Extraer el token del encabezado
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    return this.authService.logout(token);
  }

  @Post('validate-recovery-code')
  @ApiBody({ type: ValidateRecoveryCodeDto })
  async validateRecoveryCode(
    @Body() body: ValidateRecoveryCodeDto,
  ): Promise<boolean> {
    const { email, recoveryCode } = body;
    return await this.authService.validatePasswordRecoveryCode(
      email,
      recoveryCode,
    );
  }

  @Put('reset-password')
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<boolean> {
    const { email, recoveryCode, newPassword } = body;
    return await this.authService.resetPasswordUser(
      email,
      recoveryCode,
      newPassword,
    );
  }
}
