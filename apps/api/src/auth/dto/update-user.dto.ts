import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  emailVerificationToken?: string;

  @IsString()
  @IsOptional()
  emailVerificationCode?: string;

  @IsDate()
  @IsOptional()
  emailVerificationCodeExpires?: Date;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  emailVerificationLinkSent?: boolean;
}
