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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    //private readonly prismaService: PrismaService,
  ) {}
  async register(registerDto: CreateUserDto) {
    const data = registerDto;
    const existingUser = await this.usersService.findOneByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('El email ya está en uso');
    }
    return await this.usersService.create({
      ...data,
    });
  }

  async login(loginDto: LoginDto) {
    const existingUser = await this.usersService.findOneByEmail(loginDto.email);

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

    await this.resetAttempts(existingUser.id);
    return 'Sesión iniciada';
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
}
