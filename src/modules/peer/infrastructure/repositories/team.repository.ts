import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamDocument } from './../schemas/team.schema';
import { Team } from '../../domain/entities/team.entity';
import { PeerDocument } from '../schemas/peer.schema';
import { Peer } from '../../domain/entities/peer.entity';
import { FirstName } from '../../domain/value-objects/firstName.vo';
import { LastName } from '../../domain/value-objects/lastName.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { ProfileUrl } from '../../domain/value-objects/profileUrl.vo';
import { Invitation } from '../../domain/entities/invitation.entity';
import { InviteSlug } from '../../domain/value-objects/inviteSlug.vo';
import { TeamName } from '../../domain/value-objects/teamName.vo';
import { TeamType } from '../../domain/value-objects/teamType.vo';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectModel('Team') private readonly teamModel: Model<TeamDocument>,
    @InjectModel('Peer') private readonly peerModel: Model<PeerDocument>,
  ) {}

  /**
   * Creates a new team or updates an existing team based on the provided data.
   *
   * @param team - The team entity containing the data to be saved.
   * @returns The saved or updated team entity.
   */
  async saveAsync(team: Team): Promise<Team> {
    const updatedEntity = await this.teamModel.findOneAndUpdate(
      { name: team.name.getTeamName() }, // Query to find the team by name
      {
        name: team.name.getTeamName(),
        type: team.type.getTeamType(),
        owner: team.owner.id,
        members: team.members.map(member => member.id), // Update members
        pendingMembers: team.pendingMembers.map(invitation => invitation.id), // Update pending members
      },
      { new: true, upsert: true } // Create a new document if it doesn't exist
    ).populate('owner members pendingMembers').exec();

    return new Team(
      updatedEntity.id,
      new TeamName(updatedEntity.name),
      new TeamType(updatedEntity.type),
      new Peer(
        updatedEntity.owner.id,
        new FirstName(updatedEntity.owner.firstName),
        new LastName(updatedEntity.owner.lastName),
        new Email(updatedEntity.owner.email),
        updatedEntity.owner.authProviderSub,
        updatedEntity.owner.profileUrl ? new ProfileUrl(updatedEntity.owner.profileUrl) : undefined,
      ),
      updatedEntity.members ? updatedEntity.members.map(member => new Peer(
        member.id,
        new FirstName(member.firstName),
        new LastName(member.lastName),
        new Email(member.email),
        member.authProviderSub,
        member.profileUrl ? new ProfileUrl(member.profileUrl) : undefined,
      )) : [],
      updatedEntity.pendingMembers ? updatedEntity.pendingMembers.map(invitation => new Invitation(
        invitation.id,
        new Email(invitation.email),
        new InviteSlug(invitation.slug),
        new TeamName(invitation.teamName),
        new FirstName(invitation.teamMemberName),
        invitation.teamOwner.id,
        invitation.expiresAt,
      )) : [],
    );
  }

  /**
   * Fetches the team owned by the linked peer's auth sub.
   *
   * @param authProviderSub - The auth provider's sub identifier.
   * @returns The team entity owned by the peer.
   */
  async getTeamByAuthProviderSub(
    authProviderSub: string,
  ): Promise<Team | null> {
    const peer = await this.peerModel
      .findOne({ authProviderSub })
      .populate({
        path: 'ownTeam',
        model: 'Team',
        populate: {
          path: 'members pendingMembers',
          populate: {
            path: 'pendingMembers',
            model: 'Invitation',
          },
        },
      })
      .exec();
    if (!peer || !peer.ownTeam) {
      return null;
    }

    const teamDoc = peer.ownTeam as TeamDocument;
    
    const members = teamDoc.members
      ? teamDoc.members
        .filter(member => member.authProviderSub !== authProviderSub) // Exclude the auth sub user
        .map(
          (member) =>
            new Peer(
              member.id,
              new FirstName(member.firstName),
              new LastName(member.lastName),
              new Email(member.email),
              member.authProviderSub,
              member.profileUrl ? new ProfileUrl(member.profileUrl) : undefined,
            ),
        )
      : [];
    const pendingMembers = teamDoc.pendingMembers
      ? teamDoc.pendingMembers.map(
          (invitation) =>
            new Invitation(
              invitation.id,
              new Email(invitation.email),
              new InviteSlug(invitation.slug),
              new TeamName(invitation.teamName),
              new FirstName(invitation.teamMemberName),
              invitation.teamOwner.id,
              invitation.expiresAt,
            ),
        )
      : [];

    return new Team(
      teamDoc.id,
      new TeamName(teamDoc.name),
      new TeamType(teamDoc.type),
      new Peer(
        peer.id,
        new FirstName(peer.firstName),
        new LastName(peer.lastName),
        new Email(peer.email),
        peer.authProviderSub,
        peer.profileUrl ? new ProfileUrl(peer.profileUrl) : undefined,
      ),
      members,
      pendingMembers,
    );
  }

  /**
   * Fetches the teams the peer has been invited to by the linked peer's auth sub.
   *
   * @param authProviderSub - The auth provider's sub identifier.
   * @returns The collection of team entities the peer has been invited to.
   */
  async getInvitedTeamsByAuthProviderSub(authProviderSub: string): Promise<Team[]> {
    const peer = await this.peerModel
      .findOne({ authProviderSub })
      .populate({
        path: 'invitedTeams',
        model: 'Team',
        populate: {
          path: 'owner members pendingMembers',
        },
      })
      .exec();

    if (!peer || !peer.invitedTeams) {
      return [];
    }

    const invitedTeams = peer.invitedTeams.map((team) => {
      const teamDoc = team as TeamDocument;

      const members = teamDoc.members
        ? teamDoc.members
          .filter(member => member.authProviderSub !== authProviderSub) // Exclude the auth sub user
          .map(
            (member) =>
              new Peer(
                member.id,
                new FirstName(member.firstName),
                new LastName(member.lastName),
                new Email(member.email),
                member.authProviderSub,
                member.profileUrl ? new ProfileUrl(member.profileUrl) : undefined,
              ),
          )
        : [];
      const pendingMembers = teamDoc.pendingMembers
        ? teamDoc.pendingMembers
          .map(
            (invitation) =>
              new Invitation(
                invitation.id,
                new Email(invitation.email),
                new InviteSlug(invitation.slug),
                new TeamName(invitation.teamName),
                new FirstName(invitation.teamMemberName),
                invitation.teamOwner.id,
                invitation.expiresAt,
              ),
          )
        : [];

      return new Team(
        teamDoc.id,
        new TeamName(teamDoc.name),
        new TeamType(teamDoc.type),
        new Peer(
          teamDoc.owner.id,
          new FirstName(teamDoc.owner.firstName),
          new LastName(teamDoc.owner.lastName),
          new Email(teamDoc.owner.email),
          '',
          teamDoc.owner.profileUrl ? new ProfileUrl(teamDoc.owner.profileUrl) : undefined,
        ),
        members,
        pendingMembers,
      );
    });

    return invitedTeams;
  }

  /**
   * Adds a new member to the pending members of a team.
   *
   * @param teamId - The ID of the team.
   * @param invitationId - The ID of the invitation to be added to the pending members.
   * @returns void
   */
  async addPendingMemberAsync(
    teamId: string,
    invitationId: string,
  ): Promise<void> {
    await this.teamModel
      .findByIdAndUpdate(
        teamId,
        { $addToSet: { pendingMembers: invitationId } }, // Add the invitation ID to the pendingMembers array
        { new: true },
      )
      .exec();
  }

  /**
   * Finds a team by its name.
   *
   * @param name - The name of the team.
   * @returns The team entity.
   */
  async findByNameAsync(name: string): Promise<Team | null> {
    const teamDoc = await this.teamModel.findOne({ name }).populate('owner members pendingMembers').exec();
    if (!teamDoc) {
      return null;
    }

    const members = teamDoc.members
      ? teamDoc.members.map(
          (member) =>
            new Peer(
              member.id,
              new FirstName(member.firstName),
              new LastName(member.lastName),
              new Email(member.email),
              member.authProviderSub,
              member.profileUrl ? new ProfileUrl(member.profileUrl) : undefined,
            ),
        )
      : [];
    const pendingMembers = teamDoc.pendingMembers
      ? teamDoc.pendingMembers.map(
          (invitation) =>
            new Invitation(
              invitation.id,
              new Email(invitation.email),
              new InviteSlug(invitation.slug),
              new TeamName(invitation.teamName),
              new FirstName(invitation.teamMemberName),
              invitation.teamOwner.id,
              invitation.expiresAt,
            ),
        )
      : [];

    return new Team(
      teamDoc.id,
      new TeamName(teamDoc.name),
      new TeamType(teamDoc.type),
      new Peer(
        teamDoc.owner.id,
        new FirstName(teamDoc.owner.firstName),
        new LastName(teamDoc.owner.lastName),
        new Email(teamDoc.owner.email),
        teamDoc.owner.authProviderSub,
        teamDoc.owner.profileUrl ? new ProfileUrl(teamDoc.owner.profileUrl) : undefined,
      ),
      members,
      pendingMembers,
    );
  }

  /**
   * Finds a team by its ID.
   *
   * @param id - The ID of the team.
   * @returns The team entity, or null if not found.
   */
  async findByIdAsync(id: string): Promise<Team | null> {
    const teamDoc = await this.teamModel.findById(id).populate('owner members pendingMembers').exec();
    if (!teamDoc) {
      return null;
    }

    return new Team(
      teamDoc.id,
      new TeamName(teamDoc.name),
      new TeamType(teamDoc.type),
      new Peer(
        teamDoc.owner.id,
        new FirstName(teamDoc.owner.firstName),
        new LastName(teamDoc.owner.lastName),
        new Email(teamDoc.owner.email),
        teamDoc.owner.authProviderSub,
        teamDoc.owner.profileUrl ? new ProfileUrl(teamDoc.owner.profileUrl) : undefined,
      ),
      teamDoc.members ? teamDoc.members.map(member => new Peer(
        member.id,
        new FirstName(member.firstName),
        new LastName(member.lastName),
        new Email(member.email),
        member.authProviderSub,
        member.profileUrl ? new ProfileUrl(member.profileUrl) : undefined,
      )) : [],
      teamDoc.pendingMembers ? teamDoc.pendingMembers.map(invitation => new Invitation(
        invitation.id,
        new Email(invitation.email),
        new InviteSlug(invitation.slug),
        new TeamName(invitation.teamName),
        new FirstName(invitation.teamMemberName),
        invitation.teamOwner.id,
        invitation.expiresAt,
      )) : [],
    );
  }
}
