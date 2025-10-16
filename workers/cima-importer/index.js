/**
 * Milady CIMA Importer - Cloudflare Worker
 * 
 * Imports CSV exports from Milady CIMA and updates Supabase
 * Generates RAPIDS/DOL-ready reports
 * Includes OJT timesheet management with QR codes
 */

import Papa from 'papaparse';
import * as jose from 'jose';

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return corsResponse();
    }

    try {
      // Route: Import CIMA CSV
      if (req.method === 'POST' && url.pathname === '/cima/import') {
        return await handleImport(req, env, url);
      }

      // Route: RAPIDS export
      if (req.method === 'GET' && url.pathname === '/rapids/export') {
        return await handleRapidsExport(req, env, url);
      }

      // Route: Student progress
      if (req.method === 'GET' && url.pathname === '/student/progress') {
        return await handleStudentProgress(req, env, url);
      }

      // Route: Admin dashboard stats
      if (req.method === 'GET' && url.pathname === '/admin/stats') {
        return await handleAdminStats(req, env);
      }

      // Route: Generate PDF record
      if (req.method === 'GET' && url.pathname === '/student/record') {
        return await handleGenerateRecord(req, env, url);
      }

      // Route: Generate QR code
      if (req.method === 'GET' && url.pathname === '/qr') {
        return await handleGenerateQR(req, env, url);
      }

      // Route: Export OJT timesheets CSV
      if (req.method === 'GET' && url.pathname === '/ojt/export') {
        return await handleOJTExport(req, env, url);
      }

      // Route: Get timesheet for signing (token-gated)
      if (req.method === 'GET' && url.pathname.match(/^\/timesheet\/([^/]+)$/)) {
        const timesheetId = url.pathname.split('/')[2];
        return await handleGetTimesheet(req, env, url, timesheetId);
      }

      // Route: Mentor sign (token-gated)
      if (req.method === 'POST' && url.pathname === '/mentor/sign') {
        return await handleMentorSign(req, env, url);
      }

      // Default route
      return jsonResponse({ 
        ok: true, 
        service: 'cima-importer',
        version: '1.0.0',
        endpoints: [
          'POST /cima/import - Import CIMA CSV',
          'GET /rapids/export - Export RAPIDS report',
          'GET /student/progress?email=... - Get student progress',
          'GET /admin/stats - Get admin dashboard stats',
          'GET /student/record?email=... - Generate PDF record'
        ]
      });

    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ 
        ok: false, 
        error: error.message 
      }, 500);
    }
  },

  // Scheduled handler for nightly auto-import and cleanup
  async scheduled(event, env, ctx) {
    console.log('Running nightly tasks...');
    ctx.waitUntil(Promise.all([
      runNightlyImport(env),
      runNightlyCleanup(env)
    ]));
  }
};

/**
 * Handle CIMA CSV import
 */
async function handleImport(req, env, url) {
  let csv;
  const batchId = crypto.randomUUID();

  // Get CSV from R2 or request body
  if (url.searchParams.get('r2')) {
    const path = url.searchParams.get('r2');
    const obj = await env.R2?.get(path);
    if (!obj) {
      return jsonResponse({ ok: false, error: 'File not found in R2' }, 404);
    }
    csv = await obj.text();
  } else {
    csv = await req.text();
  }

  if (!csv || csv.trim().length === 0) {
    return jsonResponse({ ok: false, error: 'Empty CSV' }, 400);
  }

  // Parse CSV
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  
  if (parsed.errors?.length) {
    return jsonResponse({ 
      ok: false, 
      error: 'CSV parsing errors', 
      details: parsed.errors 
    }, 400);
  }

  const rows = parsed.data.filter(r => r && r.Email && r.Minutes);
  
  if (rows.length === 0) {
    return jsonResponse({ 
      ok: false, 
      error: 'No valid rows found. Expected columns: Email, Minutes, LessonTitle, LessonId, StartTime, EndTime' 
    }, 400);
  }

  // Get Milady CIMA provider ID
  const provider = await querySupabase(env, `
    SELECT id FROM rti_providers 
    WHERE name = 'Milady CIMA' AND active = true 
    LIMIT 1
  `);

  if (!provider || provider.length === 0) {
    return jsonResponse({ 
      ok: false, 
      error: 'Milady CIMA provider not found in database' 
    }, 500);
  }

  const providerId = provider[0].id;
  let imported = 0;
  let failed = 0;
  let totalMinutes = 0;
  const errors = [];

  // Import each row
  for (const row of rows) {
    try {
      const email = row.Email.trim().toLowerCase();
      const minutes = parseInt(row.Minutes || 0);
      
      if (!minutes || minutes <= 0) {
        failed++;
        continue;
      }

      const payload = {
        provider_user_id: email,
        lesson_id: row.LessonId || null,
        lesson_title: row.LessonTitle || null,
        started_at: row.StartTime ? new Date(row.StartTime).toISOString() : null,
        ended_at: row.EndTime ? new Date(row.EndTime).toISOString() : null,
        minutes: minutes
      };

      // Create unique ID for idempotency
      const sessionKey = await digestSHA256(
        `${payload.provider_user_id}|${payload.lesson_id}|${payload.started_at}|${payload.minutes}`
      );

      // Insert session
      await querySupabase(env, `
        INSERT INTO rti_sessions (
          id, provider_id, provider_user_id, lesson_id, lesson_title, 
          started_at, ended_at, minutes, import_batch_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [
        sessionKey, providerId, payload.provider_user_id, 
        payload.lesson_id, payload.lesson_title,
        payload.started_at, payload.ended_at, payload.minutes, batchId
      ]);

      imported++;
      totalMinutes += minutes;

    } catch (error) {
      failed++;
      errors.push({ row: row.Email, error: error.message });
    }
  }

  // Recalculate totals for all affected apprentices
  await querySupabase(env, `
    SELECT recalc_rti_totals(e.apprentice_id)
    FROM rti_enrollments e
    WHERE e.provider_id = $1
      AND e.provider_user_id IN (
        SELECT DISTINCT provider_user_id 
        FROM rti_sessions 
        WHERE import_batch_id = $2
      )
  `, [providerId, batchId]);

  // Log import
  await querySupabase(env, `
    INSERT INTO rti_import_logs (
      batch_id, provider_id, rows_processed, rows_imported, 
      rows_failed, minutes_added, errors
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    batchId, providerId, rows.length, imported, 
    failed, totalMinutes, JSON.stringify(errors)
  ]);

  return jsonResponse({
    ok: true,
    batch_id: batchId,
    processed: rows.length,
    imported,
    failed,
    minutes_added: totalMinutes,
    hours_added: +(totalMinutes / 60).toFixed(2),
    errors: errors.length > 0 ? errors : undefined
  });
}

/**
 * Handle RAPIDS export
 */
async function handleRapidsExport(req, env, url) {
  const since = url.searchParams.get('since') || 
    new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  
  const format = url.searchParams.get('format') || 'json'; // json or csv

  const rows = await querySupabase(env, `
    SELECT 
      a.first_name,
      a.last_name,
      a.email,
      a.sponsor_program_id as raid,
      a.start_date,
      a.expected_end,
      a.status,
      COALESCE(rt.hours_total, 0) as rti_hours,
      COALESCE(ot.hours_total, 0) as ojt_hours,
      COALESCE(rt.sessions_count, 0) as rti_sessions,
      COALESCE(ot.sessions_count, 0) as ojt_sessions,
      CASE 
        WHEN COALESCE(rt.hours_total, 0) >= 288 AND COALESCE(ot.hours_total, 0) >= 1500 
        THEN 'Ready for Completion'
        WHEN COALESCE(rt.hours_total, 0) < 288 
        THEN 'RTI Incomplete'
        WHEN COALESCE(ot.hours_total, 0) < 1500 
        THEN 'OJT Incomplete'
        ELSE 'In Progress'
      END as completion_status
    FROM apprentices a
    LEFT JOIN rti_totals rt ON rt.apprentice_id = a.id
    LEFT JOIN ojt_totals ot ON ot.apprentice_id = a.id
    WHERE a.start_date >= $1
    ORDER BY a.last_name, a.first_name
  `, [since]);

  if (format === 'csv') {
    const csv = Papa.unparse(rows);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rapids-export-${since}.csv"`,
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  return jsonResponse({
    ok: true,
    since,
    count: rows.length,
    generated_at: new Date().toISOString(),
    rows
  });
}

/**
 * Handle student progress lookup
 */
async function handleStudentProgress(req, env, url) {
  const email = url.searchParams.get('email');
  
  if (!email) {
    return jsonResponse({ ok: false, error: 'Email parameter required' }, 400);
  }

  const data = await querySupabase(env, `
    SELECT 
      a.id,
      a.first_name,
      a.last_name,
      a.email,
      a.start_date,
      a.expected_end,
      a.status,
      COALESCE(rt.hours_total, 0) as rti_hours,
      COALESCE(ot.hours_total, 0) as ojt_hours,
      COALESCE(rt.sessions_count, 0) as rti_sessions,
      COALESCE(ot.sessions_count, 0) as ojt_sessions,
      rt.last_calc as rti_last_updated,
      ot.last_calc as ojt_last_updated
    FROM apprentices a
    LEFT JOIN rti_totals rt ON rt.apprentice_id = a.id
    LEFT JOIN ojt_totals ot ON ot.apprentice_id = a.id
    WHERE LOWER(a.email) = LOWER($1)
    LIMIT 1
  `, [email]);

  if (!data || data.length === 0) {
    return jsonResponse({ ok: false, error: 'Student not found' }, 404);
  }

  const student = data[0];
  
  // Calculate progress percentages
  const rtiProgress = Math.min((student.rti_hours / 288) * 100, 100);
  const ojtProgress = Math.min((student.ojt_hours / 1500) * 100, 100);

  return jsonResponse({
    ok: true,
    student: {
      ...student,
      rti_progress_percent: +rtiProgress.toFixed(1),
      ojt_progress_percent: +ojtProgress.toFixed(1),
      rti_remaining: Math.max(288 - student.rti_hours, 0),
      ojt_remaining: Math.max(1500 - student.ojt_hours, 0),
      is_rti_complete: student.rti_hours >= 288,
      is_ojt_complete: student.ojt_hours >= 1500,
      is_ready_for_completion: student.rti_hours >= 288 && student.ojt_hours >= 1500
    }
  });
}

/**
 * Handle admin dashboard stats
 */
async function handleAdminStats(req, env) {
  const stats = await querySupabase(env, `
    SELECT 
      COUNT(*) as total_apprentices,
      COUNT(*) FILTER (WHERE status = 'active') as active_apprentices,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_apprentices,
      COALESCE(SUM(rt.hours_total), 0) as total_rti_hours,
      COALESCE(SUM(ot.hours_total), 0) as total_ojt_hours,
      COUNT(*) FILTER (
        WHERE rt.hours_total >= 288 AND ot.hours_total >= 1500
      ) as ready_for_completion,
      COUNT(*) FILTER (WHERE rt.hours_total < 288) as rti_incomplete
    FROM apprentices a
    LEFT JOIN rti_totals rt ON rt.apprentice_id = a.id
    LEFT JOIN ojt_totals ot ON ot.apprentice_id = a.id
    WHERE a.status IN ('active', 'completed')
  `);

  const recentImports = await querySupabase(env, `
    SELECT 
      batch_id,
      rows_imported,
      minutes_added,
      imported_at
    FROM rti_import_logs
    ORDER BY imported_at DESC
    LIMIT 5
  `);

  return jsonResponse({
    ok: true,
    stats: stats[0],
    recent_imports: recentImports,
    generated_at: new Date().toISOString()
  });
}

/**
 * Query Supabase using RPC
 */
async function querySupabase(env, sql, params = []) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ q: sql, p: params })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error ${response.status}: ${error}`);
  }

  return response.json();
}

/**
 * SHA-256 digest for idempotency keys
 */
async function digestSHA256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

/**
 * Verify Supabase JWT token
 */
async function verifyUser(req, env) {
  const auth = req.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  
  if (!match) return null;
  
  try {
    if (!env.SUPABASE_JWT_SECRET) {
      console.warn('SUPABASE_JWT_SECRET not set, skipping JWT verification');
      return null;
    }

    const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
    const { payload } = await jose.jwtVerify(match[1], secret, { 
      algorithms: ['HS256'] 
    });
    
    return {
      email: payload.email,
      sub: payload.sub,
      role: payload.role
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Send email via MailChannels
 */
async function sendMail(env, to, subject, html) {
  if (!env.MAIL_FROM) {
    console.warn('MAIL_FROM not configured, skipping email');
    return;
  }

  const from = {
    email: env.MAIL_FROM,
    name: env.MAIL_FROM_NAME || 'Elevate Apprenticeship'
  };

  const personalizations = [{
    to: [{ email: to }]
  }];

  if (env.MAIL_BCC) {
    personalizations[0].bcc = [{ email: env.MAIL_BCC }];
  }

  const payload = {
    personalizations,
    from,
    subject,
    content: [{ type: 'text/html', value: html }]
  };

  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Mail error:', response.status, text);
    } else {
      console.log('Email sent successfully to:', to);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

/**
 * Nightly cleanup tasks
 */
async function runNightlyCleanup(env) {
  try {
    console.log('Running nightly cleanup...');

    // Purge expired sign tokens
    const purged = await querySupabase(env, `
      SELECT purge_expired_sign_tokens() as count
    `);
    console.log(`Purged ${purged[0]?.count || 0} expired sign tokens`);

    // Mark stale unsigned entries
    const marked = await querySupabase(env, `
      SELECT mark_stale_unsigned_entries() as count
    `);
    console.log(`Marked ${marked[0]?.count || 0} stale unsigned entries`);

    return { purged: purged[0]?.count || 0, marked: marked[0]?.count || 0 };
  } catch (error) {
    console.error('Nightly cleanup error:', error);
    throw error;
  }
}

/**
 * JSON response helper
 */
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * CORS response helper
 */
function corsResponse() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

/**
 * Generate QR code SVG
 */
async function handleGenerateQR(req, env, url) {
  const data = url.searchParams.get('data');
  
  if (!data) {
    return new Response('Missing data parameter', { status: 400 });
  }

  // Simple SVG QR code generator (basic implementation)
  // In production, use a proper QR library
  const qrSvg = generateSimpleQR(data);
  
  return new Response(qrSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'private, max-age=60',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * Simple QR code SVG generator
 * For production, use a proper QR library like qrcode-svg
 */
function generateSimpleQR(data) {
  // This is a placeholder - in production, use a proper QR library
  // For now, return a simple SVG with the data as text
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="white"/>
  <text x="128" y="128" text-anchor="middle" font-size="12" fill="black">
    QR Code
  </text>
  <text x="128" y="148" text-anchor="middle" font-size="8" fill="gray">
    ${data.substring(0, 30)}...
  </text>
  <text x="128" y="168" text-anchor="middle" font-size="10" fill="blue">
    Scan to sign
  </text>
</svg>
  `.trim();
}

/**
 * Export OJT timesheets as CSV
 */
async function handleOJTExport(req, env, url) {
  // Verify user is admin/staff
  const user = await verifyUser(req, env);
  if (!user) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
  }

  const start = url.searchParams.get('start') || 
    new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
  const end = url.searchParams.get('end') || 
    new Date().toISOString().slice(0, 10);

  try {
    const rows = await querySupabase(env, `
      SELECT 
        ts.id,
        a.first_name,
        a.last_name,
        a.email as apprentice_email,
        m.full_name as mentor_name,
        ts.date,
        ts.hours,
        ts.description,
        ts.status,
        ts.signed_at
      FROM ojt_sessions ts
      JOIN apprentices a ON a.id = ts.apprentice_id
      LEFT JOIN mentors m ON m.id = ts.mentor_id
      WHERE ts.date >= $1 AND ts.date <= $2
      ORDER BY ts.date ASC, a.last_name ASC
    `, [start, end]);

    // Generate CSV
    const header = [
      'timesheet_id',
      'apprentice_first',
      'apprentice_last',
      'apprentice_email',
      'mentor_name',
      'date',
      'hours',
      'description',
      'status',
      'signed_at'
    ].join(',');

    const csvRows = rows.map(r => [
      r.id,
      csvSafe(r.first_name),
      csvSafe(r.last_name),
      csvSafe(r.apprentice_email),
      csvSafe(r.mentor_name),
      r.date,
      r.hours,
      csvSafe(r.description),
      r.status,
      r.signed_at || ''
    ].join(','));

    const csv = [header, ...csvRows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ojt_timesheets_${start}_to_${end}.csv"`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error exporting OJT timesheets:', error);
    return jsonResponse({ ok: false, error: 'Failed to export timesheets' }, 500);
  }
}

/**
 * CSV-safe string formatter
 */
function csvSafe(value) {
  if (value == null) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/**
 * Get timesheet for signing (token-gated)
 */
async function handleGetTimesheet(req, env, url, timesheetId) {
  try {
    const token = url.searchParams.get('token');

    if (!token) {
      return jsonResponse({ ok: false, error: 'Missing token' }, 400);
    }

    // Verify token using database function
    const valid = await querySupabase(env, `
      SELECT verify_sign_token($1, $2) as valid
    `, [timesheetId, token]);

    if (!valid || !valid[0]?.valid) {
      return jsonResponse({ ok: false, error: 'Invalid or expired token' }, 403);
    }

    // Get timesheet details
    const data = await querySupabase(env, `
      SELECT 
        ts.id,
        ts.date,
        ts.hours,
        ts.description,
        ts.skills_practiced,
        ts.status,
        a.first_name || ' ' || a.last_name as apprentice_name,
        a.email as apprentice_email
      FROM ojt_sessions ts
      JOIN apprentices a ON a.id = ts.apprentice_id
      WHERE ts.id = $1
    `, [timesheetId]);

    if (!data || data.length === 0) {
      return jsonResponse({ ok: false, error: 'Timesheet not found' }, 404);
    }

    const timesheet = data[0];

    // Check if already signed
    if (timesheet.status === 'approved') {
      return jsonResponse({ 
        ok: false, 
        error: 'This timesheet has already been signed' 
      }, 400);
    }

    return jsonResponse({
      ok: true,
      timesheet
    });

  } catch (error) {
    console.error('Error getting timesheet:', error);
    return jsonResponse({ ok: false, error: 'Failed to load timesheet' }, 500);
  }
}

/**
 * Mentor sign timesheet (token-gated)
 */
async function handleMentorSign(req, env, url) {
  try {
    const { timesheet_id, token, mentor_email } = await req.json();

    if (!timesheet_id || !token) {
      return jsonResponse({ ok: false, error: 'Missing required fields' }, 400);
    }

    // Verify token using database function
    const valid = await querySupabase(env, `
      SELECT verify_sign_token($1, $2) as valid
    `, [timesheet_id, token]);

    if (!valid || !valid[0]?.valid) {
      return jsonResponse({ ok: false, error: 'Invalid or expired token' }, 403);
    }

    // Check if already signed
    const existing = await querySupabase(env, `
      SELECT status FROM ojt_sessions WHERE id = $1
    `, [timesheet_id]);

    if (existing && existing[0]?.status === 'approved') {
      return jsonResponse({ 
        ok: false, 
        error: 'This timesheet has already been signed' 
      }, 400);
    }

    // Get client info for audit
    const ip = req.headers.get('cf-connecting-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    // Update timesheet
    await querySupabase(env, `
      UPDATE ojt_sessions
      SET 
        status = 'approved',
        signed_at = NOW(),
        mentor_signature = $2
      WHERE id = $1
    `, [timesheet_id, mentor_email || 'Digital Signature']);

    // Record audit log
    await querySupabase(env, `
      INSERT INTO ojt_sign_audit (timesheet_id, mentor_email, ip, user_agent)
      VALUES ($1, $2, $3, $4)
    `, [timesheet_id, mentor_email || null, ip, userAgent]);

    // Delete/burn the token
    await querySupabase(env, `
      DELETE FROM ojt_sign_tokens WHERE timesheet_id = $1
    `, [timesheet_id]);

    // Recalculate OJT totals
    await querySupabase(env, `
      SELECT recalc_ojt_totals(apprentice_id)
      FROM ojt_sessions
      WHERE id = $1
    `, [timesheet_id]);

    // Get apprentice details for email notification
    const apprenticeData = await querySupabase(env, `
      SELECT 
        a.email as apprentice_email,
        a.first_name,
        a.last_name,
        ts.date,
        ts.hours,
        ts.description,
        m.full_name as mentor_name
      FROM ojt_sessions ts
      JOIN apprentices a ON a.id = ts.apprentice_id
      LEFT JOIN mentors m ON m.id = ts.mentor_id
      WHERE ts.id = $1
    `, [timesheet_id]);

    // Send email notification to apprentice
    if (apprenticeData && apprenticeData[0]?.apprentice_email) {
      const appr = apprenticeData[0];
      const subject = 'Timesheet Approved – Mentor Signature Received';
      const html = `
        <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#16a34a">Timesheet Approved ✓</h2>
          <p>Hello ${appr.first_name || 'Apprentice'},</p>
          <p>Your mentor <strong>${appr.mentor_name || 'your supervisor'}</strong> has approved your timesheet entry.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:20px 0">
            <ul style="list-style:none;padding:0;margin:0">
              <li style="padding:8px 0"><strong>Date:</strong> ${appr.date}</li>
              <li style="padding:8px 0"><strong>Hours:</strong> ${appr.hours}</li>
              <li style="padding:8px 0"><strong>Description:</strong> ${appr.description}</li>
            </ul>
          </div>
          <p>Keep up the great work!</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#6b7280;font-size:12px">
            Elevate for Humanity · Apprenticeship Operations<br>
            <a href="${env.FRONTEND_URL || 'https://elevateforhumanity.org'}/student/progress" style="color:#2563eb">View Your Progress</a>
          </p>
        </div>
      `;
      
      await sendMail(env, appr.apprentice_email, subject, html);
    }

    return jsonResponse({
      ok: true,
      message: 'Timesheet signed successfully'
    });

  } catch (error) {
    console.error('Error signing timesheet:', error);
    return jsonResponse({ ok: false, error: 'Failed to sign timesheet' }, 500);
  }
}

/**
 * Nightly auto-import from R2
 */
async function runNightlyImport(env) {
  if (!env.R2) {
    console.log('R2 not configured, skipping nightly import');
    return;
  }

  const prefix = env.R2_PREFIX || 'cima-exports/';
  const importedPrefix = env.IMPORTED_PREFIX || 'cima-imported/';
  let processed = 0;
  let failed = 0;

  try {
    // List all CSV files in the prefix
    const list = await env.R2.list({ prefix });
    
    for (const obj of list.objects || []) {
      if (!obj.key.endsWith('.csv')) continue;

      try {
        console.log(`Processing ${obj.key}...`);
        
        // Get CSV content
        const file = await env.R2.get(obj.key);
        if (!file) continue;
        
        const csv = await file.text();

        // Import CSV (reuse existing logic)
        const batchId = crypto.randomUUID();
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        
        if (parsed.errors?.length) {
          console.error(`Parse errors in ${obj.key}:`, parsed.errors);
          failed++;
          continue;
        }

        const rows = parsed.data.filter(r => r && r.Email && r.Minutes);
        
        if (rows.length === 0) {
          console.log(`No valid rows in ${obj.key}`);
          continue;
        }

        // Get provider
        const provider = await querySupabase(env, `
          SELECT id FROM rti_providers 
          WHERE name = 'Milady CIMA' AND active = true 
          LIMIT 1
        `);

        if (!provider || provider.length === 0) {
          console.error('Milady CIMA provider not found');
          failed++;
          continue;
        }

        const providerId = provider[0].id;
        let imported = 0;
        let totalMinutes = 0;

        // Import rows
        for (const row of rows) {
          try {
            const email = row.Email.trim().toLowerCase();
            const minutes = parseInt(row.Minutes || 0);
            
            if (!minutes || minutes <= 0) continue;

            const sessionKey = await digestSHA256(
              `${email}|${row.LessonId}|${row.StartTime}|${minutes}`
            );

            await querySupabase(env, `
              INSERT INTO rti_sessions (
                id, provider_id, provider_user_id, lesson_id, lesson_title, 
                started_at, ended_at, minutes, import_batch_id
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (id) DO NOTHING
            `, [
              sessionKey, providerId, email,
              row.LessonId || null, row.LessonTitle || null,
              row.StartTime ? new Date(row.StartTime).toISOString() : null,
              row.EndTime ? new Date(row.EndTime).toISOString() : null,
              minutes, batchId
            ]);

            imported++;
            totalMinutes += minutes;
          } catch (error) {
            console.error(`Error importing row:`, error);
          }
        }

        // Recalculate totals
        await querySupabase(env, `
          SELECT recalc_rti_totals(e.apprentice_id)
          FROM rti_enrollments e
          WHERE e.provider_id = $1
            AND e.provider_user_id IN (
              SELECT DISTINCT provider_user_id 
              FROM rti_sessions 
              WHERE import_batch_id = $2
            )
        `, [providerId, batchId]);

        // Log import
        await querySupabase(env, `
          INSERT INTO rti_import_logs (
            batch_id, provider_id, rows_processed, rows_imported, 
            rows_failed, minutes_added
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [batchId, providerId, rows.length, imported, rows.length - imported, totalMinutes]);

        // Move file to imported folder
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newKey = `${importedPrefix}${obj.key.split('/').pop().replace('.csv', `_${timestamp}.csv`)}`;
        
        await env.R2.put(newKey, await file.arrayBuffer());
        await env.R2.delete(obj.key);

        processed++;
        console.log(`✅ Processed ${obj.key}: ${imported} rows, ${totalMinutes} minutes`);

      } catch (error) {
        console.error(`Failed to process ${obj.key}:`, error);
        failed++;
      }
    }

    console.log(`Nightly import complete: ${processed} files processed, ${failed} failed`);
    return { processed, failed };

  } catch (error) {
    console.error('Nightly import error:', error);
    throw error;
  }
}

/**
 * Generate PDF apprenticeship record
 */
async function handleGenerateRecord(req, env, url) {
  const email = url.searchParams.get('email');
  
  if (!email) {
    return jsonResponse({ ok: false, error: 'Email parameter required' }, 400);
  }

  try {
    // Get student data
    const data = await querySupabase(env, `
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.sponsor_program_id,
        a.start_date,
        a.expected_end,
        a.status,
        COALESCE(rt.hours_total, 0) as rti_hours,
        COALESCE(ot.hours_total, 0) as ojt_hours,
        COALESCE(rt.sessions_count, 0) as rti_sessions,
        COALESCE(ot.sessions_count, 0) as ojt_sessions
      FROM apprentices a
      LEFT JOIN rti_totals rt ON rt.apprentice_id = a.id
      LEFT JOIN ojt_totals ot ON ot.apprentice_id = a.id
      WHERE LOWER(a.email) = LOWER($1)
      LIMIT 1
    `, [email]);

    if (!data || data.length === 0) {
      return jsonResponse({ ok: false, error: 'Student not found' }, 404);
    }

    const student = data[0];

    // Generate simple HTML report (in production, use a PDF library)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Apprenticeship Record - ${student.first_name} ${student.last_name}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
    .section { margin: 30px 0; }
    .label { font-weight: bold; color: #4b5563; }
    .value { color: #111827; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    .progress { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; }
    .progress-bar { background: linear-gradient(to right, #3b82f6, #10b981); height: 100%; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>Apprenticeship Record</h1>
  
  <div class="section">
    <h2>Student Information</h2>
    <p><span class="label">Name:</span> <span class="value">${student.first_name} ${student.last_name}</span></p>
    <p><span class="label">Email:</span> <span class="value">${student.email}</span></p>
    <p><span class="label">Program ID:</span> <span class="value">${student.sponsor_program_id || 'N/A'}</span></p>
    <p><span class="label">Start Date:</span> <span class="value">${student.start_date || 'N/A'}</span></p>
    <p><span class="label">Expected End:</span> <span class="value">${student.expected_end || 'N/A'}</span></p>
    <p><span class="label">Status:</span> <span class="value" style="text-transform: capitalize;">${student.status}</span></p>
  </div>

  <div class="section">
    <h2>Training Hours Summary</h2>
    <table>
      <tr>
        <th>Type</th>
        <th>Hours Completed</th>
        <th>Required</th>
        <th>Progress</th>
      </tr>
      <tr>
        <td>Related Technical Instruction (RTI)</td>
        <td>${student.rti_hours.toFixed(2)}</td>
        <td>288</td>
        <td>
          <div class="progress">
            <div class="progress-bar" style="width: ${Math.min((student.rti_hours / 288) * 100, 100)}%"></div>
          </div>
          ${Math.min((student.rti_hours / 288) * 100, 100).toFixed(1)}%
        </td>
      </tr>
      <tr>
        <td>On-the-Job Training (OJT)</td>
        <td>${student.ojt_hours.toFixed(2)}</td>
        <td>1500</td>
        <td>
          <div class="progress">
            <div class="progress-bar" style="width: ${Math.min((student.ojt_hours / 1500) * 100, 100)}%"></div>
          </div>
          ${Math.min((student.ojt_hours / 1500) * 100, 100).toFixed(1)}%
        </td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Completion Status</h2>
    <p><span class="label">RTI Sessions:</span> <span class="value">${student.rti_sessions}</span></p>
    <p><span class="label">OJT Sessions:</span> <span class="value">${student.ojt_sessions}</span></p>
    <p><span class="label">Ready for Completion:</span> 
      <span class="value">${student.rti_hours >= 288 && student.ojt_hours >= 1500 ? '✅ Yes' : '❌ No'}</span>
    </p>
  </div>

  <div class="footer">
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Elevate for Humanity - Apprenticeship Management System</p>
  </div>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="apprenticeship-record-${student.first_name}-${student.last_name}.html"`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error generating record:', error);
    return jsonResponse({ ok: false, error: 'Failed to generate record' }, 500);
  }
}
