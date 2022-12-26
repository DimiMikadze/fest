import { IsEmail, IsNotEmpty } from 'class-validator';
import { AddMemberToOrganizationDto } from './add-member-to-organization.dto';

export class AddMemberAfterInviteDto extends AddMemberToOrganizationDto {
  @IsEmail()
  @IsNotEmpty()
  inviterEmail: string;
}
