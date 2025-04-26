/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({
    description: 'name role',
    example: 'admin',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
