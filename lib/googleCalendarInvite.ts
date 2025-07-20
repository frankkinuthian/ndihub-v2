import { google } from "googleapis";
import { MasterClass } from "./googleCalendar";

// Initialize Google Calendar API for invites
function getCalendarClient() {
  const credentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`,
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
  });

  return google.calendar({ version: 'v3', auth });
}

export interface InviteData {
  email: string;
  firstName: string;
  lastName: string;
  masterClass: MasterClass;
}

export async function sendMasterClassInvite(inviteData: InviteData): Promise<boolean> {
  try {
    console.log('Sending Google Calendar invite for MasterClass:', {
      masterClassId: inviteData.masterClass.id,
      email: inviteData.email,
      title: inviteData.masterClass.title
    });

    const calendar = getCalendarClient();
    const { email, firstName, lastName, masterClass } = inviteData;

    // Get the original event to update it with the new attendee
    const originalEvent = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: masterClass.id,
    });

    if (!originalEvent.data) {
      throw new Error('Original MasterClass event not found');
    }

    // Prepare attendee data
    const newAttendee = {
      email: email,
      displayName: `${firstName} ${lastName}`.trim(),
      responseStatus: 'accepted', // Auto-accept since they paid
      comment: 'Enrolled via NDIHub payment'
    };

    // Get existing attendees and add the new one
    const existingAttendees = originalEvent.data.attendees || [];
    
    // Check if user is already invited
    const alreadyInvited = existingAttendees.some(attendee => 
      attendee.email?.toLowerCase() === email.toLowerCase()
    );

    if (alreadyInvited) {
      console.log('User already invited to this MasterClass:', email);
      return true;
    }

    // Add new attendee
    const updatedAttendees = [...existingAttendees, newAttendee];

    // Update the event with new attendee
    await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: masterClass.id,
      sendUpdates: 'all', // Send email notifications to all attendees
      requestBody: {
        ...originalEvent.data,
        attendees: updatedAttendees,
      },
    });

    console.log('Successfully added attendee to MasterClass:', {
      eventId: masterClass.id,
      attendeeEmail: email,
      totalAttendees: updatedAttendees.length
    });

    return true;

  } catch (error) {
    console.error('Error sending MasterClass invite:', error);
    console.error('Invite data:', {
      email: inviteData.email,
      masterClassId: inviteData.masterClass.id,
      masterClassTitle: inviteData.masterClass.title
    });
    
    // Don't throw error - enrollment should still succeed even if invite fails
    return false;
  }
}

export async function removeMasterClassInvite(email: string, masterClassId: string): Promise<boolean> {
  try {
    console.log('Removing Google Calendar invite for MasterClass:', {
      masterClassId,
      email
    });

    const calendar = getCalendarClient();

    // Get the original event
    const originalEvent = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: masterClassId,
    });

    if (!originalEvent.data) {
      throw new Error('Original MasterClass event not found');
    }

    // Remove attendee from the list
    const existingAttendees = originalEvent.data.attendees || [];
    const updatedAttendees = existingAttendees.filter(attendee => 
      attendee.email?.toLowerCase() !== email.toLowerCase()
    );

    // Update the event without the attendee
    await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: masterClassId,
      sendUpdates: 'all', // Notify remaining attendees
      requestBody: {
        ...originalEvent.data,
        attendees: updatedAttendees,
      },
    });

    console.log('Successfully removed attendee from MasterClass:', {
      eventId: masterClassId,
      removedEmail: email,
      remainingAttendees: updatedAttendees.length
    });

    return true;

  } catch (error) {
    console.error('Error removing MasterClass invite:', error);
    return false;
  }
}

export async function getMasterClassAttendees(masterClassId: string): Promise<Array<{
  email: string;
  displayName?: string;
  responseStatus?: string;
}>> {
  try {
    const calendar = getCalendarClient();

    const event = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: masterClassId,
    });

    if (!event.data || !event.data.attendees) {
      return [];
    }

    return event.data.attendees.map(attendee => ({
      email: attendee.email || '',
      displayName: attendee.displayName,
      responseStatus: attendee.responseStatus
    }));

  } catch (error) {
    console.error('Error getting MasterClass attendees:', error);
    return [];
  }
}
