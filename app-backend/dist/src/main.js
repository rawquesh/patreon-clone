"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("./config");
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
        origin: config_1.branding.corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    await app.listen(config_1.business.server.port);
}
bootstrap();
//# sourceMappingURL=main.js.map