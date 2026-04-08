"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((req, res, next) => {
        if (req.originalUrl === '/webhooks/stripe') {
            express.raw({ type: 'application/json' })(req, res, (err) => {
                if (err) {
                    return next(err);
                }
                req.rawBody = req.body;
                next();
            });
        }
        else {
            express.json()(req, res, next);
        }
    });
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://patreon-clone.vercel.app',
            'https://www.patreon-clone.example.com',
            'https://patreon-clone.example.com',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    await app.listen(8080);
}
bootstrap();
//# sourceMappingURL=main.js.map