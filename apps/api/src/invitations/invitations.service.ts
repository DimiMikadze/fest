import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  create(createInvitationDto: CreateInvitationDto, token: string) {
    const { email, inviterId, organizationId } = createInvitationDto;
    const invitation = this.prisma.invitation.create({
      data: {
        token,
        email,
        organization: {
          connect: {
            id: organizationId,
          },
        },
        inviter: {
          connect: {
            id: inviterId,
          },
        },
      },
    });
    return invitation;
  }

  findByInvitationByEmailAndOrganization(
    email: string,
    organizationId: string,
    token: string
  ) {
    return this.prisma.invitation.findFirst({
      where: { email, organizationId, token },
    });
  }

  acceptInvite(id: string) {
    return this.prisma.invitation.update({
      where: { id },
      data: {
        inviteAccepted: true,
        token: null,
      },
    });
  }
}
