import {
  Controller,
  Put,
  Body,
  Get,
  Post,
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
import { profile } from 'console';

@Controller('peers')
@UseGuards(FirebaseAuthGuard)
export class PeerController {
  constructor(
    private readonly peerService: PeerService,
    private readonly teamService: TeamService,
  ) {}

  @Put('me')
  @HttpCode(HttpStatus.OK)
  async saveProfile(
    @Req() request: Request,
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email: string;
      profileUrl?: string;
    },
  ) {
    const { sub } = request.user;
    const authProviderSub = sub;

    const createdPeer = await this.peerService.saveProfileAsync(
      body.firstName,
      body.lastName,
      body.email,
      authProviderSub,
      body.profileUrl,
    );

    return { peerId: createdPeer.id };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfileByAuthProviderSub(@Req() request: Request) {
    const { sub } = request.user;
    const authProviderSub = sub;
    const profile = await this.peerService.getProfileAsync(authProviderSub);

    if (!profile) {
      return {};
    }

    return {
      firstName: profile.firstName.getFirstName(),
      lastName: profile.lastName.getLastName(),
      email: profile.email.getValue(),
      profileUrl: profile.profileUrl?.getProfileUrl(),
    };
  }

  @Post('me/own-team')
  @HttpCode(HttpStatus.OK)
  async assignOwnTeam(
    @Req() request: Request,
    @Body() body: { name: string; type: string },
  ) {
    const { sub } = request.user;
    const authProviderSub = sub;

    const team = await this.teamService.createTeamAsync(
      authProviderSub,
      body.name,
      body.type,
    );

    return {
      message: 'Team created successfully.',
      team: team,
    };
  }

  @Get('me/own-team')
  @HttpCode(HttpStatus.OK)
  async getOwnTeam(@Req() request: Request) {
    const { sub } = request.user;
    const authProviderSub = sub;

    const team = await this.teamService.getMyTeamAsync(authProviderSub);

    if (!team) {
      throw new NotFoundException('You do not have a team yet.');
    }

    return {
      name: team.name.getTeamName(),
      type: team.type.getTeamType(),
      members: team.members.map(member => ({
        id: member.id,
        name: `${member.firstName.getFirstName()} ${member.lastName.getLastName()}`,
        email: member.email.getValue(),
        profileUrl: member.profileUrl ? member.profileUrl.getProfileUrl() : null,
      })),
      pendingMembers: team.pendingMembers.map(invitation => ({
        id: invitation.id,
        name: "Pending",
        email: invitation.email.getValue(),
        profileUrl: "https://i.pravatar.cc/150?img=50",
      })),
    };
  }
}
