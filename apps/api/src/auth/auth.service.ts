import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_RELATIONS } from '../common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private config: ConfigService, private prisma: PrismaService) {}

  createUserBasedOnAuth0User(createUserDto: CreateUserDto) {
    const user = this.prisma.user.create({
      data: {
        ...createUserDto,
      },
      include: USER_RELATIONS,
    });

    return user;
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: USER_RELATIONS,
    });
  }

  findOneByAuth0Id(id: string) {
    return this.prisma.user.findUnique({
      where: {
        auth0Id: id,
      },
      include: USER_RELATIONS,
    });
  }

  findOneByGoogleId(id: string) {
    return this.prisma.user.findUnique({
      where: {
        googleId: id,
      },
      include: USER_RELATIONS,
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
      },
      include: USER_RELATIONS,
    });
  }

  generateRandomString(length: number) {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
  }

  updateUsersEmailVerificationToken(
    userId: string,
    token: string,
    code: string,
    codeExpires: Date
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerificationToken: token,
        emailVerificationCode: code,
        emailVerificationCodeExpires: codeExpires,
        emailVerificationLinkSent: true,
      },
    });
  }

  findUserByCodeAndEmail(email: string, code: string) {
    return this.prisma.user.findFirst({
      where: { email, emailVerificationCode: code },
    });
  }

  findUserByTokenAndEmail(email: string, token: string) {
    return this.prisma.user.findFirst({
      where: { email, emailVerificationToken: token },
    });
  }

  setEmailVerifiedToTrue(id: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationToken: null,
        emailVerificationCodeExpires: null,
      },
    });
  }
}
