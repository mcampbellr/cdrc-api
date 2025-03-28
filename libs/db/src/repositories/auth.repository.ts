import { DbService } from '@db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRepository {
  constructor(private prisma: DbService) {}
}
