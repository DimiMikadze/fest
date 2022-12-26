import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as postmark from 'postmark';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  mailClient: any;

  constructor(private config: ConfigService) {
    this.mailClient = new postmark.ServerClient(
      this.config.get('POSTMARK_KEY')
    );
  }

  async send({ to, subject, body }) {
    try {
      this.mailClient.sendEmail({
        From: 'no-reply@fest.dev',
        To: to,
        Subject: subject,
        HtmlBody: body,
        MessageStream: 'outbound',
      });
      this.logger.log(`Email successfully send to the ${to} email address`);
    } catch (error) {
      this.logger.error(
        `Sending email to the ${to} email address failed`,
        error
      );
      throw new InternalServerErrorException(error);
    }
  }
}
