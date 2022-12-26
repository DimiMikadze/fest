import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { EMAIL_CONFIRMATION_CODE_LENGTH, Frontend_Routes } from '@fest/shared';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  addHours,
  AuthUser,
  EMAIL_CONFIRMATION_CODE_EXPIRY,
  transformAuthUserPayload,
  ReqUser,
  EMAIL_CONFIRMATION_TOKEN_EXPIRY,
} from '../common';
import { MailService } from '../mail/mail.service';
import { emailConfirmation } from '../mail/templates/emailConfirmation';
import { AuthService } from './auth.service';
import { BaseAuthGuard } from '../common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private mailService: MailService,
    private authService: AuthService,
    private config: ConfigService,
    private prisma: PrismaService
  ) {}

  @Get('me')
  @UseGuards(BaseAuthGuard)
  async me(@ReqUser() authUser: AuthUser) {
    this.logger.log('ReqUser in Me endpoint', authUser);
    if (!authUser.email) return null;

    const user = await this.authService.findOneByEmail(authUser.email);
    return transformAuthUserPayload(user);
  }

  @Post('create-user-based-on-auth0-user')
  @UseGuards(BaseAuthGuard)
  async createUserBasedOnAuth0User(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.createUserBasedOnAuth0User(
      createUserDto
    );
    return transformAuthUserPayload(user);
  }

  @Patch('/update/:id')
  @UseGuards(BaseAuthGuard)
  async update(
    @ReqUser() authUser: AuthUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    if (authUser.id !== id) {
      this.logger.error(
        'authUser id is not equal to the user record that needs to be updated'
      );
      throw new UnauthorizedException('Unauthorized to update the user');
    }

    const user = await this.authService.update(id, updateUserDto);
    return transformAuthUserPayload(user);
  }

  /**
   * We allow users to confirm their email address by using one of the two methods:
   * 1. By providing confirmation code which they received by email. This code has a short expiry date.
   * 2. By clicking a link in their email. The link contains jwt token. The link has longer expiration date.
   *
   * Hence, we need to generate random string, and sign a jwt token with users email, id and
   * send them an email with the code and the link.
   */
  @Post('send-email-confirmation')
  @UseGuards(BaseAuthGuard)
  async sendEmailConfirmation(@ReqUser() authUser: AuthUser) {
    if (authUser.emailVerified) {
      this.logger.warn('Email is already verified');
      throw new HttpException(
        'Email is already verified',
        HttpStatus.FORBIDDEN
      );
    }

    try {
      // Generate a random code, and its expiration date.
      const code = this.authService.generateRandomString(
        EMAIL_CONFIRMATION_CODE_LENGTH
      );
      const codeExpires = addHours(EMAIL_CONFIRMATION_CODE_EXPIRY);

      // Sign a new token with authUser's email and id
      const token = jwt.sign(
        {
          email: authUser.email,
          id: authUser.id,
        },
        this.config.get('EMAIL_CONFIRM_TOKEN_SECRET'),
        { expiresIn: EMAIL_CONFIRMATION_TOKEN_EXPIRY }
      );

      this.logger.log('Generated random code and jwt token');

      // Send an email to authUser with code and token.
      await this.mailService.send({
        to: authUser.email,
        subject: 'Verify your Fest email',
        body: emailConfirmation({
          code,
          link: `${this.config.get('FRONT_END_URL')}${
            Frontend_Routes.GET_STARTED_EMAIL_CONFIRM
          }?t=${token}`,
        }),
      });

      // Update authUser's corresponding db fields
      await this.authService.updateUsersEmailVerificationToken(
        authUser.id,
        token,
        code,
        codeExpires
      );

      this.logger.log(
        'authUsers record has been updated with the token and the code fields'
      );

      return { message: 'Email has been sent successfully' };
    } catch (error) {
      this.logger.error('sendEmailConfirmation has been failed', error);
      throw new BadRequestException(error);
    }
  }

  /**
   * Finds the user with email and the code, and checks if the code has expired.
   * In case of success, updates the user's emailVerified field to true.
   */
  @Post('confirm-email-code')
  @UseGuards(BaseAuthGuard)
  async confirmEmailByCode(@ReqUser() authUser: AuthUser, @Body() body: any) {
    const { code } = body;
    if (!code) {
      this.logger.error('code is not present in the request body');
      throw new BadRequestException('Request lacks required params');
    }

    const user = await this.authService.findUserByCodeAndEmail(
      authUser.email,
      code
    );

    if (!user) {
      this.logger.error(
        "Can't find a user record with the given email address and the code",
        {
          email: authUser.email,
          code,
        }
      );
      throw new BadRequestException('Invalid code: User not found');
    }

    // Check if code has expired.
    const codeExpired = new Date() > user.emailVerificationCodeExpires;
    if (codeExpired) {
      this.logger.error('The code has been expired');
      throw new UnauthorizedException('The code has been expired');
    }

    this.logger.log('Email successfully confirmed with the code');

    // Update emailVerified field to true
    return this.authService.setEmailVerifiedToTrue(user.id);
  }

  /**
   * Decodes the jwt token and checks if decoded values (email and id) matches with authUser values.
   * If it matches, we search for a record in the db with email and and the token.
   * In case of success, updates the user's emailVerified field to true.
   */
  @Post('confirm-email-token')
  @UseGuards(BaseAuthGuard)
  async confirmEmailToken(@ReqUser() authUser: AuthUser, @Body() body: any) {
    const { token } = body;
    if (!token) {
      this.logger.error('token is not present in the request body');
      throw new BadRequestException('Request lacks required params');
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        this.config.get('EMAIL_CONFIRM_TOKEN_SECRET')
      );
    } catch (error) {
      this.logger.error('An error detected while decoding the token');
      throw new BadRequestException('Invalid token');
    }

    if (decoded.email !== authUser.email || decoded.id !== authUser.id) {
      this.logger.error(
        'Decoded token does not contain correct data for the authUser'
      );
      throw new BadRequestException('Invalid token for a user');
    }

    const user = await this.authService.findUserByTokenAndEmail(
      authUser.email,
      token
    );

    if (!user) {
      this.logger.error(
        "Can't find a user record with the given email address and the token",
        {
          email: authUser.email,
          token,
        }
      );
      throw new BadRequestException('User not found');
    }

    this.logger.log('Email successfully confirmed with the token');

    return this.authService.setEmailVerifiedToTrue(user.id);
  }

  // @ToDo remove me!!!
  @Get('delete-all')
  async deleteAllTables() {
    try {
      await this.prisma.organization.deleteMany();
      await this.prisma.user.deleteMany();
      return 'All tables has been emptied.';
    } catch (error) {
      this.logger.error('Emptying all tables failed', error);
      return error;
    }
  }
}
