import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamFeedbackDocument } from '../schemas/teamFeedback.schema';
import { TeamFeedback, TeamFeedbackMember, TeamFeedbackTeam } from '../../domain/projections/teamFeedback.projection';
import { TeamDocument } from '../schemas/team.schema';

@Injectable()
export class TeamFeedbackRepository {
  constructor(
    @InjectModel('TeamFeedback') private readonly teamFeedbackModel: Model<TeamFeedbackDocument>,
    @InjectModel('Team') private readonly teamModel: Model<TeamDocument>,
  ) {}

  /**
   * Saves a new team feedback record.
   *
   * @param feedback - The team feedback entity to be saved.
   * @returns The saved team feedback entity.
   */
  async saveAsync(feedback: TeamFeedback): Promise<TeamFeedback> {
    const createdEntity = await this.teamFeedbackModel.create({
      team: feedback.Team.id,
      fromMember: feedback.FromMember.id,
      toMember: feedback.ToMember.id,
      message: feedback.Message,
      createdAt: new Date(),
    });

    // Populate the necessary fields
    const populatedEntity = await this.teamFeedbackModel
      .findById(createdEntity._id)
      .populate('team fromMember toMember')
      .exec();

    return new TeamFeedback(
      populatedEntity.id,
      new TeamFeedbackTeam(
        populatedEntity.team._id as string,
        populatedEntity.team.name,
        populatedEntity.team.type
      ),
      new TeamFeedbackMember(
        populatedEntity.fromMember._id as string,
        populatedEntity.fromMember.firstName,
        populatedEntity.fromMember.lastName,
      ),
      new TeamFeedbackMember(
        populatedEntity.toMember._id as string,
        populatedEntity.toMember.firstName,
        populatedEntity.toMember.lastName
      ),
      populatedEntity.message,
      populatedEntity.createdAt,
    );
  }

  /**
   * Retrieves feedback records for a specific team, with an optional limit on the number of records returned.
   *
   * @param teamId - The ID of the team.
   * @param limit - The optional limit on the number of records returned.
   * @returns The collection of team feedback records.
   */
  async getByTeamIdAsync(teamId: string, limit?: number): Promise<TeamFeedback[]> {
    const query = this.teamFeedbackModel.find({ team: teamId })
      .populate('team fromMember toMember');

    if (limit) {
      query.limit(limit);
    }

    const feedbackDocs = await query.exec();

    return feedbackDocs.map(doc => new TeamFeedback(
      doc.id,
      new TeamFeedbackTeam(
        doc.team.id,
        doc.team.name,
        doc.team.type
      ),
      new TeamFeedbackMember(
        doc.fromMember.id,
        doc.fromMember.firstName,
        doc.fromMember.lastName,
      ),
      new TeamFeedbackMember(
        doc.toMember.id,
        doc.toMember.firstName,
        doc.toMember.lastName
      ),
      doc.message,
      doc.createdAt,
    ));
  }
}
