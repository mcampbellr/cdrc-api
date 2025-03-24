import { Injectable } from '@nestjs/common';
import { GoogleDto } from './dtos/google.dto';
import { PrismaAuthRepository } from 'db/database/repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: PrismaAuthRepository) {}
  signInWithGoogle(googleCredentials: GoogleDto) {}
}
