import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { AuthService } from '../auth/auth.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, AuthService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
