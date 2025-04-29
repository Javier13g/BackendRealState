/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class ImgurService {
  private readonly IMGUR_API_URL = 'https://api.imgur.com/3/image';
  private readonly CLIENT_ID = process.env.CLIENT_ID_IMGUR;

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const formData = new FormData();

    // Usa el Buffer directamente en lugar de convertirlo a Blob
    formData.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await axios.post(this.IMGUR_API_URL, formData, {
        headers: {
          Authorization: `Client-ID ${this.CLIENT_ID}`,
          ...formData.getHeaders(),
        },
      });

      return response.data.data.link;
    } catch (error) {
      throw new Error(
        `Error al subir la imagen a Imgur: ${error.response?.data?.data?.error || error.message}`,
      );
    }
  }
}
