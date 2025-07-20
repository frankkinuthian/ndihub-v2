import { google } from 'googleapis';

/**
 * Fetch a specific Google Calendar event title by event ID
 * @param eventId - The Google Calendar event ID
 * @returns The event title/summary or a fallback title
 */
export async function getEventTitle(eventId: string): Promise<string> {
  try {
    console.log(`Fetching event title for ID: ${eventId}`);
    
    // Set up Google Calendar API credentials
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    
    // Fetch the specific event
    const eventResponse = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: eventId,
    });

    const eventTitle = eventResponse.data.summary;
    
    if (eventTitle) {
      console.log(`✅ Found event title: "${eventTitle}"`);
      return eventTitle;
    } else {
      console.warn(`⚠️ Event found but no title/summary for ID: ${eventId}`);
      return `MasterClass ${eventId}`;
    }
    
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch event title for ID: ${eventId}`, error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code
    });
    
    // Return fallback title
    return `MasterClass ${eventId}`;
  }
}

/**
 * Fetch full event details from Google Calendar
 * @param eventId - The Google Calendar event ID
 * @returns The full event object or null if not found
 */
export async function getEventDetails(eventId: string) {
  try {
    console.log(`Fetching full event details for ID: ${eventId}`);
    
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    
    const eventResponse = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: eventId,
    });

    console.log(`✅ Found event: "${eventResponse.data.summary}"`);
    return eventResponse.data;
    
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch event details for ID: ${eventId}`, error);
    return null;
  }
}

/**
 * Get MasterClass title with multiple fallback strategies
 * @param eventId - The Google Calendar event ID
 * @param providedTitle - Title provided from payment metadata (optional)
 * @returns The best available title for the MasterClass
 */
export async function getMasterClassTitle(eventId: string, providedTitle?: string): Promise<string> {
  // If we already have a good title from payment metadata, use it
  if (providedTitle && !providedTitle.startsWith('MasterClass ')) {
    console.log(`✅ Using provided title: "${providedTitle}"`);
    return providedTitle;
  }
  
  console.log(`🔍 Fetching MasterClass title for event ID: ${eventId}`);
  
  // Strategy 1: Fetch directly from Google Calendar API
  try {
    const eventTitle = await getEventTitle(eventId);
    if (eventTitle && !eventTitle.startsWith('MasterClass ')) {
      return eventTitle;
    }
  } catch (error) {
    console.warn('Strategy 1 failed (direct API call):', error);
  }
  
  // Strategy 2: Use the getMasterClasses function as fallback
  try {
    console.log('Trying fallback strategy: getMasterClasses...');
    const { getMasterClasses } = await import('./googleCalendar');
    const masterClasses = await getMasterClasses();
    const masterClass = masterClasses.find(mc => mc.id === eventId);
    
    if (masterClass?.title && !masterClass.title.startsWith('MasterClass ')) {
      console.log(`✅ Fallback found title: "${masterClass.title}"`);
      return masterClass.title;
    }
  } catch (error) {
    console.warn('Strategy 2 failed (getMasterClasses):', error);
  }
  
  // Strategy 3: Final fallback
  console.warn(`⚠️ All strategies failed, using fallback title for: ${eventId}`);
  return `MasterClass ${eventId}`;
}
