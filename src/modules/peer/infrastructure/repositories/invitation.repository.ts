import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvitationDocument } from '../schemas/invitation.schema';
import { Invitation } from '../../domain/entities/invitation.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { InviteSlug } from '../../domain/value-objects/inviteSlug.vo';
import { FirstName } from '../../domain/value-objects/firstName.vo';
import { TeamName } from '../../domain/value-objects/teamName.vo';

@Injectable()
export class InvitationRepository {
  constructor(
    @InjectModel('Invitation') private readonly invitationModel: Model<InvitationDocument>,
  ) {}

  async saveAsync(invitation: Invitation): Promise<Invitation> {
    const createdEntity = await this.invitationModel.create({
      email: invitation.email.getValue(),
      slug: invitation.slug.getInviteSlug(),
      teamName: invitation.teamName.getTeamName(),
      teamMemberName: invitation.teamMemberName.getFirstName(),
      teamOwner: invitation.teamOwner,
      createdAt: new Date(),
      expiresAt: invitation.expiresAt,
    });

    return new Invitation(
      createdEntity.id,
      invitation.email,
      invitation.slug,
      invitation.teamName,
      invitation.teamMemberName,
      invitation.teamOwner,
      createdEntity.expiresAt,
    );
  }

  /**
   * Finds an invitation by its slug.
   *
   * @param slug - The slug of the invitation.
   * @returns The invitation entity.
   */
  async findBySlugAsync(slug: string): Promise<Invitation | null> {
    const invitation = await this.invitationModel.findOne({ slug }).exec();
    if (!invitation) {
      return null;
    }

    return new Invitation(
      invitation.id,
      new Email(invitation.email),
      new InviteSlug(invitation.slug),
      new TeamName(invitation.teamName),
      new FirstName(invitation.teamMemberName),
      invitation.teamOwner.id,
      invitation.expiresAt,
    );
  }

  /**
   * Updates the acceptedAt date of an invitation with the current date.
   *
   * @param id - The ID of the invitation.
   * @returns The updated invitation entity.
   */
  async updateAcceptedAtAsync(id: string): Promise<Invitation | null> {
    const currentDate = new Date();
    const updatedInvitation = await this.invitationModel.findByIdAndUpdate(
      id,
      { 
        acceptedAt: currentDate,
        expiresAt: currentDate,
      },
      { new: true }
    ).populate("teamOwner").exec();

    if (!updatedInvitation) {
      return null;
    }

    return new Invitation(
      updatedInvitation.id,
      new Email(updatedInvitation.email),
      new InviteSlug(updatedInvitation.slug),
      new TeamName(updatedInvitation.teamName),
      new FirstName(updatedInvitation.teamMemberName),
      updatedInvitation.teamOwner.id,
      updatedInvitation.expiresAt,
      updatedInvitation.acceptedAt,
    );
  }
}
