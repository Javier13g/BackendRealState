import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRolDto } from './dto/roles.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateRolDto): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  findOne(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }
}
