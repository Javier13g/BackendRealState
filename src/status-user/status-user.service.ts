import { Injectable } from '@nestjs/common';
import { CreateStateUserDto } from './dto/status-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusUser } from '@prisma/client';

@Injectable()
export class StatusUserService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateStateUserDto): Promise<StatusUser> {
    return this.prisma.statusUser.create({ data });
  }

  findAll(): Promise<StatusUser[]> {
    return this.prisma.statusUser.findMany();
  }

  findOne(id: string): Promise<StatusUser | null> {
    return this.prisma.statusUser.findUnique({
      where: { id },
    });
  }
}
