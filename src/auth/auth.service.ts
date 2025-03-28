import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { GoogleDto } from './dtos/google.dto';
import { UsersRepository } from '@db';

@Injectable()
export class AuthService {
  constructor(private readonly _usersRepository: UsersRepository) {}
  async signInWithGoogle(googleCredentials: GoogleDto) {
    const { idToken } = googleCredentials;

    const response = await axios('https://www.googleapis.com/userinfo/v2/me', {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const status = response.status;

    if (status !== 200) {
      throw new Error('Invalid credentials');
    }

    const googleUser = response.data;

    let user = await this._usersRepository.findByGoogleId(googleUser.id);

    if (!user) {
      user = await this._usersRepository.findByEmail(googleUser.email);

      if (user) {
        user = await this._usersRepository.update(user.id, {
          googleId: googleUser.id,
        });
      } else {
        user = await this._usersRepository.create({
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
        });
      }
    }

    console.log({ user });

    return user;
  }
}
