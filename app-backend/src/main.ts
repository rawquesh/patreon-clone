import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { branding, business } from './config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (req.originalUrl === '/webhooks/stripe') {
        express.raw({ type: 'application/json' })(req, res, (err) => {
          if (err) {
            return next(err);
          }
          (req as any).rawBody = (req as any).body;
          next();
        });
      } else {
        express.json()(req, res, next);
      }
    },
  );

  app.enableCors({
    origin: branding.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.listen(business.server.port);
}
bootstrap();
