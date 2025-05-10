import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDto })
  @ApiConsumes('multipart/form-data') // Indica que consume form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Esto hace que Swagger muestre un uploader
        },
        name: { type: 'string' },
        email: { type: 'string' },
        lastName: { type: 'string' },
        address: { type: 'string' },
        phoneNumber: { type: 'string' },
        cardId: { type: 'string' },
        password: { type: 'string' },
        // ... otros campos de CreateUserDto
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() dto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.usersService.create(dto, file);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findAll(@Query('page') page: number, @Query('pageSize') pageSize: number) {
    return this.usersService.findAll(page, pageSize);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  putUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.PutDataUser(id, dto);
  }
}
