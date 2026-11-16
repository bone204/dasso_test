import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'dasso-server-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/v1/auth/status')
  getAuthStatus() {
    return {
      gateway: 'active',
      keycloakIntegrated: true,
      mode: 'protection-proxy',
    };
  }

  @Post('api/v1/admin/sync-user')
  syncUser(@Body() payload: Record<string, any>) {
    return {
      action: 'user_sync',
      status: 'processed',
      receivedData: payload,
    };
  }
}
