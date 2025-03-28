import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppLoggerMiddleware } from './middlewares';
import { ScheduleModule } from './schedule/schedule.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ScheduleModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
