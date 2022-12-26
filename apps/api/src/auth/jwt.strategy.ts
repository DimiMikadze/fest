import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { transformAuthUserPayload } from '../common';
import { AuthProviders, findAuthProviderFromAuth0Id } from '@fest/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private authService: AuthService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${config.get('AUTH0_DOMAIN')}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.get('AUTH0_AUDIENCE'),
      issuer: `${config.get('AUTH0_DOMAIN')}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any): Promise<any> {
    const authProvider: AuthProviders = findAuthProviderFromAuth0Id(
      payload.sub
    );

    let user;
    if (authProvider === AuthProviders.GOOGLE) {
      user = await this.authService.findOneByGoogleId(payload.sub);
    } else {
      user = await this.authService.findOneByAuth0Id(payload.sub);
    }

    return user ? transformAuthUserPayload(user) : payload;
  }
}
