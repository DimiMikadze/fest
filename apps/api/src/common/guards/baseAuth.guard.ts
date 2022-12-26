import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class BaseAuthGuard extends AuthGuard('jwt') {}
