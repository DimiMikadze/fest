import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Makes authUser accessible within the controller method
 */
@Injectable()
export class WithAuthUserGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (user) return user;
    return null;
  }
}
