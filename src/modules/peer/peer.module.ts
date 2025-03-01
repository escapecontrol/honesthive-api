import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeerSchema } from './infrastructure/schemas/peer.schema';
import { TeamSchema } from './infrastructure/schemas/team.schema';
import { PeerController } from './api/peer.controller';
import { PeerService } from './application/services/peer.service';
import { TeamService } from './application/services/team.service';
import { PeerRepository } from './infrastructure/repositories/peer.repository';
import { TeamRepository } from './infrastructure/repositories/team.repository';
import { FirebaseAuthService } from 'src/shared/application/services/firebase-auth.service';
import { TeamCreatedListener } from './application/eventListeners/teamCreated.listener';
import { InvitationController } from './api/invitation.controller';
import { InvitationService } from './application/services/invitation.service';
import { InvitationRepository } from './infrastructure/repositories/invitation.repository';
import { InvitationSchema } from './infrastructure/schemas/invitation.schema';
import { InvitationSentListener } from './application/eventListeners/invitationSent.listener';
import { MailerSendService } from './infrastructure/services/mailerSend.service';
import { MeController } from './api/me.controller';
import { FeedbackController } from './api/feedback.controller';
import { FeedbackService } from './application/services/feedback.service';
import { FeedbackRepository } from './infrastructure/repositories/feedback.repository';
import { FeedbackSchema } from './infrastructure/schemas/feedback.schema';
import { FeedbackGivenListener } from './application/eventListeners/feedbackGiven.listener';
import { TeamFeedbackRepository } from './infrastructure/repositories/teamFeedback.repository';
import { TeamFeedbackSchema } from './infrastructure/schemas/teamFeedback.schema';
import { TeamFeedbackService } from './application/services/teamFeedback.service';
import { OutboxSchema } from './infrastructure/schemas/outbox.schema';
import { OutboxRepository } from './infrastructure/repositories/outbox.repository';
import { OutboxProcessor } from './infrastructure/processors/outbox.processor';
import { OpenAIService } from './infrastructure/services/openAi.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Peer', schema: PeerSchema },
      { name: 'Team', schema: TeamSchema },
      { name: 'Invitation', schema: InvitationSchema },
      { name: 'Feedback', schema: FeedbackSchema },
      { name: 'TeamFeedback', schema: TeamFeedbackSchema },
      { name: 'Outbox', schema: OutboxSchema },
    ]),
  ],
  controllers: [
    PeerController,
    InvitationController,
    MeController,
    FeedbackController,
  ],
  providers: [
    PeerService,
    PeerRepository,
    TeamService,
    TeamRepository,
    TeamCreatedListener,
    InvitationService,
    InvitationRepository,
    InvitationSentListener,
    FirebaseAuthService,
    MailerSendService,
    FeedbackService,
    FeedbackRepository,
    FeedbackGivenListener,
    TeamFeedbackRepository,
    TeamFeedbackService,
    OutboxRepository,
    OutboxProcessor,
    OpenAIService,
  ],
})
export class PeerModule {}
