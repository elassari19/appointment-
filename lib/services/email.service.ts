import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'Appointments <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface SendAppointmentEmailParams {
  to: string;
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  duration: number;
  meetingLink?: string;
  notes?: string;
}

export class EmailService {
  async sendAppointmentConfirmation(params: SendAppointmentEmailParams): Promise<boolean> {
    const { to, patientName, doctorName, appointmentDate, duration, meetingLink, notes } = params;

    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = new Date(appointmentDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + duration);
    const formattedEndTime = endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">Appointment Confirmed!</h1>
            <p style="margin: 8px 0 0; color: #64748b;">Your appointment has been successfully scheduled</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e293b;">Appointment Details</h2>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Doctor</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${doctorName}</p>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate}</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b;">${formattedTime} - ${formattedEndTime}</p>
            </div>

            ${notes ? `
            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #475569;">${notes}</p>
            </div>
            ` : ''}
          </div>

          ${meetingLink ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #1e40af;">Join Your Appointment</h2>
            <p style="margin: 0 0 16px; color: #475569;">Click the button below to join your video consultation</p>
            <a href="${meetingLink}" style="display: inline-block; background: #facc15; color: #1e293b; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Join Google Meet</a>
            <p style="margin: 12px 0 0; font-size: 12px; color: #64748b;">Or copy this link: ${meetingLink}</p>
          </div>
          ` : ''}

          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Need to reschedule or cancel? 
              <a href="${APP_URL}/patient/appointments" style="color: #facc15; text-decoration: none;">View your appointments</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">This is an automated message from Nutrison. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: to,
        subject: `Appointment Confirmed with ${doctorName} on ${formattedDate}`,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Failed to send appointment confirmation email:', error);
      return false;
    }
  }

  async sendAppointmentReminder(params: SendAppointmentEmailParams): Promise<boolean> {
    const { to, patientName, doctorName, appointmentDate, duration, meetingLink } = params;

    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = new Date(appointmentDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Reminder</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fef9c3; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">Appointment Reminder</h1>
            <p style="margin: 8px 0 0; color: #64748b;">Your appointment is coming up soon</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e293b;">Appointment Details</h2>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Doctor</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${doctorName}</p>
            </div>

            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate} at ${formattedTime}</p>
            </div>
          </div>

          ${meetingLink ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; text-align: center;">
            <a href="${meetingLink}" style="display: inline-block; background: #facc15; color: #1e293b; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Join Google Meet</a>
          </div>
          ` : ''}
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: to,
        subject: `Reminder: Appointment with ${doctorName} on ${formattedDate}`,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Failed to send appointment reminder email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
