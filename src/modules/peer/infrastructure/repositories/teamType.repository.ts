import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamTypeDocument } from '../schemas/teamType.schema';

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
  async getAllTeamTypes(): Promise<TeamTypeDocument[]> {
    return await this.teamTypeModel.find().exec();
  }

  /**
   * Get a team type by name.
   *
   * @param name - The name of the team type.
   * @returns A promise that resolves with the team type document.
   */
  async getTeamTypeByName(name: string): Promise<TeamTypeDocument | null> {
    return await this.teamTypeModel.findOne({ name }).exec();
  }
}
