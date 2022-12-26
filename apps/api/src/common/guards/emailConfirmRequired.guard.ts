import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class EmailConfirmRequiredGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please confirm your email before continue.'
      );
    }
    return user;
  }
}
