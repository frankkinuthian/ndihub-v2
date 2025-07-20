import { google } from 'googleapis';

// Google Calendar configuration
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Initialize Google Calendar API
function getCalendarAuth() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Calendar credentials not configured');
  }

  return new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/calendar.readonly']
  );
}

export interface MasterClass {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  conferenceType?: string; // 'Google Meet', 'Zoom', 'Teams', etc.
  instructor?: string;
  attendees?: number;
  maxAttendees?: number;
  status: 'upcoming' | 'live' | 'completed';
  registrationLink?: string;
  isOnline?: boolean; // Derived from having a meeting link
  // Premium/Paywall fields
  isPremium?: boolean; // Whether this requires payment
  price?: number; // Price in the specified currency
  currency?: string; // Currency (KES, USD, etc.)
  isFree?: boolean; // Explicitly free (overrides premium)
}

export async function getMasterClasses(): Promise<MasterClass[]> {
  try {
    const auth = getCalendarAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    // Get events from now to 3 months ahead
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: threeMonthsLater.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
      // Filter for events that contain "masterclass" in title or description
      q: 'masterclass',
      // Include conference data for meeting links
      fields: 'items(id,summary,description,start,end,location,organizer,attendees,conferenceData)',
    });

    const events = response.data.items || [];

    return events.map((event): MasterClass => {
      const startTime = event.start?.dateTime || event.start?.date || '';
      const endTime = event.end?.dateTime || event.end?.date || '';
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Determine status
      let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
      if (now >= start && now <= end) {
        status = 'live';
      } else if (now > end) {
        status = 'completed';
      }

      // Extract meeting link from multiple sources (priority order)
      const description = event.description || '';
      let meetingLink: string | undefined;
      let conferenceType: string | undefined;

      // 1. First check Google Calendar's built-in conference data
      if (event.conferenceData?.entryPoints) {
        const videoEntry = event.conferenceData.entryPoints.find(
          entry => entry.entryPointType === 'video'
        );
        if (videoEntry?.uri) {
          meetingLink = videoEntry.uri;
          conferenceType = event.conferenceData.conferenceSolution?.name || 'Google Meet';
        }
      }

      // 2. Fallback to description parsing
      if (!meetingLink) {
        meetingLink = extractMeetingLink(description);
        if (meetingLink) {
          conferenceType = detectConferenceType(meetingLink);
        }
      }

      // 3. Fallback to location if it's a URL
      if (!meetingLink && event.location?.includes('http')) {
        meetingLink = event.location;
        conferenceType = detectConferenceType(event.location);
      }

      // Extract instructor from description or organizer
      const instructor = extractInstructor(description) ||
                        event.organizer?.displayName ||
                        'NDIHub Team';

      // Extract pricing information
      const pricingInfo = extractPricing(description);

      return {
        id: event.id || '',
        title: event.summary || 'Untitled MasterClass',
        description: cleanDescription(description),
        startTime,
        endTime,
        location: event.location,
        meetingLink,
        conferenceType,
        instructor,
        attendees: event.attendees?.length || 0,
        maxAttendees: extractMaxAttendees(description),
        status,
        registrationLink: extractRegistrationLink(description),
        isOnline: !!meetingLink,
        // Pricing fields
        isPremium: pricingInfo.isPremium || false,
        price: pricingInfo.price,
        currency: pricingInfo.currency || 'KES',
        isFree: pricingInfo.isFree || false,
      };
    });
  } catch (error) {
    console.error('Error fetching masterclasses from Google Calendar:', error);
    return [];
  }
}

// Helper functions
function extractMeetingLink(description: string): string | undefined {
  const meetingRegex = /(https?:\/\/[^\s]+(?:zoom|meet|teams|webex)[^\s]*)/i;
  const match = description.match(meetingRegex);
  return match ? match[1] : undefined;
}

function detectConferenceType(url: string): string {
  if (url.includes('zoom.us')) return 'Zoom';
  if (url.includes('meet.google.com')) return 'Google Meet';
  if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'Microsoft Teams';
  if (url.includes('webex.com')) return 'Webex';
  if (url.includes('gotomeeting.com')) return 'GoToMeeting';
  if (url.includes('bluejeans.com')) return 'BlueJeans';
  return 'Online Meeting';
}

function extractInstructor(description: string): string | undefined {
  const instructorRegex = /instructor[:\s]+([^\n\r]+)/i;
  const match = description.match(instructorRegex);
  return match ? match[1].trim() : undefined;
}

function extractMaxAttendees(description: string): number | undefined {
  const attendeesRegex = /max[:\s]*(\d+)|limit[:\s]*(\d+)|capacity[:\s]*(\d+)/i;
  const match = description.match(attendeesRegex);
  return match ? parseInt(match[1] || match[2] || match[3]) : undefined;
}

function extractRegistrationLink(description: string): string | undefined {
  const regRegex = /register[:\s]+(https?:\/\/[^\s]+)/i;
  const match = description.match(regRegex);
  return match ? match[1] : undefined;
}

function extractPricing(description: string): { price?: number; currency?: string; isPremium?: boolean; isFree?: boolean } {
  // Look for pricing patterns in description
  const pricePatterns = [
    /price[:\s]*([A-Z]{3})\s*(\d+(?:\.\d{2})?)/i, // "Price: KES 2000" or "Price: USD 50.00"
    /price[:\s]*\$(\d+(?:\.\d{2})?)/i, // "Price: $50.00"
    /price[:\s]*ksh?\s*(\d+(?:\.\d{2})?)/i, // "Price: Ksh 2000"
    /(\d+(?:\.\d{2})?)\s*([A-Z]{3})/i, // "2000 KES"
    /\$(\d+(?:\.\d{2})?)/i, // "$50"
    /ksh?\s*(\d+(?:\.\d{2})?)/i, // "Ksh 2000"
  ];

  // Check for explicit free indicators
  const freePatterns = [
    /free/i,
    /no\s*charge/i,
    /complimentary/i,
    /price[:\s]*0/i,
    /price[:\s]*free/i
  ];

  // Check for premium indicators
  const premiumPatterns = [
    /premium/i,
    /paid/i,
    /exclusive/i,
    /vip/i
  ];

  // Check if explicitly marked as free
  const isFree = freePatterns.some(pattern => pattern.test(description));
  if (isFree) {
    return { isFree: true, isPremium: false, price: 0 };
  }

  // Try to extract price
  for (const pattern of pricePatterns) {
    const match = description.match(pattern);
    if (match) {
      if (pattern.source.includes('([A-Z]{3})')) {
        // Currency first format: "Price: KES 2000"
        const currency = match[1];
        const price = parseFloat(match[2]);
        return { price, currency, isPremium: price > 0 };
      } else if (pattern.source.includes('\\$')) {
        // Dollar format: "Price: $50" or "$50"
        const price = parseFloat(match[1]);
        return { price, currency: 'USD', isPremium: price > 0 };
      } else if (pattern.source.includes('ksh')) {
        // KES format: "Ksh 2000"
        const price = parseFloat(match[1]);
        return { price, currency: 'KES', isPremium: price > 0 };
      } else {
        // Number with currency: "2000 KES"
        const price = parseFloat(match[1]);
        const currency = match[2];
        return { price, currency, isPremium: price > 0 };
      }
    }
  }

  // Check for premium indicators without explicit price
  const isPremium = premiumPatterns.some(pattern => pattern.test(description));
  if (isPremium) {
    return { isPremium: true };
  }

  // Default to free if no pricing info found
  return { isFree: true, isPremium: false, price: 0 };
}

function cleanDescription(description: string): string {
  if (!description) return '';

  // Remove HTML tags
  let cleaned = description.replace(/<[^>]*>/g, '');

  // Replace HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove metadata patterns (instructor, max, links, etc.)
  cleaned = cleaned
    .replace(/instructor[:\s]*[^\n\r<]+/gi, '')
    .replace(/max[:\s]*\d+/gi, '')
    .replace(/limit[:\s]*\d+/gi, '')
    .replace(/capacity[:\s]*\d+/gi, '')
    .replace(/register[:\s]*https?:\/\/[^\s]+/gi, '')
    .replace(/(https?:\/\/[^\s]+(?:zoom|meet|teams|webex)[^\s]*)/gi, '')
    .replace(/(https?:\/\/[^\s<]+)/gi, ''); // Remove any remaining URLs

  // Clean up extra whitespace and line breaks
  cleaned = cleaned
    .replace(/\n\s*\n/g, '\n') // Multiple line breaks to single
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/\s+/g, ' '); // Multiple spaces to single

  return cleaned.trim();
}

// Get upcoming masterclasses only
export async function getUpcomingMasterClasses(): Promise<MasterClass[]> {
  const allMasterClasses = await getMasterClasses();
  return allMasterClasses.filter(mc => mc.status === 'upcoming' || mc.status === 'live');
}
