# Elevate for Humanity - Full Application

Complete workforce development platform with email management, Google Classroom integration, and comprehensive admin tools.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## ✨ Key Features

### Email Management (NEW)
- ✅ Email Events Dashboard - Monitor all email activity
- ✅ Resend Failed Emails - Admin-only with safety checks
- ✅ Do Not Contact List - GDPR-compliant blocking
- ✅ Auto-DNC - Automatic blocking on bounces/spam
- ✅ Audit Trail - Complete logging

### Security & Compliance
- ✅ Role-Based Access Control (RBAC)
- ✅ Row-Level Security (RLS)
- ✅ 12-hour cooldown between resends
- ✅ Maximum 3 resend attempts
- ✅ GDPR Compliant

## 📁 Structure

```
fix2/
├── src/                          # React application
├── google-classroom-autopilot/   # Backend services
│   ├── sql/                      # Database migrations
│   │   └── 06_do_not_contact_and_rbac.sql  # NEW
│   └── src/
│       └── email-resend.ts       # Email API
├── docs/                         # Documentation
│   ├── EMAIL_RESEND_RBAC_DNC.md
│   └── SETUP_EMAIL_RESEND.md
└── public/                       # Static assets
```

## 🔧 Setup

### 1. Database
```bash
psql -d your_db -f google-classroom-autopilot/sql/06_do_not_contact_and_rbac.sql
```

### 2. Set Admin Role
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}', '"admin"'
)
WHERE email = 'admin@example.com';
```

### 3. Build
```bash
npm install
npm run build
npm run dev
```

## 🔐 Admin Access

- **Email Events**: `/admin/email-events`
- **Do Not Contact**: `/admin/do-not-contact`

## 📚 Documentation

- [Email Resend Features](docs/EMAIL_RESEND_RBAC_DNC.md)
- [Setup Guide](docs/SETUP_EMAIL_RESEND.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

## 🧪 Testing

```bash
psql -d your_db -f google-classroom-autopilot/sql/test_rbac_dnc.sql
```

---

**Status**: ✅ Production Ready | **Version**: 2.0.0
