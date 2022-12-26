import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
