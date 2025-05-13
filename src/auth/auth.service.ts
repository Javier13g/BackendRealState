import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
//import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateUserDto,
  LoginDto,
  UserResponseDto,
} from 'src/users/dto/users.dto';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { RevokedTokenService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenService: RevokedTokenService,
    //private readonly prismaService: PrismaService,
  ) {}
  async register(registerDto: CreateUserDto) {
    const data = registerDto;
    const existingUser = await this.usersService.findOneByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('El email ya está en uso');
    }
    return await this.usersService.createWithRegisterForm({
      ...data,
    });
  }

  async login(loginDto: LoginDto) {
    try {
      await this.tokenService.cleanExpiredTokens();
      const existingUser = await this.usersService.findOneByEmail(
        loginDto.email,
      );

      if (!existingUser) {
        throw new UnauthorizedException('Email no registrado');
      }

      const userStatus = existingUser.statusUser?.statusName.toLowerCase();

      if (userStatus === 'suspendido') {
        throw new ForbiddenException(
          'Usuario suspendido, reestablezca contraseña',
        );
      }

      if (existingUser.numberAttempts > 3) {
        await this.suspendUser(existingUser.id);
        throw new ForbiddenException(
          'Usuario suspendido por múltiples intentos fallidos',
        );
      }

      const isPasswordValid = await argon2.verify(
        existingUser.password,
        loginDto.password,
      );

      if (!isPasswordValid) {
        await this.incrementAttempts(existingUser);
        throw new UnauthorizedException('Contraseña incorrecta');
      }

      const payload = {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser?.role ?? null,
        image: existingUser?.userImg ?? null,
      };
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });

      // Decodificar el token para obtener su tiempo de expiración
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decodedToken = this.jwtService.decode(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const ttl = decodedToken.exp - Math.floor(Date.now() / 1000);

      await this.tokenService.revokeToken(
        token,
        new Date(Date.now() + ttl * 1000),
      );
      await this.resetAttempts(existingUser.id);

      return {
        message: 'Sesión iniciada',
        token,
        email: existingUser.email,
        name: existingUser.name + ' ' + existingUser.lastName,
        image: existingUser?.userImg ?? null,
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error; // sigue lanzando para que se vea en Swagger
    }
  }

  private async suspendUser(userId: string) {
    const state = (await this.usersService.listStateUser()).find(
      (state) => state.statusName.toLowerCase() === 'suspendido',
    );

    if (state?.id) {
      await this.usersService.updateStateUser(userId, state.id);
    }
  }

  private async incrementAttempts(user: UserResponseDto) {
    const updatedAttempts = (user.numberAttempts || 0) + 1;
    await this.usersService.updateAttemps(updatedAttempts, user.id);
  }

  private async resetAttempts(userId: string) {
    await this.usersService.updateAttemps(0, userId);
  }

  async validateUser(email: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
