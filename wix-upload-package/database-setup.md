# DATABASE COLLECTIONS SETUP
# Create these collections in Wix Content Manager

## 1. Programs Collection
Name: Programs
Permissions: Read: Anyone, Write: Admin

Fields:
- title (Text, Required)
- slug (Text, Required, Unique)  
- summary (Text)
- content (Rich Text)
- duration (Text)
- cost (Number)
- featured (Boolean)
- category (Text)

Sample Data:
{
  "title": "Healthcare Assistant Training",
  "slug": "healthcare-assistant",
  "summary": "Professional healthcare support certification",
  "content": "Learn essential healthcare skills...",
  "duration": "12 weeks",
  "cost": 2500,
  "featured": true,
  "category": "Healthcare"
}

## 2. Contacts Collection  
Name: Contacts
Permissions: Read: Admin, Write: Anyone

Fields:
- name (Text, Required)
- email (Text, Required)
- phone (Text)
- message (Text)
- program (Text)
- submittedAt (Date)
- status (Text)

## 3. Analytics Collection
Name: Analytics
Permissions: Read: Admin, Write: Site

Fields:
- event (Text, Required)
- page (Text)
- data (JSON)
- timestamp (Date)