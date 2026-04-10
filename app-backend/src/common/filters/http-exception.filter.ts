import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extract the message field, handling both string and object responses
      const rawMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exceptionResponse;

      // Flatten array messages (from class-validator) into a single readable string
      if (Array.isArray(rawMessage)) {
        message = rawMessage
          .map((m) => String(m))
          .filter(Boolean)
          .join('; ');
      } else if (typeof rawMessage === 'object' && rawMessage !== null) {
        // If message is an object (not a string or array), stringify the most useful field
        const obj = rawMessage as Record<string, unknown>;
        message =
          (typeof obj.message === 'string' && obj.message) ||
          (typeof obj.error === 'string' && obj.error) ||
          JSON.stringify(rawMessage);
      } else {
        message = String(rawMessage || 'An error occurred');
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Something went wrong. Please try again later.';
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Something went wrong. Please try again later.';
      this.logger.error(`Unknown exception: ${JSON.stringify(exception)}`);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
