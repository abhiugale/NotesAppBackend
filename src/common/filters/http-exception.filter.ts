import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object') {
        const resObj = res as any;
        if (Array.isArray(resObj.message)) {
          message = 'Validation failed';
          const fields: Record<string, string> = {};
          resObj.message.forEach((msg: string) => {
            // e.g. "title must be a string" -> field is "title"
            const field = msg.split(' ')[0] || 'field';
            fields[field] = msg;
          });
          errorDetails = { fields };
        } else {
          message = resObj.message || exception.message;
          errorDetails = resObj.error || resObj;
        }
      } else {
        message = res;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      error: errorDetails || exception.name || 'Error',
      timestamp: new Date().toISOString(),
    });
  }
}
