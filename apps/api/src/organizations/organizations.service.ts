import { Injectable } from '@nestjs/common';
import { OrganizationRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberToOrganizationDto,
} from './dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  create(createOrganizationDto: CreateOrganizationDto) {
    const { userId, name } = createOrganizationDto;
    const organization = this.prisma.organization.create({
      data: {
        name,
        members: {
          create: [
            {
              role: OrganizationRole.Admin,
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          ],
        },
      },
    });
    return organization;
  }

  findOneByName(name: string) {
    return this.prisma.organization.findFirst({ where: { name } });
  }

  findOneById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: {
        id,
      },
      data: {
        ...updateOrganizationDto,
      },
    });
  }

  addMemberToOrganization(
    addMemberToOrganizationDto: AddMemberToOrganizationDto
  ) {
    const { userId, organizationId, OrganizationRole } =
      addMemberToOrganizationDto;
    return this.prisma.organizationUser.create({
      data: {
        role: OrganizationRole,
        organization: {
          connect: {
            id: organizationId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.organization.delete({ where: { id } });
  }
}
