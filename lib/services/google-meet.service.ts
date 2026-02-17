import { Appointment } from '@/lib/entities/Appointment';
import { User } from '@/lib/entities/User';
import { GoogleCalendarService, CalendarEvent, MeetSyncResult } from './google-calendar.service';

export interface MeetMeeting {
  id: string;
  meetingCode: string;
  meetingLink: string;
  dialInLink?: string;
  hostEmail?: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'active' | 'ended';
}

export interface CreateMeetParams {
  appointment: Appointment;
  patient: User;
  dietitian: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export class GoogleMeetService {
  private calendarService: GoogleCalendarService;

  constructor(tokens?: { accessToken: string; refreshToken?: string; expiresAt?: Date }) {
    if (tokens) {
      this.calendarService = new GoogleCalendarService({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt || new Date(Date.now() + 3600 * 1000),
      });
    } else {
      this.calendarService = new GoogleCalendarService();
    }
  }

  setTokens(tokens: { accessToken: string; refreshToken?: string; expiresAt?: Date }): void {
    this.calendarService.setTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt || new Date(Date.now() + 3600 * 1000),
    });
  }

  isAuthenticated(): boolean {
    return this.calendarService.isAuthenticated();
  }

  private generateRequestId(): string {
    return `nm${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
  }

  async createMeetMeeting(params: CreateMeetParams): Promise<MeetSyncResult> {
    try {
      const { appointment, patient, dietitian, accessToken } = params;

      this.setTokens({
        accessToken,
        refreshToken: params.refreshToken,
        expiresAt: params.expiresAt,
      });

      const endTime = new Date(appointment.startTime);
      endTime.setMinutes(endTime.getMinutes() + appointment.duration);

      const calendarEvent: CalendarEvent = {
        summary: `Nutrition Consultation: ${patient.firstName} ${patient.lastName}`,
        description: this.buildMeetingDescription(appointment, patient, dietitian),
        start: {
          dateTime: new Date(appointment.startTime).toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: [
          { email: patient.email, displayName: `${patient.firstName} ${patient.lastName}` },
          { email: dietitian.email, displayName: `${dietitian.firstName} ${dietitian.lastName}` },
        ],
        conferenceData: {
          createRequest: {
            requestId: this.generateRequestId(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const result = await this.calendarService.createEventWithMeet(calendarEvent);

      if (result.success && result.meetingLink) {
        return {
          success: true,
          meetingLink: result.meetingLink,
          eventId: result.eventId,
        };
      }

      if (result.success && result.eventId) {
        const fallbackLink = `https://meet.google.com/${result.eventId}`;
        return {
          success: true,
          meetingLink: fallbackLink,
          eventId: result.eventId,
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to create Google Meet meeting',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Meet meeting',
      };
    }
  }

  private buildMeetingDescription(appointment: Appointment, patient: User, dietitian: User): string {
    return `
Nutrition Consultation Appointment

Patient: ${patient.firstName} ${patient.lastName}
Dietitian: ${dietitian.firstName} ${dietitian.lastName}
Date: ${new Date(appointment.startTime).toLocaleDateString()}
Time: ${new Date(appointment.startTime).toLocaleTimeString()} - ${new Date(appointment.startTime.getTime() + appointment.duration * 60000).toLocaleTimeString()}

${appointment.notes ? `Notes: ${appointment.notes}` : ''}

This is an online consultation via Google Meet.
The meeting link will be available once the appointment is confirmed.

---
Confidential healthcare information. Only accessible to booked participants.
    `.trim();
  }

  async updateMeeting(
    conferenceId: string,
    updates: Partial<{
      startTime: Date;
      endTime: Date;
      notes: string;
    }>,
    accessToken: string
  ): Promise<MeetSyncResult> {
    try {
      this.setTokens({ accessToken });

      const eventUpdates: Partial<CalendarEvent> = {};

      if (updates.startTime) {
        eventUpdates.start = {
          dateTime: new Date(updates.startTime).toISOString(),
          timeZone: 'UTC',
        };
      }

      if (updates.endTime) {
        eventUpdates.end = {
          dateTime: new Date(updates.endTime).toISOString(),
          timeZone: 'UTC',
        };
      }

      if (updates.notes) {
        eventUpdates.description = updates.notes;
      }

      const result = await this.calendarService.updateEvent(conferenceId, eventUpdates);

      return {
        success: result.success,
        eventId: conferenceId,
        meetingLink: result.eventId ? `https://meet.google.com/${result.eventId}` : undefined,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update meeting',
      };
    }
  }

  async cancelMeeting(conferenceId: string, accessToken: string): Promise<MeetSyncResult> {
    try {
      this.setTokens({ accessToken });

      const result = await this.calendarService.deleteEvent(conferenceId);

      return {
        success: result.success,
        eventId: conferenceId,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel meeting',
      };
    }
  }

  async getMeetingDetails(conferenceId: string): Promise<MeetMeeting | null> {
    try {
      const event = await this.calendarService.getEvent(conferenceId);

      if (!event) {
        return null;
      }

      const entryPoints = event.conferenceData?.entryPoints;
      const meetLink = entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri;
      const phoneLink = entryPoints?.find((ep) => ep.entryPointType === 'phone')?.uri;

      return {
        id: event.id || conferenceId,
        meetingCode: this.extractMeetingCode(meetLink),
        meetingLink: meetLink || '',
        dialInLink: phoneLink,
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        status: this.determineMeetingStatus(new Date(event.start.dateTime), new Date(event.end.dateTime)),
      };
    } catch {
      return null;
    }
  }

  private extractMeetingCode(meetLink?: string): string {
    if (!meetLink) return '';
    const match = meetLink.match(/meet\.google\.com\/([a-z-]+)/);
    return match ? match[1] : '';
  }

  private determineMeetingStatus(startTime: Date, endTime: Date): 'pending' | 'active' | 'ended' {
    const now = new Date();

    if (now < startTime) return 'pending';
    if (now >= startTime && now <= endTime) return 'active';
    return 'ended';
  }

  static generateFallbackMeetLink(): string {
    const meetingId = Math.random().toString(36).substring(2, 11);
    return `https://meet.google.com/${meetingId}`;
  }
}
