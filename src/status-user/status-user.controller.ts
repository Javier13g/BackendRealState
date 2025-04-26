import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateStateUserDto } from './dto/status-user.dto';
import { StatusUserService } from './status-user.service';

@Controller('status-user')
export class StatusUserController {
  constructor(private statusUserService: StatusUserService) {}
  @Post()
  create(@Body() dto: CreateStateUserDto) {
    return this.statusUserService.create(dto);
  }

  @Get()
  findAll() {
    return this.statusUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statusUserService.findOne(id);
  }
}
