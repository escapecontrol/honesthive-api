import { InviteSlug } from './../../domain/value-objects/inviteSlug.vo';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvitationSentEvent } from 'src/shared/domain/events/peer/invitation-sent.event';
import { InvitationRepository } from '../../infrastructure/repositories/invitation.repository';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';
import { Invitation } from '../../domain/entities/invitation.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { generateInviteSlug } from '../helpers/slug.helper';
import { MailerSendService } from '../../infrastructure/services/mailerSend.service';
import { FirstName } from '../../domain/value-objects/firstName.vo';
import { TeamName } from '../../domain/value-objects/teamName.vo';
import { InvitationAcceptedEvent } from 'src/shared/domain/events/peer/invitation-accepted.event';

@Injectable()
export class InvitationService {
  constructor(
    private readonly peerRepository: PeerRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailerSendService: MailerSendService,
  ) {}

  async sendInvitationAsync(
    authProviderSub: string,
    email: string,
  ): Promise<string> {

    // this check needs a new invitee to FIRST setup an account, and then accept the invitation
    const peer =
      await this.peerRepository.getByAuthProviderSub(authProviderSub);

    if (!peer) {
      throw new NotFoundException('Peer was not found.');
    }

    if (!peer.ownTeam) {
      throw new NotFoundException(
        'You do not have a team yet. Please create a team first.',
      );
    }

    const emailPattern = /^[^\s@]+@gmail\.com$/;

    if (!emailPattern.test(email)) {
      throw new BadRequestException(
        'Only Gmail email addresses are allowed for now.',
      );
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    const invitationSlug = generateInviteSlug();
    const mailerVariables = {
      teamName: peer.ownTeam.name.getTeamName(),
      invitationSlug: invitationSlug,
    };

    const invitation = await this.invitationRepository.saveAsync(
      new Invitation(
        '',
        new Email(email),
        new InviteSlug(invitationSlug),
        new TeamName(peer.ownTeam.name.getTeamName()),
        new FirstName(peer.firstName.getFirstName()),
        peer.id,
        expirationDate,
      ),
    );

    if (process.env.FEATURE_FLAG_MAILER_SEND_ENABLED === 'true') {
      await this.mailerSendService.sendEmail(
        email,
        process.env.MAILERSEND_INVITATION_TEMPLATE_ID,
        mailerVariables,
      );
    }

    this.eventEmitter.emit(
      'invitation.sent',
      new InvitationSentEvent(
        peer.id,
        invitation.id,
        peer.ownTeam.name.getTeamName(),
        email,
        invitation.slug.getInviteSlug(),
        expirationDate,
      ),
    );

    return invitation.id;
  }

  /**
   * Retrieves an invitation by its slug.
   *
   * @param slug - The slug of the invitation.
   * @returns The invitation entity.
   */
  async getInvitationAsync(slug: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findBySlugAsync(slug);

    if (!invitation) {
      throw new NotFoundException('The invitation was not found.');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('The invitation has already expired.');
    }

    return invitation;
  }

  /**
   * Accepts an invitation by updating the acceptedAt date.
   *
   * @param authProviderSub - The auth provider sub of the peer.
   * @param slug - The slug of the invitation.
   * @returns The updated invitation entity.
   */
  async acceptInvitationAsync(authProviderSub: string, slug: string): Promise<Invitation> {
    const peer =
      await this.peerRepository.getByAuthProviderSub(authProviderSub);

    if (!peer) {
      throw new NotFoundException('Peer was not found.');
    }

    const invitation = await this.invitationRepository.findBySlugAsync(slug);

    if (!invitation) {
      throw new NotFoundException('The invitation was not found.');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('The invitation has already expired.');
    }

    const updatedInvitation = await this.invitationRepository.updateAcceptedAtAsync(invitation.id);

    this.eventEmitter.emit(
      'invitation.accepted',
      new InvitationAcceptedEvent(
        peer.id,
        invitation.id,
        invitation.teamName.getTeamName(),
        updatedInvitation.teamOwner,
        updatedInvitation.acceptedAt,
      ),
    );

    return updatedInvitation;
  }
}
