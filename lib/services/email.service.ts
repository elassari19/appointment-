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

export interface SendDoctorNotificationParams {
  to: string;
  doctorName: string;
  patientName: string;
  appointmentDate: Date;
  duration: number;
  meetingLink?: string;
  notes?: string;
  action: 'created' | 'rescheduled' | 'cancelled';
  oldDate?: Date;
  reason?: string;
}

export interface SendRescheduledEmailParams {
  to: string;
  patientName: string;
  doctorName: string;
  oldDate: Date;
  newDate: Date;
  duration: number;
  meetingLink?: string;
  reason?: string;
}

export interface SendCancellationEmailParams {
  to: string;
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  reason?: string;
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

  async sendAppointmentCancellation(params: SendCancellationEmailParams): Promise<boolean> {
    const { to, patientName, doctorName, appointmentDate, reason } = params;

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

    let reasonText = '';
    if (reason) {
      reasonText = `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Cancellation</p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #475569;">${reason}</p>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Cancelled</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #dc2626;">Appointment Cancelled</h1>
            <p style="margin: 8px 0 0; color: #64748b;">Your appointment has been cancelled</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e293b;">Appointment Details</h2>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Doctor</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${doctorName}</p>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Original Date & Time</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #dc2626; text-decoration: line-through;">${formattedDate}</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #dc2626; text-decoration: line-through;">${formattedTime}</p>
            </div>

            ${reasonText}
          </div>

          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Need to book a new appointment? 
              <a href="${APP_URL}/doctors" style="color: #facc15; text-decoration: none;">Browse doctors</a>
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
        subject: `Appointment Cancelled with ${doctorName}`,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Failed to send appointment cancellation email:', error);
      return false;
    }
  }

  async sendDoctorAppointmentNotification(params: SendDoctorNotificationParams): Promise<boolean> {
    const { to, doctorName, patientName, appointmentDate, duration, meetingLink, notes, action, oldDate, reason } = params;

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

    let subject = '';
    let headerText = '';

    switch (action) {
      case 'created':
        subject = `New Appointment Booked - ${patientName}`;
        headerText = 'New Appointment Scheduled';
        break;
      case 'rescheduled':
        subject = `Appointment Rescheduled - ${patientName}`;
        headerText = 'Appointment Rescheduled';
        break;
      case 'cancelled':
        subject = `Appointment Cancelled - ${patientName}`;
        headerText = 'Appointment Cancelled';
        break;
    }

    let oldDateText = '';
    if (oldDate) {
      oldDateText = `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Previous Date & Time</p>
          <p style="margin: 4px 0 0; font-size: 16px; color: #dc2626; text-decoration: line-through;">${new Date(oldDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      `;
    }

    let reasonText = '';
    if (reason) {
      reasonText = `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Reason</p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #475569;">${reason}</p>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #1e40af;">${headerText}</h1>
            <p style="margin: 8px 0 0; color: #475569;">A patient has ${action} an appointment</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e293b;">Appointment Details</h2>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Patient</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${patientName}</p>
            </div>

            ${oldDateText}

            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate}</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b;">${formattedTime}</p>
            </div>

            ${notes ? `
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #475569;">${notes}</p>
            </div>
            ` : ''}

            ${reasonText}
          </div>

          ${meetingLink && action !== 'cancelled' ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #1e40af;">Join Appointment</h2>
            <p style="margin: 0 0 16px; color: #475569;">Click the button below to join the video consultation</p>
            <a href="${meetingLink}" style="display: inline-block; background: #3b82f6; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Join Google Meet</a>
          </div>
          ` : ''}

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
        subject,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Failed to send doctor notification email:', error);
      return false;
    }
  }

  async sendAppointmentRescheduled(params: SendRescheduledEmailParams): Promise<boolean> {
    const { to, patientName, doctorName, oldDate, newDate, duration, meetingLink, reason } = params;

    const formattedOldDate = new Date(oldDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedOldTime = new Date(oldDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const formattedNewDate = new Date(newDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedNewTime = new Date(newDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let reasonText = '';
    if (reason) {
      reasonText = `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Reason</p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #475569;">${reason}</p>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Rescheduled</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">Appointment Rescheduled</h1>
            <p style="margin: 8px 0 0; color: #64748b;">Your appointment has been rescheduled</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e293b;">Appointment Details</h2>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Doctor</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${doctorName}</p>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Previous Date & Time</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #dc2626; text-decoration: line-through;">${formattedOldDate}</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #dc2626; text-decoration: line-through;">${formattedOldTime}</p>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">New Date & Time</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #16a34a; font-weight: 500;">${formattedNewDate}</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #16a34a; font-weight: 500;">${formattedNewTime}</p>
            </div>

            ${reasonText}
          </div>

          ${meetingLink ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #1e40af;">Join Your Appointment</h2>
            <p style="margin: 0 0 16px; color: #475569;">Click the button below to join your video consultation</p>
            <a href="${meetingLink}" style="display: inline-block; background: #facc15; color: #1e293b; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Join Google Meet</a>
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
        subject: `Appointment Rescheduled with ${doctorName}`,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Failed to send appointment rescheduled email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
