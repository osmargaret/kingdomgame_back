import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthController } from './health/health.controller.js';
import { ContentController } from './content/content.controller.js';
import { ContentService } from './content/content.service.js';
import { BibleNotesController } from './bible-notes/bible-notes.controller.js';
import { ArenaGateway } from './realtime/arena.gateway.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'kingdomgame_back',
    }),
  ],
  controllers: [
    AppController,
    HealthController,
    ContentController,
    BibleNotesController,
  ],
  providers: [AppService, ContentService, ArenaGateway],
})
export class AppModule {}
