import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  inviterId: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;
}
