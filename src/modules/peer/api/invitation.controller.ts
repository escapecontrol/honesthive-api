import {
  Controller,
  Body,
  Put,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InvitationService } from '../application/services/invitation.service';
import { FirebaseAuthGuard } from 'src/shared/api/firebase-auth-guard';
import { Request } from 'express';

@Controller('invitations')
@UseGuards(FirebaseAuthGuard)
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an invitation to an email address.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'example@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 404, description: 'Peer not found' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async sendInvitation(
    @Req() request: Request,
    @Body() body: { email: string; },
  ) {
    const { sub } = request.user;
    const authProviderSub = sub;

    const invitationId = await this.invitationService.sendInvitationAsync(
      authProviderSub,
      body.email,
    );

    return { 
      message: 'Invitation sent successfully',
      id: invitationId };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve an invitation by its slug.' })
  @ApiParam({ name: 'slug', type: 'string', description: 'The slug of the invitation' })
  @ApiResponse({ status: 200, description: 'Invitation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async getInvitation(
    @Req() request: Request,
    @Param('slug') slug: string
  ) {
    const invitation = await this.invitationService.getInvitationAsync(slug);

    return { 
      message: 'Invitation retrieved successfully', 
      id: invitation.id,
      team: invitation.teamName.getTeamName(),
      friend: invitation.teamMemberName.getFirstName(),
    };
  }

  @Put(':slug/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation by its slug.' })
  @ApiParam({ name: 'slug', type: 'string', description: 'The slug of the invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async acceptInvitation(
    @Req() request: Request,
    @Param('slug') slug: string
  ) {
    const { sub } = request.user;
    const authProviderSub = sub;

    const acceptedTeam = await this.invitationService.acceptInvitationAsync(authProviderSub, slug);

    return { 
      message: 'Invitation accepted successfully',
      team: acceptedTeam,
    };
  }
}
