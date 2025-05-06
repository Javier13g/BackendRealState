import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImgurService } from '../imgur/imgur.service';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly imgurService: ImgurService) {}

  @Post('image')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Trabaja en memoria (usa file.buffer)
    }),
  )
  @ApiOperation({ summary: 'Upload an image' })
  @ApiResponse({
    status: 200,
    description: 'Image URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Opción 1: Usar el Buffer directamente (recomendado para Imgur)
    const imageUrl = await this.imgurService.uploadImage(file);

    // Opción 2: Si el servicio espera un Blob (para APIs web modernas)
    // const imageUrl = await this.imgurService.uploadImageAsBlob(file);

    return { url: imageUrl };
  }
}
