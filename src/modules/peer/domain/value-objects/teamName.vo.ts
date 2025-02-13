import { HttpException, HttpStatus } from '@nestjs/common';

export class TeamName {
  constructor(private readonly teamName: string) {
    if (!this.isValidName(teamName)) {
      throw new HttpException('Invalid team name', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidName(name: string): boolean {
    return name.length > 0 && /^[a-zA-Z]+$/.test(name);
  }

  public getTeamName(): string {
    return this.teamName;
  }
}
