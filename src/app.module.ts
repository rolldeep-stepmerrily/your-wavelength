import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';

import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { HttpLoggerMiddleware } from './shared/middlewares';
import { AppController } from './application/controllers/app.controller';
import { ConfigProviderModule } from './shared/config-provider';
import { UserModule } from './infrastructure/modules/user.module';
import {
  REDIS_HOST_PROVIDER,
  REDIS_PASSWORD_PROVIDER,
  REDIS_PORT_PROVIDER,
} from './shared/config-provider/config.provider';
import { RedisModule } from './infrastructure/database/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        SERVER_URL: Joi.string().required(),
        NODE_ENV: Joi.string().valid('development', 'production', 'provision').default('development'),
        PORT: Joi.number().default(3065),
        DATABASE_URL: Joi.string().required(),
        ADMIN_NAME: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),
        GUEST_NAME: Joi.string().required(),
        GUEST_PASSWORD: Joi.string().required(),
        JWT_SECRET_KEY: Joi.string().required(),
        EMAIL_ADDRESS: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
        AWS_CLOUDFRONT_DOMAIN: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        GIT_ACCESS_TOKEN: Joi.string().required(),
      }),
      isGlobal: true,
      envFilePath: '.env',
      validationOptions: { abortEarly: true },
    }),
    PrismaModule,
    ConfigProviderModule,
    RedisModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    UserModule,
  ],
  controllers: [AppController],
  providers: [{ provide: 'APP_GUARD', useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
