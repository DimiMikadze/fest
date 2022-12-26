import { OrganizationRole } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddMemberToOrganizationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsOptional()
  OrganizationRole: OrganizationRole;
}
