import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MeetingRoom from '../components/video/MeetingRoom';

/**
 * VideoMeeting Page - Join or host video meetings
 */
export function VideoMeeting() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load meeting details
    const loadMeeting = async () => {
      try {
        // In production, fetch from API
        const response = await fetch(`/api/meetings/${meetingCode}`);
        const data = await response.json();
        setMeeting(data);
      } catch (error) {
        console.error('Failed to load meeting:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (meetingCode) {
      loadMeeting();
    } else {
      setIsLoading(false);
    }

    // Get user name from session/localStorage
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, [meetingCode]);

  const handleJoinMeeting = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    localStorage.setItem('userName', userName);
    setHasJoined(true);

    // In production, call API to register participant
    fetch(`/api/meetings/${meetingCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName }),
    }).catch(console.error);
  };

  const handleLeaveMeeting = () => {
    // In production, call API to unregister participant
    fetch(`/api/meetings/${meetingCode}/leave`, {
      method: 'POST',
    }).catch(console.error);

    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f3f4f6',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid var(--brand-border)',
              borderTopColor: 'var(--brand-info)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ color: 'var(--brand-text-muted)' }}>Loading meeting...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!meetingCode) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '4rem auto',
          padding: '2rem',
          backgroundColor: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ marginBottom: '1rem' }}>Join a Meeting</h1>
        <p style={{ color: 'var(--brand-text-muted)', marginBottom: '2rem' }}>
          Enter a meeting code to join
        </p>

        <input
          type="text"
          placeholder="Meeting code"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--brand-border-dark)',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value) {
              navigate(`/meet/${e.target.value}`);
            }
          }}
        />

        <button
          onClick={() => {
            const code = document.querySelector('input').value;
            if (code) navigate(`/meet/${code}`);
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--brand-info)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Join Meeting
        </button>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '4rem auto',
          padding: '2rem',
          backgroundColor: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ marginBottom: '0.5rem' }}>
          {meeting?.title || 'Join Meeting'}
        </h1>
        <p style={{ color: 'var(--brand-text-muted)', marginBottom: '2rem' }}>
          Meeting code: <strong>{meetingCode}</strong>
        </p>

        {meeting && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem',
              marginBottom: '2rem',
            }}
          >
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>Host:</strong> {meeting.hostName || 'Unknown'}
            </p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>Scheduled:</strong>{' '}
              {new Date(meeting.scheduledAt).toLocaleString()}
            </p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>Duration:</strong> {meeting.duration} minutes
            </p>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--brand-text)',
            }}
          >
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--brand-border-dark)',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleJoinMeeting();
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" defaultChecked />
            <span style={{ fontSize: '0.875rem' }}>Camera on</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" defaultChecked />
            <span style={{ fontSize: '0.875rem' }}>Microphone on</span>
          </label>
        </div>

        <button
          onClick={handleJoinMeeting}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--brand-info)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Join Meeting
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            color: 'var(--brand-text-muted)',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <MeetingRoom
      meetingCode={meetingCode}
      userName={userName}
      isModerator={meeting?.hostId === 'current-user-id'} // In production, check actual user
      onLeave={handleLeaveMeeting}
    />
  );
}

export default VideoMeeting;
