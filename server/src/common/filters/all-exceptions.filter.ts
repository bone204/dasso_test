import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseCodes } from '../constants/response-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!response || typeof response.status !== 'function') {
      this.logger.error('Unhandled non-HTTP exception', exception);
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ResponseCodes.SERVER_ERROR;
    let message = 'An unexpected internal server error occurred';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = this.mapStatusToCode(status);
      } else if (typeof res === 'object' && res !== null) {
        const errorObj = res as Record<string, any>;
        message = errorObj.message || exception.message;
        code = errorObj.code || this.mapStatusToCode(status);
        details = errorObj.error || errorObj.details || null;
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case 400:
        return ResponseCodes.VALIDATION_ERROR;
      case 401:
        return ResponseCodes.UNAUTHORIZED;
      case 403:
        return ResponseCodes.FORBIDDEN;
      case 404:
        return ResponseCodes.NOT_FOUND;
      default:
        return ResponseCodes.SERVER_ERROR;
    }
  }
}

