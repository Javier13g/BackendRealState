import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from 'src/users/dto/users.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request, Response } from 'express';
import { ResetPasswordDto, ValidateRecoveryCodeDto } from './dto/auth.dto';
import { ApiBody } from '@nestjs/swagger';
import { RequestWithCookies } from './RequestWithCookies';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    res.cookie('token', result.token, {
      httpOnly: true,
      //ecure: process.env.NODE_ENV === 'production',
      secure: false, // Cambiado a false para desarrollo
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hora
    });
    return {
      message: result.message,
      email: result.email,
      name: result.name,
      image: result.image,
    };
  }

  @Post('register')
  register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard) // Proteger el endpoint
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Obtener el token desde la cookie
    const token: string | undefined = request.cookies?.token;
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    // Elimina la cookie del token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
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

  @Post('validate-token')
  async validateToken(@Req() req: RequestWithCookies): Promise<boolean> {
    const token = req.cookies?.token;
    if (!token) {
      return false;
    }
    return await this.authService.isTokenValid(token);
  }
}
