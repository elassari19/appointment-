import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { User } from '@/lib/entities/User';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export interface CalendarSyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

export interface GoogleCalendarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export class GoogleCalendarService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;

  constructor(tokens?: GoogleCalendarTokens) {
    if (tokens) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.expiresAt = tokens.expiresAt;
    }
  }

  setTokens(tokens: GoogleCalendarTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.expiresAt = tokens.expiresAt;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.refreshToken && 
           (!this.expiresAt || this.expiresAt > new Date());
  }

  private getAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  getAuthorizationUrl(clientId: string, redirectUri: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];
    return this.getAuthUrl(clientId, redirectUri, scopes);
  }

  async exchangeCodeForTokens(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<GoogleCalendarTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3${endpoint}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Google Calendar API error');
    }

    return response.json();
  }

  async createEvent(event: CalendarEvent): Promise<CalendarSyncResult> {
    try {
      const result = await this.makeRequest('/calendars/primary/events', 'POST', {
        ...event,
        conferenceDataVersion: 1,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      });

      return {
        success: true,
        eventId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create calendar event',
      };
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarSyncResult> {
    try {
      await this.makeRequest(`/calendars/primary/events/${eventId}`, 'PATCH', event);
      return {
        success: true,
        eventId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update calendar event',
      };
    }
  }

  async deleteEvent(eventId: string): Promise<CalendarSyncResult> {
    try {
      await this.makeRequest(`/calendars/primary/events/${eventId}`, 'DELETE');
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete calendar event',
      };
    }
  }

  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    try {
      const result = await this.makeRequest(`/calendars/primary/events/${eventId}`);
      return this.mapToCalendarEvent(result);
    } catch {
      return null;
    }
  }

  async listEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const result = await this.makeRequest(`/calendars/primary/events?${params.toString()}`);
      return (result.items || []).map(this.mapToCalendarEvent);
    } catch {
      return [];
    }
  }

  private mapToCalendarEvent(googleEvent: any): CalendarEvent {
    return {
      id: googleEvent.id,
      summary: googleEvent.summary,
      description: googleEvent.description,
      location: googleEvent.location,
      start: {
        dateTime: googleEvent.start?.dateTime || googleEvent.start?.date,
        timeZone: googleEvent.start?.timeZone,
      },
      end: {
        dateTime: googleEvent.end?.dateTime || googleEvent.end?.date,
        timeZone: googleEvent.end?.timeZone,
      },
      attendees: googleEvent.attendees?.map((a: any) => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus,
      })),
      conferenceData: googleEvent.conferenceData,
    };
  }

  static appointmentToCalendarEvent(
    appointment: Appointment,
    patient: User,
    dietitian: User,
    timezone: string = 'UTC'
  ): CalendarEvent {
    const endTime = new Date(appointment.startTime);
    endTime.setMinutes(endTime.getMinutes() + appointment.duration);

    return {
      summary: `Nutrition Consultation: ${patient.firstName} ${patient.lastName}`,
      description: `
Appointment with ${patient.firstName} ${patient.lastName}

${appointment.notes || 'No additional notes'}

Join meeting: ${appointment.meetingLink || 'TBD'}
      `.trim(),
      start: {
        dateTime: new Date(appointment.startTime).toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: timezone,
      },
      attendees: [
        { email: patient.email, displayName: `${patient.firstName} ${patient.lastName}` },
        { email: dietitian.email, displayName: `${dietitian.firstName} ${dietitian.lastName}` },
      ],
    };
  }

  static generateMeetLink(): string {
    const meetingId = Math.random().toString(36).substring(2, 11);
    return `https://meet.google.com/${meetingId}`;
  }
}
