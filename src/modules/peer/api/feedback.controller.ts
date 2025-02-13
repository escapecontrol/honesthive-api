import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/shared/api/firebase-auth-guard';
import { Request } from 'express';
import { FeedbackService } from '../application/services/feedback.service';
import { TeamFeedbackService } from '../application/services/teamFeedback.service';

class GiveFeedbackDto {
  toMemberId: string;
  message: string;
}

@ApiTags('feedback')
@Controller('feedback')
@UseGuards(FirebaseAuthGuard)
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly teamFeedbackService: TeamFeedbackService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Give feedback to a team member' })
  @ApiBody({ type: GiveFeedbackDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'The feedback has been given successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async giveFeedback(@Req() request: Request) {
    const { sub } = request.user;
    const authProviderSub = sub;

    await this.feedbackService.giveFeedbackAsync(
      authProviderSub,
      request.body.toMemberId,
      request.body.message,
    );

    return {
      message: "The feedback has been given successfully",
    };
  }

  @Get('teams/:teamId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get feedback for a team' })
  @ApiParam({ name: 'teamId', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'The feedback records have been retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async getFeedback(@Param('teamId') teamId: string, @Query('limit') limit?: number) {
    const feedback = await this.teamFeedbackService.getTeamFeedbackAsync(teamId, limit);
    return {
      message: "The feedback records have been retrieved successfully",
      feedback: feedback.map(f => ({
        avatar: '',
        name: f.ToMember.firstName + ' ' + f.ToMember.lastName,
        message: f.Message,
        date: f.CreatedAt,
        email: '***',
        isStandout: false,
      })),
    };
  }
}
