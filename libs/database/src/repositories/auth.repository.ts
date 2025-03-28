import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Injectable()
export class AuthRepository {
  constructor(private prisma: DatabaseService) {}
}
