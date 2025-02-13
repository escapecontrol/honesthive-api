import { Injectable } from '@nestjs/common';
import { Peer } from '../../domain/entities/peer.entity';
import { FirstName } from '../../domain/value-objects/firstName.vo';
import { LastName } from '../../domain/value-objects/lastName.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { ProfileUrl } from '../../domain/value-objects/profileUrl.vo';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProfileSavedEvent } from '../../../../shared/domain/events/peer/profile-saved.event';

@Injectable()
export class PeerService {
  constructor(
    private readonly peerRepository: PeerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Saves the profile of a peer.
   * If a peer with the given authProviderSub already exists, it updates the profile.
   * Otherwise, it creates a new peer profile.
   *
   * @param firstName - The first name of the peer.
   * @param lastName - The last name of the peer.
   * @param emailAddress - The email address of the peer.
   * @param authProviderSub - The auth provider's sub identifier.
   * @param profileUrl - The profile URL of the peer (optional).
   * @returns The saved or updated peer entity.
   */
  async saveProfileAsync(
    firstName: string,
    lastName: string,
    emailAddress: string,
    authProviderSub: string,
    profileUrl?: string,
  ): Promise<Peer> {
    const peer = new Peer(
      '', // Let the Peer class generate the id
      new FirstName(firstName),
      new LastName(lastName),
      new Email(emailAddress),
      authProviderSub,
      profileUrl ? new ProfileUrl(profileUrl) : undefined,
    );

    const savedPeer = await this.peerRepository.saveAsync(peer);

    this.eventEmitter.emit(
      'profile.saved',
      new ProfileSavedEvent(
        savedPeer.id,
        savedPeer.firstName.getFirstName(),
        savedPeer.lastName.getLastName(),
        savedPeer.email.getValue(),
        savedPeer.profileUrl?.getProfileUrl(),
      ),
    );

    return savedPeer;
  }

  /**
   * Retrieves the profile of a peer by the auth provider's sub identifier.
   *
   * @param sub - The auth provider's sub identifier.
   * @returns The peer entity.
   */
  async getProfileAsync(sub: string): Promise<Peer> {
    return this.peerRepository.getByAuthProviderSub(sub);
  }
}
