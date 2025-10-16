/**
 * Calendar Service (Google Calendar Alternative)
 * Provides scheduling, events, and calendar management
 */

class CalendarService {
  constructor() {
    this.calendars = new Map();
    this.events = new Map();
    this.reminders = new Map();
  }

  /**
   * Create calendar for user
   */
  async createCalendar({ userId, name, description, color = '#4285f4', timezone = 'America/New_York' }) {
    const calendarId = `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const calendar = {
      id: calendarId,
      userId,
      name,
      description,
      color,
      timezone,
      isDefault: false,
      shared: [],
      createdAt: new Date()
    };
    
    this.calendars.set(calendarId, calendar);
    
    return calendar;
  }

  /**
   * Create event
   */
  async createEvent({ calendarId, title, description, location, startTime, endTime, allDay = false, attendees = [], recurrence = null, reminders = [] }) {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event = {
      id: eventId,
      calendarId,
      title,
      description,
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      allDay,
      attendees: attendees.map(email => ({
        email,
        status: 'pending', // pending, accepted, declined, tentative
        responseTime: null
      })),
      recurrence,
      reminders,
      meetingLink: null,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.events.set(eventId, event);
    
    // Send invitations
    if (attendees.length > 0) {
      this.sendInvitations(event);
    }
    
    // Schedule reminders
    reminders.forEach(reminder => {
      this.scheduleReminder(eventId, reminder);
    });
    
    return event;
  }

  /**
   * Get events for date range
   */
  async getEvents(calendarId, startDate, endDate) {
    const events = [];
    
    this.events.forEach(event => {
      if (event.calendarId === calendarId) {
        if (event.startTime >= startDate && event.startTime <= endDate) {
          events.push(event);
        }
      }
    });
    
    return events.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Update event
   */
  async updateEvent(eventId, updates) {
    const event = this.events.get(eventId);
    if (!event) throw new Error('Event not found');
    
    Object.assign(event, updates);
    event.updatedAt = new Date();
    
    // Notify attendees of changes
    if (event.attendees.length > 0) {
      this.notifyAttendees(event, 'updated');
    }
    
    return event;
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId) {
    const event = this.events.get(eventId);
    if (!event) throw new Error('Event not found');
    
    // Notify attendees of cancellation
    if (event.attendees.length > 0) {
      this.notifyAttendees(event, 'cancelled');
    }
    
    this.events.delete(eventId);
    
    return { success: true };
  }

  /**
   * Respond to event invitation
   */
  async respondToInvitation(eventId, attendeeEmail, response) {
    const event = this.events.get(eventId);
    if (!event) throw new Error('Event not found');
    
    const attendee = event.attendees.find(a => a.email === attendeeEmail);
    if (!attendee) throw new Error('Attendee not found');
    
    attendee.status = response; // accepted, declined, tentative
    attendee.responseTime = new Date();
    
    return event;
  }

  /**
   * Share calendar
   */
  async shareCalendar(calendarId, userId, shareWithEmail, permission = 'read') {
    const calendar = this.calendars.get(calendarId);
    if (!calendar) throw new Error('Calendar not found');
    if (calendar.userId !== userId) throw new Error('Only owner can share');
    
    calendar.shared.push({
      email: shareWithEmail,
      permission, // read, write
      sharedAt: new Date()
    });
    
    return calendar;
  }

  /**
   * Find available time slots
   */
  async findAvailableSlots(calendarIds, duration, startDate, endDate, workingHours = { start: 9, end: 17 }) {
    const availableSlots = [];
    const allEvents = [];
    
    // Collect all events from specified calendars
    calendarIds.forEach(calId => {
      this.events.forEach(event => {
        if (event.calendarId === calId) {
          if (event.startTime >= startDate && event.startTime <= endDate) {
            allEvents.push(event);
          }
        }
      });
    });
    
    // Sort events by start time
    allEvents.sort((a, b) => a.startTime - b.startTime);
    
    // Find gaps between events
    let currentTime = new Date(startDate);
    currentTime.setHours(workingHours.start, 0, 0, 0);
    
    allEvents.forEach(event => {
      const gap = event.startTime - currentTime;
      if (gap >= duration * 60 * 1000) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(event.startTime),
          duration: gap / 60000 // minutes
        });
      }
      currentTime = new Date(event.endTime);
    });
    
    return availableSlots;
  }

  /**
   * Send invitations
   */
  sendInvitations(event) {
    event.attendees.forEach(attendee => {
      console.log(`Sending invitation to ${attendee.email} for event: ${event.title}`);
      // In production, send email with calendar invite (.ics file)
    });
  }

  /**
   * Notify attendees
   */
  notifyAttendees(event, action) {
    event.attendees.forEach(attendee => {
      console.log(`Notifying ${attendee.email}: Event ${event.title} was ${action}`);
      // In production, send email notification
    });
  }

  /**
   * Schedule reminder
   */
  scheduleReminder(eventId, reminder) {
    const reminderId = `reminder_${Date.now()}`;
    
    this.reminders.set(reminderId, {
      id: reminderId,
      eventId,
      type: reminder.type, // email, notification, sms
      minutesBefore: reminder.minutesBefore,
      scheduledAt: new Date()
    });
    
    // In production, schedule actual reminder using cron or similar
    console.log(`Reminder scheduled for event ${eventId}: ${reminder.minutesBefore} minutes before`);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(userId, limit = 10) {
    const userCalendars = [];
    this.calendars.forEach(cal => {
      if (cal.userId === userId) {
        userCalendars.push(cal.id);
      }
    });
    
    const upcoming = [];
    const now = new Date();
    
    this.events.forEach(event => {
      if (userCalendars.includes(event.calendarId) && event.startTime > now) {
        upcoming.push(event);
      }
    });
    
    return upcoming
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, limit);
  }
}

module.exports = new CalendarService();
