import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'kingdomgame_back',
      platform: 'Kingdom Quest',
      timestamp: new Date().toISOString(),
    };
  }
}

