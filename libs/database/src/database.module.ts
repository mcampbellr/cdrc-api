import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { repositories } from '.';

@Module({
  providers: [DatabaseService, ...repositories],
  exports: [DatabaseService, ...repositories],
})
export class DatabaseModule {}
