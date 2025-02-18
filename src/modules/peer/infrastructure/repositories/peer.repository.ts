// src/modules/user/infrastructure/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PeerDocument } from '../schemas/peer.schema';
import { Peer } from '../../domain/entities/peer.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { FirstName } from '../../domain/value-objects/firstName.vo';
import { LastName } from '../../domain/value-objects/lastName.vo';
import { ProfileUrl } from '../../domain/value-objects/profileUrl.vo';
import { Team } from '../../domain/entities/team.entity';
import { TeamName } from '../../domain/value-objects/teamName.vo';
import { TeamType } from '../../domain/value-objects/teamType.vo';
import { TeamDocument } from './../schemas/team.schema';

@Injectable()
export class PeerRepository {
  constructor(
    @InjectModel('Peer') private readonly peerModel: Model<PeerDocument>,
    @InjectModel('Team') private readonly teamModel: Model<TeamDocument>,
  ) {}

  /**
   * Saves a new or updates an existing peer entity.
   *
   * @param user - The peer entity to be saved or updated.
   * @returns The saved or updated peer entity.
   */
  async saveAsync(user: Peer): Promise<Peer> {
    const existingPeer = await this.peerModel
      .findOne({ authProviderSub: user.authProviderSub })
      .exec();

    const mergedInvitedTeams = existingPeer
      ? Array.from(
          new Set([
            ...existingPeer.invitedTeams,
            ...user.invitedTeams.map((team) => team.id),
          ]),
        )
      : user.invitedTeams.map((team) => team.id);

    const updatedEntity = await this.peerModel
      .findOneAndUpdate(
        { authProviderSub: user.authProviderSub },
        {
          firstName: user.firstName.getFirstName(),
          lastName: user.lastName.getLastName(),
          email: user.email.getValue(),
          profileUrl: user.profileUrl?.getProfileUrl(),
          invitedTeams: mergedInvitedTeams,
        },
        { new: true, upsert: true }, // Create a new document if it doesn't exist
      )
      .populate('ownTeam') // Populate the ownTeam field
      .populate('invitedTeams') // Populate the invitedTeams field
      .exec();

    return new Peer(
      updatedEntity.id,
      new FirstName(updatedEntity.firstName),
      new LastName(updatedEntity.lastName),
      new Email(updatedEntity.email),
      updatedEntity.authProviderSub,
      updatedEntity.profileUrl
        ? new ProfileUrl(updatedEntity.profileUrl)
        : undefined,
      updatedEntity.ownTeam
        ? new Team(
            updatedEntity.ownTeam.id,
            new TeamName(updatedEntity.ownTeam.name),
            new TeamType(updatedEntity.ownTeam.type),
            user, // Assuming the owner is the current user
            [], // Assuming no members initially
            [], // Assuming no pending members initially
          )
        : undefined,
      updatedEntity.invitedTeams.map(
        (team) =>
          new Team(
            team.id,
            new TeamName(team.name),
            new TeamType(team.type),
            user, // Assuming the owner is the current user
            [], // Assuming no members initially
            [], // Assuming no pending members initially
          ),
      ),
    );
  }

  /**
   * Assigns a team as the own team of a peer identified by the peer's ID.
   *
   * @param peerId - The ID of the peer.
   * @param teamId - The ID of the team to be assigned as the own team.
   * @returns void
   */
  async assignOwnTeamAsync(peerId: string, teamId: string): Promise<void> {
    await this.peerModel
      .findByIdAndUpdate(
        peerId,
        { ownTeam: teamId }, // Set the ownTeam field as an ObjectId
        { new: true },
      )
      .exec();
  }

  /**
   * Assigns a team as an invited team to a peer identified by the peer's ID.
   *
   * @param userId - The ID of the peer.
   * @param team - The team to be assigned as an invited team.
   * @returns void
   */
  async assignInviteTeamAsync(userId: string, team: Team): Promise<void> {
    await this.peerModel.findByIdAndUpdate(userId, {
      $push: {
        invitedTeams: {
          id: team.id,
          name: team.name.getTeamName(),
          type: team.type.getTeamType(),
        },
      },
    });
  }

  /**
   * Retrieves a peer entity by the auth provider's sub identifier.
   *
   * @param authProviderSub - The auth provider's sub identifier.
   * @returns The peer entity, or null if not found.
   */
  async getByAuthProviderSub(authProviderSub: string): Promise<Peer | null> {
    const userDoc = await this.peerModel
      .findOne({ authProviderSub })
      .populate('ownTeam')
      .exec();
    if (!userDoc) {
      return null;
    }

    return new Peer(
      userDoc.id,
      new FirstName(userDoc.firstName),
      new LastName(userDoc.lastName),
      new Email(userDoc.email),
      userDoc.authProviderSub,
      userDoc.profileUrl ? new ProfileUrl(userDoc.profileUrl) : undefined,
      userDoc.ownTeam
        ? new Team(
            userDoc.ownTeam.id,
            new TeamName(userDoc.ownTeam.name),
            new TeamType(userDoc.ownTeam.type),
            new Peer(
              userDoc.id,
              new FirstName(userDoc.firstName),
              new LastName(userDoc.lastName),
              new Email(userDoc.email),
              userDoc.authProviderSub,
              userDoc.profileUrl
                ? new ProfileUrl(userDoc.profileUrl)
                : undefined,
            ),
            [], // Assuming no members initially
            [], // Assuming no pending members initially
          )
        : undefined,
    );
  }

  /**
   * Finds a peer by its ID.
   *
   * @param id - The ID of the peer.
   * @returns The peer entity.
   */
  async findByIdAsync(id: string): Promise<Peer | null> {
    const userDoc = await this.peerModel
      .findById(id)
      .populate('ownTeam')
      .exec();
    if (!userDoc) {
      return null;
    }

    return new Peer(
      userDoc.id,
      new FirstName(userDoc.firstName),
      new LastName(userDoc.lastName),
      new Email(userDoc.email),
      userDoc.authProviderSub,
      userDoc.profileUrl ? new ProfileUrl(userDoc.profileUrl) : undefined,
      userDoc.ownTeam
        ? new Team(
            userDoc.ownTeam.id,
            new TeamName(userDoc.ownTeam.name),
            new TeamType(userDoc.ownTeam.type),
            new Peer(
              userDoc.id,
              new FirstName(userDoc.firstName),
              new LastName(userDoc.lastName),
              new Email(userDoc.email),
              userDoc.authProviderSub,
              userDoc.profileUrl
                ? new ProfileUrl(userDoc.profileUrl)
                : undefined,
            ),
            [], // Assuming no members initially
            [], // Assuming no pending members initially
          )
        : undefined,
    );
  }
}
