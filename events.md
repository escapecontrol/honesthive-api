# Events in NestJS

In a NestJS application, you can use the built-in event system to publish and subscribe to events between different modules. This allows you to decouple your modules and enable communication between them.

NestJS provides a `@nestjs/event-emitter` package that you can use to implement an event-driven architecture. Here’s how you can set it up:

## Step 1: Install the Event Emitter Package

First, install the `@nestjs/event-emitter` package:

```bash
npm install @nestjs/event-emitter
```

## Step 2: Configure the Event Emitter Module

In your main application module (e.g., `app.module.ts`), import and configure the `EventEmitterModule`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './modules/user/user.module';
import { TeamModule } from './modules/team/team.module';
import { TeamMemberModule } from './modules/team-member/team-member.module';
import { TeamTypeModule } from './modules/team-type/team-type.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    TeamModule,
    TeamMemberModule,
    TeamTypeModule,
    FeedbackModule,
  ],
})
export class AppModule {}
```

## Step 3: Define Events

Define the events that you want to publish and subscribe to. For example, create an `events` directory and define an event class:

```typescript
export class FeedbackCreatedEvent {
  constructor(
    public readonly memberId: string,
    public readonly message: string,
  ) {}
}
```

## Step 4: Publish Events

In the module where the event is triggered, inject the `EventEmitter2` service and publish the event:

```typescript
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Feedback } from '../../domain/entities/feedback.entity';
import { FeedbackRepository } from '../../infrastructure/repositories/feedback.repository';
import { Message } from '../../domain/value-objects/message.vo';
import { FeedbackCreatedEvent } from '../../../events/feedback-created.event';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async givePeerFeedback(memberId: string, message: string): Promise<Feedback> {
    const feedback = new Feedback('', null, null, new Message(message), new Date());
    const savedFeedback = await this.feedbackRepository.saveAsync(feedback);

    // Publish the event
    this.eventEmitter.emit('feedback.created', new FeedbackCreatedEvent(memberId, message));

    return savedFeedback;
  }

  async getTeams(): Promise<Feedback[]> {
    return await this.feedbackRepository.findAllAsync();
  }
}
```

## Step 5: Subscribe to Events

In the module that needs to react to the event, create an event listener:

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FeedbackCreatedEvent } from '../../../events/feedback-created.event';

@Injectable()
export class FeedbackCreatedListener {
  @OnEvent('feedback.created')
  handleFeedbackCreatedEvent(event: FeedbackCreatedEvent) {
    // Handle the event (e.g., send a notification)
    console.log(`Feedback created for member ${event.memberId}: ${event.message}`);
  }
}
```

## Step 6: Register the Listener

Ensure the listener is registered in the appropriate module:

```typescript
import { Module } from '@nestjs/common';
import { FeedbackCreatedListener } from './application/listeners/feedback-created.listener';

@Module({
  providers: [FeedbackCreatedListener],
})
export class NotificationsModule {}
```

## Step 7: Import the Notifications Module

Finally, import the `NotificationsModule` in your main application module:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './modules/user/user.module';
import { TeamModule } from './modules/team/team.module';
import { TeamMemberModule } from './modules/team-member/team-member.module';
import { TeamTypeModule } from './modules/team-type/team-type.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    TeamModule,
    TeamMemberModule,
    TeamTypeModule,
    FeedbackModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

By following these steps, you can set up event-driven communication between different modules in your NestJS application. This allows you to publish events in one module and handle them in another, enabling decoupled and scalable architecture.
