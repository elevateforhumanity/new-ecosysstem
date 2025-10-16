/**
 * Video Conferencing Service (Jitsi Meet Integration)
 * Provides Google Meet alternative with recording, transcription, and breakout rooms
 */

const crypto = require('crypto');

class VideoConferencingService {
  constructor() {
    this.meetings = new Map();
    this.participants = new Map();
    this.recordings = new Map();
    
    // Jitsi Meet configuration
    this.jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    this.jitsiJWT = process.env.JITSI_JWT_SECRET;
  }

  /**
   * Create a new video meeting
   */
  async createMeeting({ title, hostId, courseId, scheduledAt, duration = 60 }) {
    const meetingCode = this.generateMeetingCode();
    
    const meeting = {
      id: `meeting_${Date.now()}`,
      title,
      hostId,
      courseId,
      meetingCode,
      scheduledAt: scheduledAt || new Date(),
      duration,
      status: 'scheduled',
      participants: [],
      recordingUrl: null,
      transcriptUrl: null,
      createdAt: new Date()
    };
    
    this.meetings.set(meeting.id, meeting);
    
    return {
      ...meeting,
      joinUrl: this.getJoinUrl(meetingCode),
      embedUrl: this.getEmbedUrl(meetingCode),
      hostUrl: this.getHostUrl(meetingCode, hostId)
    };
  }

  /**
   * Generate unique meeting code
   */
  generateMeetingCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Get meeting join URL
   */
  getJoinUrl(meetingCode) {
    return `https://${this.jitsiDomain}/${meetingCode}`;
  }

  /**
   * Get embeddable meeting URL
   */
  getEmbedUrl(meetingCode) {
    return `https://${this.jitsiDomain}/${meetingCode}#config.startWithVideoMuted=true`;
  }

  /**
   * Get host URL with moderator privileges
   */
  getHostUrl(meetingCode, hostId) {
    if (this.jitsiJWT) {
      const token = this.generateJWT(meetingCode, hostId, true);
      return `https://${this.jitsiDomain}/${meetingCode}?jwt=${token}`;
    }
    return this.getJoinUrl(meetingCode);
  }

  /**
   * Generate JWT token for authenticated access
   */
  generateJWT(meetingCode, userId, isModerator = false) {
    if (!this.jitsiJWT) return null;
    
    const payload = {
      context: {
        user: {
          id: userId,
          moderator: isModerator
        }
      },
      room: meetingCode,
      aud: 'jitsi',
      iss: 'elevate-education',
      sub: this.jitsiDomain,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };
    
    // In production, use proper JWT library
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Start a meeting
   */
  async startMeeting(meetingId, hostId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.hostId !== hostId) throw new Error('Only host can start meeting');
    
    meeting.status = 'active';
    meeting.startedAt = new Date();
    
    return meeting;
  }

  /**
   * Join a meeting
   */
  async joinMeeting(meetingId, userId, userName) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    
    const participant = {
      id: `participant_${Date.now()}`,
      meetingId,
      userId,
      userName,
      joinedAt: new Date(),
      leftAt: null,
      isModerator: userId === meeting.hostId
    };
    
    this.participants.set(participant.id, participant);
    meeting.participants.push(participant.id);
    
    return {
      participant,
      meeting,
      joinUrl: this.getJoinUrl(meeting.meetingCode)
    };
  }

  /**
   * Leave a meeting
   */
  async leaveMeeting(participantId) {
    const participant = this.participants.get(participantId);
    if (!participant) throw new Error('Participant not found');
    
    participant.leftAt = new Date();
    participant.duration = Math.floor((participant.leftAt - participant.joinedAt) / 1000);
    
    return participant;
  }

  /**
   * End a meeting
   */
  async endMeeting(meetingId, hostId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.hostId !== hostId) throw new Error('Only host can end meeting');
    
    meeting.status = 'ended';
    meeting.endedAt = new Date();
    meeting.actualDuration = Math.floor((meeting.endedAt - meeting.startedAt) / 1000 / 60);
    
    // End all participant sessions
    meeting.participants.forEach(participantId => {
      const participant = this.participants.get(participantId);
      if (participant && !participant.leftAt) {
        participant.leftAt = meeting.endedAt;
      }
    });
    
    return meeting;
  }

  /**
   * Start recording a meeting
   */
  async startRecording(meetingId, hostId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.hostId !== hostId) throw new Error('Only host can start recording');
    
    const recording = {
      id: `recording_${Date.now()}`,
      meetingId,
      startedAt: new Date(),
      status: 'recording',
      fileUrl: null
    };
    
    this.recordings.set(recording.id, recording);
    meeting.recordingId = recording.id;
    meeting.isRecording = true;
    
    // In production, integrate with Jitsi recording API or Jibri
    console.log(`Recording started for meeting ${meetingId}`);
    
    return recording;
  }

  /**
   * Stop recording a meeting
   */
  async stopRecording(meetingId, hostId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.hostId !== hostId) throw new Error('Only host can stop recording');
    
    const recording = this.recordings.get(meeting.recordingId);
    if (!recording) throw new Error('No active recording');
    
    recording.stoppedAt = new Date();
    recording.status = 'processing';
    recording.duration = Math.floor((recording.stoppedAt - recording.startedAt) / 1000);
    
    meeting.isRecording = false;
    
    // In production, process recording and upload to storage
    setTimeout(() => {
      recording.status = 'completed';
      recording.fileUrl = `https://storage.elevate.edu/recordings/${recording.id}.mp4`;
      meeting.recordingUrl = recording.fileUrl;
    }, 5000);
    
    return recording;
  }

  /**
   * Generate meeting transcript
   */
  async generateTranscript(recordingId) {
    const recording = this.recordings.get(recordingId);
    if (!recording) throw new Error('Recording not found');
    if (recording.status !== 'completed') throw new Error('Recording not ready');
    
    // In production, use Whisper AI or similar for transcription
    const transcript = {
      id: `transcript_${Date.now()}`,
      recordingId,
      text: 'Transcript will be generated using Whisper AI...',
      language: 'en',
      generatedAt: new Date()
    };
    
    recording.transcriptId = transcript.id;
    
    return transcript;
  }

  /**
   * Create breakout rooms
   */
  async createBreakoutRooms(meetingId, hostId, numberOfRooms) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.hostId !== hostId) throw new Error('Only host can create breakout rooms');
    
    const breakoutRooms = [];
    
    for (let i = 1; i <= numberOfRooms; i++) {
      const room = {
        id: `breakout_${Date.now()}_${i}`,
        meetingId,
        roomNumber: i,
        meetingCode: `${meeting.meetingCode}-room${i}`,
        participants: [],
        createdAt: new Date()
      };
      
      breakoutRooms.push(room);
    }
    
    meeting.breakoutRooms = breakoutRooms;
    
    return breakoutRooms;
  }

  /**
   * Assign participant to breakout room
   */
  async assignToBreakoutRoom(meetingId, participantId, roomId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    
    const room = meeting.breakoutRooms?.find(r => r.id === roomId);
    if (!room) throw new Error('Breakout room not found');
    
    room.participants.push(participantId);
    
    return {
      room,
      joinUrl: this.getJoinUrl(room.meetingCode)
    };
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStats(meetingId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    
    const participants = meeting.participants.map(id => this.participants.get(id));
    
    const stats = {
      meetingId,
      title: meeting.title,
      totalParticipants: participants.length,
      averageDuration: this.calculateAverageDuration(participants),
      peakParticipants: this.calculatePeakParticipants(participants),
      totalDuration: meeting.actualDuration || 0,
      hasRecording: !!meeting.recordingUrl,
      hasTranscript: !!meeting.transcriptUrl
    };
    
    return stats;
  }

  calculateAverageDuration(participants) {
    if (!participants.length) return 0;
    
    const totalDuration = participants.reduce((sum, p) => {
      if (p.leftAt && p.joinedAt) {
        return sum + (p.leftAt - p.joinedAt);
      }
      return sum;
    }, 0);
    
    return Math.floor(totalDuration / participants.length / 1000 / 60);
  }

  calculatePeakParticipants(participants) {
    // Simplified - in production, track concurrent participants over time
    return participants.length;
  }

  /**
   * Get upcoming meetings for a user
   */
  async getUpcomingMeetings(userId) {
    const now = new Date();
    const upcoming = [];
    
    this.meetings.forEach(meeting => {
      if (meeting.scheduledAt > now && 
          (meeting.hostId === userId || meeting.participants.includes(userId))) {
        upcoming.push(meeting);
      }
    });
    
    return upcoming.sort((a, b) => a.scheduledAt - b.scheduledAt);
  }

  /**
   * Get meeting history for a user
   */
  async getMeetingHistory(userId, limit = 10) {
    const history = [];
    
    this.meetings.forEach(meeting => {
      if (meeting.status === 'ended' &&
          (meeting.hostId === userId || meeting.participants.includes(userId))) {
        history.push(meeting);
      }
    });
    
    return history
      .sort((a, b) => b.endedAt - a.endedAt)
      .slice(0, limit);
  }
}

module.exports = new VideoConferencingService();
