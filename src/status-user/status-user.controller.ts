import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateStateUserDto } from './dto/status-user.dto';
import { StatusUserService } from './status-user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('status-user')
export class StatusUserController {
  constructor(private statusUserService: StatusUserService) {}
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateStateUserDto) {
    return this.statusUserService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.statusUserService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.statusUserService.findOne(id);
  }
}
