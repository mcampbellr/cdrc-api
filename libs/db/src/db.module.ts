import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { repositories } from '@db';

@Module({
  providers: [DbService, ...repositories],
  exports: [DbService, ...repositories],
})
export class DbModule {}
