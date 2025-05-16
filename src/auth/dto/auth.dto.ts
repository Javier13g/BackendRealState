// src/auth/dto/validate-recovery-code.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ValidateRecoveryCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  recoveryCode: string;
}

export class ResetPasswordDto extends ValidateRecoveryCodeDto {
  @ApiProperty()
  @IsString()
  newPassword: string;
}
