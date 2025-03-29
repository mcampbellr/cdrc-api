import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { endOfDay, startOfDay } from 'date-fns';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { CALENDAR_ID } from './constants/calendar.constant';

export interface CurrentSchedule {
  start: Date;
  end: Date;
  timezone?: string;
}

interface GetCalendarEventsOptions {
  startTime: Date;
  endTime: Date;
}

@Injectable()
export class GoogleService {
  private _oauth2Client: OAuth2Client;
  constructor(private readonly config: ConfigService) {
    this._oauth2Client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  getOauth2Client() {
    return this._oauth2Client;
  }

  googleConnectLink(): string {
    return this._oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
      ],
    });
  }

  async getGoogleUser(accessToken: string) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
      const response = await oauth2.userinfo.get();

      if (response.status !== 200) {
        throw new ForbiddenException('Invalid Google token');
      }

      return response.data;
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  async getCalendarEventTimes(
    refresh_token: string,
    { start, end }: { start: Date; end: Date },
  ) {
    const oAuthClient = this.getOauth2Client();
    oAuthClient.setCredentials({ refresh_token });

    const events = await google.calendar('v3').events.list({
      calendarId: 'primary',
      eventTypes: ['default'],
      singleEvents: true,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      maxResults: 2500,
      auth: oAuthClient,
    });

    return (
      events.data.items
        ?.map((event) => {
          if (event.start?.date != null && event.end?.date != null) {
            return {
              start: startOfDay(event.start.date),
              end: endOfDay(event.end.date),
            };
          }

          if (event.start?.dateTime != null && event.end?.dateTime != null) {
            return {
              start: new Date(event.start.dateTime),
              end: new Date(event.end.dateTime),
            };
          }
        })
        .filter((date) => date != null) || []
    );
  }
}
