/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    courseUpdates: true,
    weeklyDigest: false,
    marketingEmails: false,
    language: 'en',
    timezone: 'America/New_York',
    theme: 'light',
    autoplay: true,
    subtitles: false,
    playbackSpeed: '1.0',
    twoFactorAuth: false,
    sessionTimeout: '30',
    publicProfile: true,
    showProgress: true,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Settings
          </h1>
          <p style={{ color: 'var(--brand-text-muted)', fontSize: 16 }}>
            Manage your account preferences and application settings
          </p>
        </div>

        {saved && (
          <div
            style={{
              padding: 16,
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid #c3e6cb',
            }}
          >
            ✅ Settings saved successfully
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Notifications */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid var(--brand-border)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              Notifications
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Email Notifications
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Receive email notifications for important updates
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.emailNotifications
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.emailNotifications ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Course Updates
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Get notified when courses you're enrolled in are updated
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.courseUpdates}
                    onChange={() => handleToggle('courseUpdates')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.courseUpdates
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.courseUpdates ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Weekly Digest
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Receive a weekly summary of your learning progress
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={() => handleToggle('weeklyDigest')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.weeklyDigest
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.weeklyDigest ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Marketing Emails
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Receive promotional content and special offers
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={() => handleToggle('marketingEmails')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.marketingEmails
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.marketingEmails ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid var(--brand-border)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              Preferences
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Language
                </label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Theme
                </label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Video Playback */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid var(--brand-border)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              Video Playback
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Autoplay Next Video
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Automatically play the next video in a course
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={() => handleToggle('autoplay')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.autoplay
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.autoplay ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Subtitles
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Show subtitles by default when available
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.subtitles}
                    onChange={() => handleToggle('subtitles')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.subtitles
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.subtitles ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Default Playback Speed
                </label>
                <select
                  name="playbackSpeed"
                  value={settings.playbackSpeed}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1.0">1.0x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2.0">2.0x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security & Privacy */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid var(--brand-border)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              Security & Privacy
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Two-Factor Authentication
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Add an extra layer of security to your account
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={() => handleToggle('twoFactorAuth')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.twoFactorAuth
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.twoFactorAuth ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Public Profile
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Make your profile visible to other users
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.publicProfile}
                    onChange={() => handleToggle('publicProfile')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.publicProfile
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.publicProfile ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Show Learning Progress
                  </div>
                  <div
                    style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}
                  >
                    Display your course progress on your profile
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 50,
                    height: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.showProgress}
                    onChange={() => handleToggle('showProgress')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.showProgress
                        ? 'var(--brand-info)'
                        : '#ccc',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: 18,
                        width: 18,
                        left: settings.showProgress ? 28 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Session Timeout (minutes)
                </label>
                <select
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              paddingTop: 8,
            }}
          >
            <Link
              to="/account"
              style={{
                padding: '12px 24px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--brand-info)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
