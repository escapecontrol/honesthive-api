import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/shared/api/firebase-auth-guard';
import { TeamTypeService } from '../application/services/teamType.service';

@Controller('teamtypes')
@UseGuards(FirebaseAuthGuard)
export class TeamTypeController {
  constructor(
    private readonly teamTypeService: TeamTypeService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOwnTeam() {
    const teamTypes = await this.teamTypeService.getAllTeamTypes();

    if (!teamTypes && teamTypes.length === 0) {
      throw new NotFoundException('We found no teamTypes.');
    }

    return {
      message: "A collection of teamTypes.",
      teamTypes: teamTypes.map((teamType) => {
        return {
          name: teamType.name.getTeamName(),
          growthCategories: teamType.growthCategories
        };
      }),
    };
  }
}
