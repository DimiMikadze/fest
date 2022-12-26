import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  auth0Id?: string;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  emailVerified?: boolean;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsString()
  currentOrganizationId?: string;
}
