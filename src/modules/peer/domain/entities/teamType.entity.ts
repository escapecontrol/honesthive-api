import { TeamName } from '../value-objects/teamName.vo';

export class GrowthCategory {
  constructor(
    public name: string,
    public description: string,
  ) {}
}

export class TeamType {
  constructor(
    public readonly id: string,
    public name: TeamName,
    public growthCategories: GrowthCategory[],
    public createdAt: Date,
  ) {}
}
