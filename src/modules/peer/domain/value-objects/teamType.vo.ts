import { HttpException, HttpStatus } from '@nestjs/common';

export class TeamType {
  constructor(private readonly teamType: string) {
    if (!this.isValidTeamType(teamType)) {
      throw new HttpException('Invalid team type', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidTeamType(teamType: string): boolean {
    return teamType.toLowerCase() === 'family' || teamType.toLowerCase() === 'organisation';
  }

  public getTeamType(): string {
    return this.teamType;
  }
}
