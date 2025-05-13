import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsDefined()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  roleId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  statusId: string;
}

// user.dto.ts
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  roleId?: string | null;
  role?: {
    id: string;
    name: string;
  } | null;
  statusId?: string | null;
  statusUser?: {
    id: string;
    statusName: string;
  } | null;
  numberAttempts: number;
}

export class UpdateUserDto {
  email?: string;
  name?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  roleId?: string | null;
}

export class UserResponseIncludePassword extends UserResponseDto {
  password: string;
  userImg?: string | null;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class UserRespondePayload {
  id: string;
  email: string;
  role?: Role;
}
