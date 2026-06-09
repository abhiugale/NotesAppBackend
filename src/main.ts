import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

async function bootstrap() {
  // CORS must be enabled before any other middleware
  const app = await NestFactory.create(AppModule, { cors: false });

  // Enable CORS first — before helmet or any other middleware
  app.enableCors({
    origin: true,          // reflect request origin
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Security headers (crossOriginResourcePolicy relaxed so responses aren't blocked)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // NoSQL query sanitization (body only — req.query is read-only in newer Express)
  app.use((req: any, _res: any, next: any) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
