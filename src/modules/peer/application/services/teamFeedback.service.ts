import { Injectable } from '@nestjs/common';
import { TeamFeedbackRepository } from '../../infrastructure/repositories/teamFeedback.repository';

@Injectable()
export class TeamFeedbackService {
  constructor(
    private readonly teamFeedbackRepository: TeamFeedbackRepository,
  ) {}

  async getTeamFeedbackAsync(teamId: string, limit?: number) {
    return this.teamFeedbackRepository.getByTeamIdAsync(teamId, limit ?? 10);
  }  
}
