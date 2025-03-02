import { Injectable } from '@nestjs/common';
import { TeamTypeRepository } from '../../infrastructure/repositories/teamType.repository';
import { GrowthCategory, TeamType } from '../../domain/entities/teamType.entity';
import { TeamName } from '../../domain/value-objects/teamName.vo';

@Injectable()
export class TeamTypeService {
  constructor(
    private readonly teamTypeRepository: TeamTypeRepository,
  ) {}

  /**
   * Get all team types.
   *
   * @returns A promise that resolves with an array of all team types.
   */
  async getAllTeamTypes(): Promise<TeamType[]> {
    // NOTE: This get operation could be optimized by using a cache.
    const teamTypeDocuments = await this.teamTypeRepository.getAllTeamTypes();
    return teamTypeDocuments.map(doc => new TeamType(
      doc.id,
      new TeamName(doc.name),
      doc.growthCategories.map(category => new GrowthCategory(category.name, category.description)),
      doc.createdAt,
    ));
  }

  /**
   * Get a team type by name.
   *
   * @param name - The name of the team type.
   * @returns A promise that resolves with the team type.
   */
  async getTeamTypeByName(name: string): Promise<TeamType | null> {
    const teamTypeDocument = await this.teamTypeRepository.getTeamTypeByName(name);
    if (!teamTypeDocument) {
      return null;
    }
    return new TeamType(
      teamTypeDocument.id,
      new TeamName(teamTypeDocument.name),
      teamTypeDocument.growthCategories.map(category => new GrowthCategory(category.name, category.description)),
      teamTypeDocument.createdAt,
    );
  }
}
