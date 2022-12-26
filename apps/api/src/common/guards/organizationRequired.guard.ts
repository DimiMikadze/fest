import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EmailConfirmRequiredGuard } from './emailConfirmRequired.guard';

@Injectable()
export class OrganizationRequiredGuard extends EmailConfirmRequiredGuard {
  handleRequest(err: any, user: any) {
    if (!user?.currentOrganization) {
      throw new UnauthorizedException(
        'Please create a new organization or join the existing one'
      );
    }
    return user;
  }
}
