import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  UserResponseDto,
  UserResponseIncludePassword,
} from './dto/users.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { getPaginationParams } from 'src/utils/pagination.utils';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserResponseDto> {
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
        numberAttempts: (user.numberAttempts as number) ?? 0,
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
    return await this.prisma.user.findUnique({
      where: { email },
      include: { role: true, statusUser: true },
    });
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
}
