import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamTypeDocument } from '../schemas/teamType.schema';
import { GrowthCategory, TeamType } from '../../domain/entities/teamType.entity';
import { TeamName } from '../../domain/value-objects/teamName.vo';

@Injectable()
export class TeamTypeRepository {
  constructor(
    @InjectModel('TeamType') private readonly teamTypeModel: Model<TeamTypeDocument>,
  ) {}

  /**
   * Get all team types.
   *
   * @returns A promise that resolves with an array of all team types.
   */
  async getAllTeamTypesAsync(): Promise<TeamType[]> {
    const teamTypes = await this.teamTypeModel
      .find()
      .sort({ name: 1 })
      .exec();

    return teamTypes.map((teamType) => new TeamType(
      teamType.id,
      new TeamName(teamType.name),
      teamType.growthCategories.map((category) => new GrowthCategory(
        category.name,
        category.description
      )),
      teamType.createdAt,
    ));
  }

  /**
   * Get a team type by name.
   *
   * @param name - The name of the team type.
   * @returns A promise that resolves with the team type document.
   */
  async getTeamTypeByNameAsync(name: string): Promise<TeamType | null> {
    const teamType = await this.teamTypeModel.findOne({ name }).exec();

    return teamType ? new TeamType(
      teamType.id,
      new TeamName(teamType.name),
      teamType.growthCategories.map((category) => new GrowthCategory(
        category.name,
        category.description
      )),
      teamType.createdAt,
    ) : null;
  }
}
