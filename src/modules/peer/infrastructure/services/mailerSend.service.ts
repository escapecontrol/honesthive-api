import { Injectable } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

@Injectable()
export class MailerSendService {
  private readonly mailerSend: MailerSend;

  constructor() {
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY, // Replace with your MailerSend API key
    });
  }

  /**
   * Sends an email using the MailerSend API with the specified template ID.
   *
   * @param to - The recipient's email address.
   * @param templateId - The MailerSend template ID.
   * @param variables - The variables to be used in the email template.
   * @returns A promise that resolves when the email is sent.
   */
  async sendEmail(to: string, templateId: string, variables: Record<string, any>): Promise<void> {
    const recipients = [new Recipient(to)];
    const sentFrom = new Sender("info@honesthive.io", "HonestHive [Do Not Reply]");
    const personalization = [
      {
        email: "info@honesthive.io",
        data: {
          team_name: variables.teamName,
          account_name: process.env.MAILERSEND_ACCOUNT_NAME,
          support_email: process.env.MAILERSEND_SUPPORT_EMAIL,
          invitation_slug: variables.invitationSlug,
        },
      }
    ]

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setTemplateId(templateId)
      .setPersonalization(personalization)
      .setSubject('You have been invited to join a team');

    try {
      await this.mailerSend.email.send(emailParams);
    } catch (error) {
      throw new Error('Failed to send email.');
    }
  }
}