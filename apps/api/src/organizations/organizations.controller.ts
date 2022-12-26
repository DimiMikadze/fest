import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberAfterInviteDto, AddMemberToOrganizationDto } from './dto';
import {
  AuthUser,
  BaseAuthGuard,
  EmailConfirmRequiredGuard,
  ReqUser,
} from '../common';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { userAcceptedInvite } from '../mail/templates/userAcceptedInvite';

@Controller('organizations')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(
    private readonly organizationsService: OrganizationsService,
    private authService: AuthService,
    private mailService: MailService
  ) {}

  @Post('create')
  @UseGuards(EmailConfirmRequiredGuard)
  async create(
    @ReqUser() authUser: AuthUser,
    @Body() createOrganizationDto: CreateOrganizationDto
  ) {
    if (createOrganizationDto.userId !== authUser.id) {
      throw new UnauthorizedException(
        'Someone else is trying to create an organization for another user'
      );
    }

    const isExistingOrganization =
      await this.organizationsService.findOneByName(createOrganizationDto.name);
    if (isExistingOrganization) {
      throw new BadRequestException('Organization name is already taken.');
    }

    // Create a new organization and add it as a currentOrganization to the authUser
    const organization = await this.organizationsService.create(
      createOrganizationDto
    );
    await this.authService.update(authUser.id, {
      currentOrganizationId: organization.id,
    });

    return organization;
  }

  @Post('/add-member-after-invite')
  @UseGuards(BaseAuthGuard)
  async addMemberToOrganization(
    @ReqUser() authUser: AuthUser,
    @Body() addMemberAfterInviteDto: AddMemberAfterInviteDto
  ) {
    if (addMemberAfterInviteDto.userId !== authUser.id) {
      this.logger.error(
        `Can't add a user to the organization. They are using different email address.`
      );
      throw new UnauthorizedException(
        'Please login with the invited email address'
      );
    }

    try {
      // Add a new user to the invited organization
      const organizationUser =
        this.organizationsService.addMemberToOrganization(
          addMemberAfterInviteDto
        );
      // Add invited organization to the user's current organization
      await this.authService.update(authUser.id, {
        currentOrganizationId: addMemberAfterInviteDto.organizationId,
      });
      // Send email to the inviter to notify them that their invitee has accepted their invite
      await this.mailService.send({
        to: addMemberAfterInviteDto.inviterEmail,
        subject: `${
          authUser.fullName || authUser.email
        } has accepted your invite`,
        body: userAcceptedInvite({
          fullName: authUser.fullName,
          email: authUser.email,
        }),
      });

      this.logger.log(
        'Member has been successfully added to the organization, organizationUser',
        organizationUser
      );
      return organizationUser;
    } catch (error) {
      throw new BadRequestException(
        'Adding member to the organization failed',
        error
      );
    }
  }

  @Patch('/update/:id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Patch('/add-member')
  addMember(@Body() addMemberToOrganizationDto: AddMemberToOrganizationDto) {
    return this.organizationsService.addMemberToOrganization(
      addMemberToOrganizationDto
    );
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
