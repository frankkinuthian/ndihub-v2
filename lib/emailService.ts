import nodemailer from 'nodemailer';
import ical from 'ical-generator';
import { MasterClass } from './googleCalendar';

// Email configuration
const createTransporter = () => {
  // You can use different email providers
  if (process.env.EMAIL_PROVIDER === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Use App Password for Gmail
      },
    });
  }
  
  if (process.env.EMAIL_PROVIDER === 'smtp') {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Default to Gmail
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

export interface EmailInviteData {
  email: string;
  firstName: string;
  lastName: string;
  masterClass: MasterClass;
}

export async function sendMasterClassEmailInvite(inviteData: EmailInviteData): Promise<boolean> {
  try {
    console.log('Sending email invite for MasterClass:', {
      masterClassId: inviteData.masterClass.id,
      email: inviteData.email,
      title: inviteData.masterClass.title
    });

    const { email, firstName, lastName, masterClass } = inviteData;
    const transporter = createTransporter();

    // Create .ics calendar file
    const calendar = ical({
      name: 'NDIHub MasterClass',
      description: 'MasterClass Calendar Event',
      timezone: 'Africa/Nairobi', // Adjust to your timezone
    });

    // Add the event to calendar
    const event = calendar.createEvent({
      start: new Date(masterClass.startTime),
      end: new Date(masterClass.endTime),
      summary: masterClass.title,
      description: createEventDescription(masterClass),
      location: masterClass.isOnline 
        ? `Online - ${masterClass.conferenceType || 'Video Conference'}`
        : masterClass.location || 'Online',
      url: masterClass.meetingLink,
      organizer: {
        name: 'NDIHub',
        email: process.env.EMAIL_USER || 'noreply@ndihub.com'
      },
      attendees: [
        {
          name: `${firstName} ${lastName}`.trim(),
          email: email,
          status: 'accepted'
        }
      ]
    });

    // Add meeting link to event if available
    if (masterClass.meetingLink) {
      event.description(`${createEventDescription(masterClass)}\n\nJoin Meeting: ${masterClass.meetingLink}`);
    }

    // Generate .ics file content
    const icsContent = calendar.toString();

    // Create email content
    const emailHtml = createEmailTemplate({
      firstName,
      lastName,
      masterClass,
      joinLink: masterClass.meetingLink
    });

    const emailText = createEmailText({
      firstName,
      lastName,
      masterClass,
      joinLink: masterClass.meetingLink
    });

    // Send email with .ics attachment
    const mailOptions = {
      from: {
        name: 'NDIHub MasterClasses',
        address: process.env.EMAIL_USER || 'noreply@ndihub.com'
      },
      to: email,
      subject: `Calendar Invite: ${masterClass.title}`,
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: `${masterClass.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ],
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: icsContent
      }
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('Email invite sent successfully:', {
      messageId: result.messageId,
      email: email,
      masterClassId: masterClass.id,
      masterClassTitle: masterClass.title
    });

    return true;

  } catch (error) {
    console.error('Error sending email invite:', error);
    console.error('Invite data:', {
      email: inviteData.email,
      masterClassId: inviteData.masterClass.id,
      masterClassTitle: inviteData.masterClass.title
    });
    
    return false;
  }
}

function createEventDescription(masterClass: MasterClass): string {
  let description = `Join us for an exclusive MasterClass: ${masterClass.title}\n\n`;
  
  if (masterClass.instructor) {
    description += `Instructor: ${masterClass.instructor}\n`;
  }
  
  if (masterClass.description) {
    // Clean up the description
    const cleanDesc = masterClass.description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/Instructor:.*$/gm, '') // Remove instructor line if present
      .replace(/Max:.*$/gm, '') // Remove max line if present
      .replace(/Price:.*$/gm, '') // Remove price line if present
      .replace(/Premium.*$/gm, '') // Remove premium line if present
      .trim();
    
    if (cleanDesc) {
      description += `\nDescription:\n${cleanDesc}\n`;
    }
  }
  
  description += `\nEvent Details:\n`;
  description += `📅 Date: ${new Date(masterClass.startTime).toLocaleDateString()}\n`;
  description += `⏰ Time: ${new Date(masterClass.startTime).toLocaleTimeString()} - ${new Date(masterClass.endTime).toLocaleTimeString()}\n`;
  
  if (masterClass.isOnline) {
    description += `💻 Format: Online (${masterClass.conferenceType || 'Video Conference'})\n`;
  } else if (masterClass.location) {
    description += `📍 Location: ${masterClass.location}\n`;
  }
  
  description += `\nThank you for enrolling in this MasterClass. We look forward to seeing you there!\n\n`;
  description += `Best regards,\nThe NDIHub Team`;
  
  return description;
}

function createEmailTemplate({ firstName, masterClass, joinLink }: {
  firstName: string;
  lastName: string;
  masterClass: MasterClass;
  joinLink?: string;
}): string {
  const startDate = new Date(masterClass.startTime);
  const endDate = new Date(masterClass.endTime);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MasterClass Calendar Invite</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .join-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .calendar-note { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎓 MasterClass Invitation</h1>
    <h2>${masterClass.title}</h2>
  </div>
  
  <div class="content">
    <p>Hi ${firstName},</p>
    
    <p>Congratulations! You're successfully enrolled in <strong>${masterClass.title}</strong>.</p>
    
    <div class="event-details">
      <h3>📅 Event Details</h3>
      <p><strong>Date:</strong> ${startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>Time:</strong> ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
      ${masterClass.instructor ? `<p><strong>Instructor:</strong> ${masterClass.instructor}</p>` : ''}
      <p><strong>Format:</strong> ${masterClass.isOnline ? `Online (${masterClass.conferenceType || 'Video Conference'})` : masterClass.location || 'Online'}</p>
    </div>
    
    <div class="calendar-note">
      <h3>📱 Add to Your Calendar</h3>
      <p>A calendar file (.ics) is attached to this email. Click on it to automatically add this event to your calendar app (Google Calendar, Outlook, Apple Calendar, etc.).</p>
    </div>
    
    ${joinLink ? `
    <div style="text-align: center;">
      <a href="${joinLink}" class="join-button">🔗 Join Meeting Link</a>
      <p><small>This link will be active when the session starts</small></p>
    </div>
    ` : ''}
    
    <h3>What to Expect:</h3>
    <ul>
      <li>Interactive Q&A session with the instructor</li>
      <li>Real-world insights and practical tips</li>
      <li>Networking opportunities with other attendees</li>
      <li>Downloadable resources and materials</li>
    </ul>
    
    <p>If you have any questions, please don't hesitate to reach out to us.</p>
    
    <p>We're excited to see you at the MasterClass!</p>
    
    <div class="footer">
      <p>Best regards,<br><strong>The NDIHub Team</strong></p>
      <p><small>This email was sent because you enrolled in a MasterClass on NDIHub.</small></p>
    </div>
  </div>
</body>
</html>
  `;
}

function createEmailText({ firstName, masterClass, joinLink }: {
  firstName: string;
  lastName: string;
  masterClass: MasterClass;
  joinLink?: string;
}): string {
  const startDate = new Date(masterClass.startTime);
  const endDate = new Date(masterClass.endTime);
  
  return `
MasterClass Invitation: ${masterClass.title}

Hi ${firstName},

Congratulations! You're successfully enrolled in ${masterClass.title}.

EVENT DETAILS:
Date: ${startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
${masterClass.instructor ? `Instructor: ${masterClass.instructor}` : ''}
Format: ${masterClass.isOnline ? `Online (${masterClass.conferenceType || 'Video Conference'})` : masterClass.location || 'Online'}

ADD TO CALENDAR:
A calendar file (.ics) is attached to this email. Click on it to automatically add this event to your calendar app.

${joinLink ? `JOIN MEETING:
${joinLink}
(This link will be active when the session starts)` : ''}

WHAT TO EXPECT:
- Interactive Q&A session with the instructor
- Real-world insights and practical tips  
- Networking opportunities with other attendees
- Downloadable resources and materials

If you have any questions, please don't hesitate to reach out to us.

We're excited to see you at the MasterClass!

Best regards,
The NDIHub Team

This email was sent because you enrolled in a MasterClass on NDIHub.
  `.trim();
}
