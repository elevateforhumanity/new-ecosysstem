# 🤖 EFH AI Agent - Command Reference

Quick reference for all available agent commands.

---

## 📋 Program Management

### Create Program
**Action:** `createProgram`  
**Description:** Create a new ETPL-ready training program  
**Required Roles:** admin, staff

**Parameters:**
- `title` (string, required) - Program title
- `tuition` (number, required) - Tuition amount in dollars
- `hours` (integer, required) - Duration in hours
- `cip_code` (string, required) - CIP classification code
- `delivery` (string, optional) - online | hybrid | in-person (default: online)
- `description` (string, optional) - Program description
- `credentials` (string, optional) - Credential awarded

**Examples:**
```
"Create a Tax Preparation & Business Ops program for $2,500, 80 hours, CIP 52.0304"
"Add a Medical Billing course with 160 hours and $3,200 tuition"
"Create Healthcare Administration program, online delivery, 120 hours"
```

---

### Update Tuition
**Action:** `updateTuition`  
**Description:** Update tuition for an existing program  
**Required Roles:** admin, staff

**Parameters:**
- `id` (UUID, required) - Program ID
- `amount` (number, required) - New tuition amount

**Examples:**
```
"Update tuition for program abc-123 to $3000"
"Change program xyz tuition to $2500"
"Set tuition to $1800 for program def-456"
```

---

## 👥 Student Enrollment

### Add Student
**Action:** `addStudent`  
**Description:** Enroll a student in a program  
**Required Roles:** admin, staff

**Parameters:**
- `student_id` (UUID, required) - Student user ID
- `program_id` (UUID, required) - Program/course ID

**Examples:**
```
"Enroll student abc-123 in program xyz-789"
"Add student def-456 to Tax Prep course"
```

---

### Update Enrollment
**Action:** `updateEnrollment`  
**Description:** Modify student enrollment status  
**Required Roles:** admin, staff

**Parameters:**
- `enrollment_id` (UUID, required) - Enrollment ID
- `status` (string, required) - active | completed | dropped
- `progress` (number, optional) - Progress percentage (0-100)

**Examples:**
```
"Mark enrollment abc-123 as completed"
"Update enrollment xyz to 75% progress"
"Set enrollment status to dropped for def-456"
```

---

## 🤝 Affiliate Management

### Create Affiliate
**Action:** `createAffiliate`  
**Description:** Register a new affiliate partner (W-9 required)  
**Required Roles:** admin

**Parameters:**
- `user_id` (UUID, required) - User ID to make affiliate
- `tier` (string, required) - standard | gold | platinum
- `w9_file_id` (UUID, optional) - W-9 form file ID

**Commission Rates by Tier:**
- Standard: 10%
- Gold: 12%
- Platinum: 15%

**Examples:**
```
"Create gold tier affiliate for user xyz-789"
"Add platinum affiliate for user abc-123 with W9 file def-456"
"Register user ghi-789 as standard affiliate"
```

---

### Create Referral
**Action:** `createReferral`  
**Description:** Create a referral record tied to an affiliate  
**Required Roles:** admin, staff, affiliate

**Parameters:**
- `affiliate_id` (UUID, required) - Affiliate ID
- `client_name` (string, required) - Client name
- `source` (string, required) - link | qr | manual | import

**Examples:**
```
"Log referral: affiliate abc-123, client Jane Smith, source link"
"Create referral for affiliate xyz-789, client John Doe, QR code"
"Add manual referral for affiliate def-456, client ABC Company"
```

---

### Calculate Commission
**Action:** `calculateCommission`  
**Description:** Calculate commission for a referral after return/payment  
**Required Roles:** admin, staff

**Parameters:**
- `referral_id` (UUID, required) - Referral ID
- `basis_amount` (number, required) - Base amount for commission
- `percent` (number, required) - Commission percentage (0-100)

**Examples:**
```
"Calculate commission for referral abc-123 with basis $600, 30%"
"Process commission: referral xyz-789, $1200 basis, 15%"
"Approve commission for referral def-456, $800 at 20%"
```

---

### Run Payout Batch
**Action:** `runPayoutBatch`  
**Description:** Create a payout batch for approved commissions  
**Required Roles:** admin

**Parameters:**
- `cutoff_date` (date, required) - Include commissions before this date (YYYY-MM-DD)

**Examples:**
```
"Run payout batch for commissions before 2025-10-15"
"Process payouts for all approved commissions through October 15"
"Create payout batch with cutoff date 2025-10-31"
```

---

## 📊 Reports & Analytics

### Get ETPL Report
**Action:** `getETPLReport`  
**Description:** Generate ETPL outcomes report (completions/placements/tuition)  
**Required Roles:** admin, staff

**Parameters:** None

**Examples:**
```
"Generate ETPL report"
"Show me the ETPL compliance report"
"Create ETPL outcomes report"
```

---

### Get Stats
**Action:** `getStats`  
**Description:** Retrieve dashboard statistics  
**Required Roles:** admin, staff

**Parameters:** None

**Examples:**
```
"Show me the stats"
"Get dashboard statistics"
"What are the current numbers?"
```

---

## 🔐 Role Permissions

| Action | Admin | Staff | Affiliate |
|--------|-------|-------|-----------|
| createProgram | ✅ | ✅ | ❌ |
| updateTuition | ✅ | ✅ | ❌ |
| addStudent | ✅ | ✅ | ❌ |
| updateEnrollment | ✅ | ✅ | ❌ |
| createAffiliate | ✅ | ❌ | ❌ |
| createReferral | ✅ | ✅ | ✅ |
| calculateCommission | ✅ | ✅ | ❌ |
| runPayoutBatch | ✅ | ❌ | ❌ |
| getETPLReport | ✅ | ✅ | ❌ |
| getStats | ✅ | ✅ | ❌ |

---

## 💡 Tips

### Natural Language Mode
- Be specific with amounts and IDs
- Include all required information in one sentence
- Use clear, direct language

**Good:**
```
"Create a Tax Prep program for $2500, 80 hours, CIP 52.0304"
```

**Bad:**
```
"Make a program" (missing details)
```

### Structured Mode
- Select command from dropdown
- Fill in all required fields (marked with *)
- Use UUIDs for IDs (copy from database)
- Validate data before executing

---

## 🔍 Finding IDs

### Program IDs
```sql
SELECT id, title FROM courses WHERE published = true;
```

### User/Student IDs
```sql
SELECT id, email, full_name FROM profiles WHERE role = 'student';
```

### Affiliate IDs
```sql
SELECT id, user_id, tier FROM affiliates WHERE status = 'active';
```

### Enrollment IDs
```sql
SELECT id, user_id, course_id, status FROM enrollments;
```

---

## 📝 Audit Trail

All agent actions are logged to the `agent_events` table:

```sql
-- View recent actions
SELECT * FROM agent_events
ORDER BY created_at DESC
LIMIT 50;

-- View failed actions
SELECT * FROM agent_events
WHERE success = false
ORDER BY created_at DESC;

-- Actions by type
SELECT action, COUNT(*) as count
FROM agent_events
GROUP BY action
ORDER BY count DESC;
```

---

## ⚠️ Important Notes

1. **Critical Operations**: Use structured mode for payouts and tuition changes
2. **Audit Compliance**: All actions are logged with timestamp and user
3. **Role Enforcement**: Commands are blocked if user lacks required role
4. **Data Validation**: Invalid parameters will be rejected
5. **Idempotency**: Some actions (like createProgram) can be run multiple times safely

---

## 🆘 Troubleshooting

### "Forbidden: Your role cannot execute..."
- Check your user role in profiles table
- Contact admin to update your role if needed

### "Unknown action"
- Verify command name matches catalog exactly
- Check for typos in natural language prompt

### "Missing required parameter"
- Ensure all required fields are provided
- Use structured mode to see required fields

### "Invalid UUID format"
- Copy IDs directly from database
- UUIDs must be in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

---

## 📚 Related Documentation

- [AI Agent Deployment Guide](./AI_AGENT_DEPLOYMENT.md)
- [Command Catalog](./workers/agent/commands.json)
- [Agent Worker Source](./workers/agent/agent-worker.js)
- [Edge Function Source](./supabase/functions/executeAction/index.ts)
