// Cliente Google Calendar
import { google } from 'googleapis';

/**
 * Cria cliente Google Calendar
 */
export function createGoogleCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Lista eventos do Google Calendar
 */
export async function listGoogleCalendarEvents(
  accessToken: string,
  options?: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
  }
) {
  try {
    const calendar = createGoogleCalendarClient(accessToken);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: options?.timeMin?.toISOString() || new Date().toISOString(),
      timeMax: options?.timeMax?.toISOString(),
      maxResults: options?.maxResults || 100,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return {
      success: true,
      events: response.data.items || []
    };
  } catch (error) {
    console.error('Erro ao listar eventos do Google Calendar:', error);
    return {
      success: false,
      error,
      events: []
    };
  }
}

/**
 * Cria evento no Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
  }
) {
  try {
    const calendar = createGoogleCalendarClient(accessToken);
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });
    
    return {
      success: true,
      event: response.data
    };
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Atualiza evento no Google Calendar
 */
export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  event: {
    summary?: string;
    description?: string;
    start?: { dateTime: string; timeZone: string };
    end?: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
  }
) {
  try {
    const calendar = createGoogleCalendarClient(accessToken);
    
    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: event
    });
    
    return {
      success: true,
      event: response.data
    };
  } catch (error) {
    console.error('Erro ao atualizar evento no Google Calendar:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Deleta evento do Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
) {
  try {
    const calendar = createGoogleCalendarClient(accessToken);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar evento do Google Calendar:', error);
    return {
      success: false,
      error
    };
  }
}

