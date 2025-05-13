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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
    console.log('Intentando login con:', loginDto);

    const existingUser = await this.usersService.findOneByEmail(loginDto.email);
    console.log('Usuario encontrado:', existingUser);

    if (!existingUser) {
      console.log('Email no registrado');
      throw new UnauthorizedException('Email no registrado');
    }

    const userStatus = existingUser.statusUser?.statusName.toLowerCase();
    console.log('Estado del usuario:', userStatus);

    if (userStatus === 'suspendido') {
      console.log('Usuario suspendido');
      throw new ForbiddenException('Usuario suspendido, reestablezca contraseña');
    }

    if (existingUser.numberAttempts > 3) {
      await this.suspendUser(existingUser.id);
      throw new ForbiddenException('Usuario suspendido por múltiples intentos fallidos');
    }

    const isPasswordValid = await argon2.verify(existingUser.password, loginDto.password);
    console.log('¿Contraseña válida?', isPasswordValid);

    if (!isPasswordValid) {
      await this.incrementAttempts(existingUser);
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser?.role ?? 'N/A',
    };
    console.log('Payload:', payload);

    const token = await this.jwtService.signAsync(payload);
    console.log('Token generado');

    await this.resetAttempts(existingUser.id);

    return {
      message: 'Sesión iniciada',
      token,
      email: existingUser.email,
      name: existingUser.name + ' ' + existingUser.lastName,
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
