import {
  Controller,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PeerService } from '../application/services/peer.service';
import { TeamService } from '../application/services/team.service';
import { FirebaseAuthGuard } from 'src/shared/api/firebase-auth-guard';
import { Request } from 'express';

@Controller('me')
@UseGuards(FirebaseAuthGuard)
export class MeController {
  constructor(
    private readonly peerService: PeerService,
    private readonly teamService: TeamService,
  ) {}

  @Get('teams')
  @HttpCode(HttpStatus.OK)
  async getOwnTeam(@Req() request: Request) {
    const { sub } = request.user;
    const authProviderSub = sub;

    const teams = await this.teamService.getMyTeamsAsync(authProviderSub);

    if (!teams && teams.length === 0) {
      throw new NotFoundException('There are no teams associated to you.');
    }

    return {
      message: "A collection of teams you're associated with.",
      teams: teams.map((team) => {
        return {
          id: team.id,
          name: team.name.getTeamName(),
          type: team.type.getValue(),
          members: team.members.map((member) => {
            return {
              id: member.id,
              name: `${member.firstName.getFirstName()} ${member.lastName.getLastName()}`,
              email: member.email.getValue(),
              profileUrl: member.profileUrl.getProfileUrl(),
            };
          }),
          pendingMembers: team.pendingMembers.map((pendingMember) => {
            return {
              id: pendingMember.id,
              name: "Unknown",
              email: pendingMember.email.getValue(),
              profileUrl: "",
            };
          }),
        }
      }),
    };
  }
}
