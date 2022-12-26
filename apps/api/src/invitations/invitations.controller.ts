import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Frontend_Routes } from '@fest/shared';
import {
  AuthUser,
  ORGANIZATION_INVITATION_TOKEN_EXPIRY,
  OrganizationRequiredGuard,
  ReqUser,
} from '../common';
import { MailService } from '../mail/mail.service';
import { organizationInvitation } from '../mail/templates';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { CreateInvitationDto, ValidateTokenDto } from './dto';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
export class InvitationsController {
  private readonly logger = new Logger(InvitationsController.name);

  constructor(
    private invitationsService: InvitationsService,
    private mailService: MailService,
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private config: ConfigService
  ) {}

  /**
   * Signs a new token with inviter and organization information,
   * Sends an email to the invitee and creates a invite record in the db.
   */
  @Post('create')
  @UseGuards(OrganizationRequiredGuard)
  async create(
    @ReqUser() authUser: AuthUser,
    @Body() createInvitationDto: CreateInvitationDto
  ) {
    const { inviterId, email, organizationId } = createInvitationDto;
    if (authUser.id !== inviterId) {
      throw new UnauthorizedException(
        'Trying to invite a member on someone elses behalf'
      );
    }

    try {
      // Find information about the inviter and the organization
      const inviter = await this.usersService.findOneById(inviterId);
      const organization = await this.organizationsService.findOneById(
        organizationId
      );

      // Sign a new token with authUser's email and id
      const token = jwt.sign(
        {
          inviterId: inviter.id,
          inviterEmail: inviter.email,
          organizationName: organization.name,
          organizationId: organization.id,
          email,
        },
        this.config.get('ORGANIZATION_INVITATION_TOKEN_SECRET'),
        { expiresIn: ORGANIZATION_INVITATION_TOKEN_EXPIRY }
      );

      // Create an invitation record and send an email to the invitee.
      await this.invitationsService.create(createInvitationDto, token);
      await this.mailService.send({
        to: email,
        subject: `join ${organization.name} in Fest`,
        body: organizationInvitation({
          inviterName: inviter.fullName,
          inviterEmail: inviter.email,
          organizationName: organization.name,
          link: `${this.config.get('FRONT_END_URL')}${
            Frontend_Routes.GET_STARTED_INVITATION_ACCEPTED
          }?t=${token}`,
        }),
      });

      this.logger.log('Invite created successfully');

      return { message: 'success' };
    } catch (error) {
      this.logger.error('Creation of the invitation failed', error);
      throw new BadRequestException(error);
    }
  }

  /**
   * Checks the token validity, and searches invitation record with the
   * decoded tokens fields (inviterId and organizationId) and
   * returns decoded token
   */
  @Post('/validate-token')
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    const { token } = validateTokenDto;

    // Decode the token, and check its validity.
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        this.config.get('ORGANIZATION_INVITATION_TOKEN_SECRET')
      );
      this.logger.log('Decoded token successfully', decoded);
    } catch (error) {
      this.logger.error('An error detected while decoding the token');
      throw new BadRequestException('Invalid token');
    }

    const { email, organizationId, organizationName, inviterId, inviterEmail } =
      decoded;

    // Check if invitation record with given email and organizationId exists in the database
    const invitation =
      await this.invitationsService.findByInvitationByEmailAndOrganization(
        email,
        organizationId,
        token
      );
    if (!invitation) {
      this.logger.error('Invitation record missing');
      throw new BadRequestException("Can't find the invitation");
    }

    this.logger.log('Found invitation', invitation);

    // Accept invitation: set inviteAccepted to true and token to null.
    await this.invitationsService.acceptInvite(invitation.id);

    this.logger.log('Invite accepted');

    // Return decoded token fields
    return { email, organizationId, organizationName, inviterId, inviterEmail };
  }
}
