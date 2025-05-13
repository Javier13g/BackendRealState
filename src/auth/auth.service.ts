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
  console.log('Inicio de proceso de login', loginDto);

  // Verifica si el usuario existe
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
    console.log('Usuario suspendido por múltiples intentos fallidos');
    await this.suspendUser(existingUser.id);
    throw new ForbiddenException('Usuario suspendido por múltiples intentos fallidos');
  }

  // Verifica si la contraseña es correcta
  const isPasswordValid = await argon2.verify(existingUser.password, loginDto.password);
  console.log('Contraseña válida:', isPasswordValid);

  if (!isPasswordValid) {
    console.log('Contraseña incorrecta');
    await this.incrementAttempts(existingUser);
    throw new UnauthorizedException('Contraseña incorrecta');
  }

  const payload = {
    id: existingUser.id,
    email: existingUser.email,
    role: existingUser?.role ?? 'N/A',
  };
  console.log('Generando token para el usuario:', payload);

  const token = await this.jwtService.signAsync(payload);
  console.log('Token generado:', token);

  // Resetea los intentos fallidos
  await this.resetAttempts(existingUser.id);

  // Responde con el token y el nombre completo
  console.log('Sesión iniciada exitosamente');
  return {
    message: 'Sesión iniciada',
    token,
    email: existingUser.email,
    name: existingUser.name + ' ' + existingUser.lastName,
  };
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
