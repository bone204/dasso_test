import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'DaSSO Backend Gateway is Online and Operational!';
  }
}
