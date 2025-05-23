import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserResponseIncludePassword,
} from './dto/users.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { getPaginationParams } from 'src/utils/pagination.utils';
import { ImgurService } from 'src/imgur/imgur.service';
import { isValidObjectId } from 'src/utils/validObjectId.utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imgurService: ImgurService,
  ) {}

  async create(
    data: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const hashedPassword = await argon2.hash(data.password);

    let userImgUrl: string | null = null;
    if (file) {
      userImgUrl = await this.imgurService.uploadImage(file);
    }
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        numberAttempts: 0,
        userImg: userImgUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        address: true,
        phoneNumber: true,
        numberAttempts: true,
      },
    });
    return user;
  }

  async createWithRegisterForm(data: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await argon2.hash(data.password);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        numberAttempts: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        address: true,
        phoneNumber: true,
        numberAttempts: true,
      },
    });
    return user;
  }

  async findAll(
    page: number,
    pageSize: number,
  ): Promise<{
    data: UserResponseDto[];
    totalPages: number;
    totalItems: number;
  }> {
    const totalUsers = await this.prisma.user.count();
    const { skip, take, totalItems, totalPages } = getPaginationParams(
      page,
      pageSize,
      totalUsers,
    );

    const users = await this.prisma.user.findMany({
      skip: skip,
      take: take,
      include: { role: true, statusUser: true },
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        address: user.address,
        phoneNumber: user.phoneNumber,
        role: user?.role ?? null,
        roleId: user?.id ?? null,
        statusUser: user.statusUser,
        statusId: user.statusId,
        numberAttempts: user.numberAttempts ?? 0,
      })),
      totalItems,
      totalPages,
    };
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, statusUser: true },
    });
  }

  async findOneByEmail(
    email: string,
  ): Promise<UserResponseIncludePassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true, statusUser: true },
    });

    if (user) {
      return {
        ...user,
        userImg: user.userImg ?? null,
      };
    }

    return null;
  }

  async listStateUser() {
    return await this.prisma.statusUser.findMany();
  }

  async updateAttemps(attempt: number, idUser: string) {
    await this.prisma.user.update({
      where: {
        id: idUser,
      },
      data: {
        numberAttempts: attempt,
      },
    });
  }

  async updateStateUser(idUser: string, idState: string) {
    await this.prisma.user.update({
      where: {
        id: idUser,
      },
      data: {
        statusId: idState,
      },
    });
  }

  async PutDataUser(idUser: string, data: Partial<UpdateUserDto>) {
    if (!isValidObjectId(idUser)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: idUser },
    });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return await this.prisma.user.update({
      where: { id: idUser },
      data: { ...data },
    });
  }

  async findPasswordResetByEmail(
    email: string,
  ): Promise<{ code: string; expiresAt: Date } | null> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { email },
    });
    if (passwordReset) {
      return {
        code: passwordReset.code,
        expiresAt: passwordReset.expiresAt,
      };
    }
    return null;
  }

  async resetPasswordUser(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<boolean> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { email, code },
    });
    if (!passwordReset) {
      throw new UnauthorizedException('Código de recuperación no encontrado');
    }
    if (new Date() > passwordReset.expiresAt) {
      throw new UnauthorizedException('Código de recuperación expirado');
    }
    const hashedPassword = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    await this.prisma.passwordReset.delete({
      where: { email, code },
    });
    await this.prisma.user.update({
      where: { email },
      data: { numberAttempts: 0 },
    });

    const statusActive = await this.prisma.statusUser.findFirst({
      where: { statusName: { equals: 'activo', mode: 'insensitive' } },
    });
    if (statusActive) {
      await this.prisma.user.update({
        where: { email },
        data: { statusId: statusActive.id },
      });
    }

    return true;
  }
}
