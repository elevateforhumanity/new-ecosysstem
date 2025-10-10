# Payroll System

## Overview

The Payroll System manages compensation for staff, instructors, and earn-to-learn participants including OJT trainees, interns, and apprentices. The system ensures compliance with federal and state wage laws, tax regulations, and grant requirements.

---

## Table of Contents

1. [Employee Management](#employee-management)
2. [Time Tracking](#time-tracking)
3. [Payroll Processing](#payroll-processing)
4. [Tax Compliance](#tax-compliance)
5. [Benefits Administration](#benefits-administration)
6. [Earn-to-Learn Payroll](#earn-to-learn-payroll)
7. [Reporting & Analytics](#reporting--analytics)
8. [Compliance & Auditing](#compliance--auditing)

---

## Employee Management

### Employee Portal

#### **Employee Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│  Welcome, John Smith! 👋                                │
│                                                         │
│  Next Payday: Friday, October 15, 2025                  │
│  Estimated Net Pay: $2,145.67                           │
│                                                         │
│  Quick Actions                                          │
│  [View Pay Stub] [Update W-4] [Request Time Off]       │
│                                                         │
│  This Pay Period (10/1 - 10/15)                         │
│  Hours Worked: 80.0 hours                               │
│  Overtime: 0.0 hours                                    │
│  PTO Used: 8.0 hours                                    │
│                                                         │
│  Year-to-Date Summary                                   │
│  Gross Pay: $45,000.00                                  │
│  Net Pay: $34,250.00                                    │
│  Taxes Withheld: $8,500.00                              │
│  Benefits: $2,250.00                                    │
│                                                         │
│  [View Full Details]                                    │
└─────────────────────────────────────────────────────────┘
```

### Employee Information

#### **Personal Information**
- Name and contact details
- Address (for tax purposes)
- Emergency contacts
- Social Security Number (encrypted)
- Date of birth
- Hire date

#### **Employment Details**
- Job title and department
- Employment type (Full-time, Part-time, Contract)
- Pay rate and schedule
- Supervisor
- Work location
- Employment status (Active, On Leave, Terminated)

#### **Tax Information**
- W-4 federal withholding
- State withholding forms
- Local tax withholding
- Tax filing status
- Number of allowances/dependents

#### **Direct Deposit**
```
┌─────────────────────────────────────────────────────────┐
│  Direct Deposit Setup 💳                                │
│                                                         │
│  Primary Account                                        │
│  Bank Name: First National Bank                         │
│  Account Type: Checking                                 │
│  Account Number: ****6789                               │
│  Routing Number: 123456789                              │
│  Deposit Amount: 100%                                   │
│                                                         │
│  ☐ Split Deposit to Multiple Accounts                  │
│                                                         │
│  [Edit] [Add Account] [Verify Account]                 │
│                                                         │
│  ℹ️ Changes take effect next pay period                │
└─────────────────────────────────────────────────────────┘
```

---

## Time Tracking

### Time Entry

#### **Hourly Employees**
```
┌─────────────────────────────────────────────────────────┐
│  Time Entry - Week of 10/8/2025 ⏰                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Day      Clock In   Clock Out   Break   Total   │  │
│  │ Mon 10/8  8:00 AM   5:00 PM    1:00hr  8.0hrs  │  │
│  │ Tue 10/9  8:00 AM   5:00 PM    1:00hr  8.0hrs  │  │
│  │ Wed 10/10 8:00 AM   5:00 PM    1:00hr  8.0hrs  │  │
│  │ Thu 10/11 8:00 AM   5:00 PM    1:00hr  8.0hrs  │  │
│  │ Fri 10/12 8:00 AM   5:00 PM    1:00hr  8.0hrs  │  │
│  │ Sat 10/13 -         -          -       0.0hrs  │  │
│  │ Sun 10/14 -         -          -       0.0hrs  │  │
│  │                                                  │  │
│  │ Total Regular Hours: 40.0                       │  │
│  │ Total Overtime Hours: 0.0                       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Submit for Approval] [Save Draft]                    │
└─────────────────────────────────────────────────────────┘
```

#### **Time Clock Options**
- Web-based time clock
- Mobile app (GPS-enabled)
- Biometric time clock (fingerprint, facial recognition)
- Badge/card swipe
- Manual entry (with supervisor approval)

### Leave Management

#### **Time Off Requests**
```
┌─────────────────────────────────────────────────────────┐
│  Request Time Off 🏖️                                   │
│                                                         │
│  Leave Type:                                            │
│  ○ Vacation (PTO)  ○ Sick Leave  ○ Personal Day        │
│  ○ Unpaid Leave    ○ Other                              │
│                                                         │
│  Dates:                                                 │
│  From: [10/20/2025] To: [10/22/2025]                   │
│  Total Days: 3 days (24 hours)                          │
│                                                         │
│  Available Balances:                                    │
│  PTO: 80 hours                                          │
│  Sick Leave: 40 hours                                   │
│                                                         │
│  Reason (Optional):                                     │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Family vacation                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Submit Request] [Cancel]                              │
└─────────────────────────────────────────────────────────┘
```

#### **Leave Types**
- Paid Time Off (PTO)
- Sick Leave
- Personal Days
- Bereavement Leave
- Jury Duty
- Military Leave
- FMLA (Family and Medical Leave Act)
- Unpaid Leave

### Approval Workflow

#### **Supervisor Approval**
```
┌─────────────────────────────────────────────────────────┐
│  Pending Approvals 📋                                   │
│                                                         │
│  Time Entry Approvals (5)                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Sarah Johnson - Week of 10/8/2025               │  │
│  │ Regular: 40.0 hrs | Overtime: 0.0 hrs           │  │
│  │ [Approve] [Request Changes] [View Details]      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Time Off Requests (2)                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │ John Smith - PTO Request                         │  │
│  │ 10/20 - 10/22 (3 days)                           │  │
│  │ [Approve] [Deny] [View Details]                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Payroll Processing

### Pay Schedules

#### **Standard Pay Schedules**
- **Bi-weekly**: Every two weeks (26 pay periods/year)
- **Semi-monthly**: Twice per month (24 pay periods/year)
- **Monthly**: Once per month (12 pay periods/year)
- **Weekly**: Every week (52 pay periods/year)

#### **Special Pay Runs**
- Bonus payments
- Commission payments
- Expense reimbursements
- Final paychecks (terminations)
- Off-cycle payments

### Payroll Calculation

#### **Gross Pay Calculation**
```
Regular Hours × Hourly Rate = Regular Pay
Overtime Hours × (Hourly Rate × 1.5) = Overtime Pay
Gross Pay = Regular Pay + Overtime Pay + Other Earnings
```

#### **Deductions**
**Pre-Tax Deductions:**
- 401(k) contributions
- Health insurance premiums
- Dental insurance premiums
- Vision insurance premiums
- HSA/FSA contributions
- Commuter benefits

**Taxes:**
- Federal income tax (based on W-4)
- State income tax
- Local income tax (if applicable)
- Social Security (6.2% up to wage base)
- Medicare (1.45%, plus 0.9% additional for high earners)
- State unemployment (SUTA)

**Post-Tax Deductions:**
- Roth 401(k) contributions
- Garnishments (court-ordered)
- Union dues
- Charitable contributions
- Loan repayments

#### **Net Pay Calculation**
```
Net Pay = Gross Pay - Pre-Tax Deductions - Taxes - Post-Tax Deductions
```

### Pay Stub

#### **Electronic Pay Stub**
```
┌─────────────────────────────────────────────────────────┐
│  Pay Stub - Pay Period: 10/1/2025 - 10/15/2025         │
│                                                         │
│  Employee: John Smith                                   │
│  Employee ID: 12345                                     │
│  Pay Date: 10/15/2025                                   │
│                                                         │
│  Earnings                          Current    YTD      │
│  ─────────────────────────────────────────────────────  │
│  Regular (80.0 hrs @ $30.00)      $2,400.00  $48,000   │
│  Overtime (0.0 hrs @ $45.00)          $0.00      $0    │
│  ─────────────────────────────────────────────────────  │
│  Gross Pay                         $2,400.00  $48,000   │
│                                                         │
│  Pre-Tax Deductions                                     │
│  ─────────────────────────────────────────────────────  │
│  401(k) (5%)                        ($120.00) ($2,400) │
│  Health Insurance                    ($75.00) ($1,500) │
│  Dental Insurance                    ($15.00)   ($300) │
│  ─────────────────────────────────────────────────────  │
│  Total Pre-Tax Deductions           ($210.00) ($4,200) │
│                                                         │
│  Taxes                                                  │
│  ─────────────────────────────────────────────────────  │
│  Federal Income Tax                 ($262.00) ($5,240) │
│  Social Security (6.2%)             ($135.78) ($2,716) │
│  Medicare (1.45%)                    ($31.76)   ($635) │
│  State Income Tax (IN 3.23%)         ($70.65) ($1,413) │
│  ─────────────────────────────────────────────────────  │
│  Total Taxes                        ($500.19) ($10,004)│
│                                                         │
│  Net Pay                           $1,689.81  $33,796   │
│                                                         │
│  Direct Deposit                                         │
│  First National Bank - Checking ****6789  $1,689.81    │
│                                                         │
│  [Download PDF] [Print] [Email]                         │
└─────────────────────────────────────────────────────────┘
```

### Payment Methods

#### **Direct Deposit**
- Primary method (99% of employees)
- Split deposits to multiple accounts
- Prenote verification (3-day hold for new accounts)
- Same-day ACH available

#### **Paper Check**
- Available upon request
- Mailed or picked up
- Additional processing fee may apply

#### **Pay Card**
- Prepaid debit card option
- For employees without bank accounts
- No fees for basic transactions

---

## Tax Compliance

### Federal Tax Compliance

#### **Form W-4 Management**
```
┌─────────────────────────────────────────────────────────┐
│  Update Federal Withholding (W-4) 📝                    │
│                                                         │
│  Filing Status:                                         │
│  ○ Single or Married filing separately                  │
│  ● Married filing jointly                               │
│  ○ Head of household                                    │
│                                                         │
│  Multiple Jobs or Spouse Works:                         │
│  ☐ Check if applicable                                  │
│                                                         │
│  Claim Dependents:                                      │
│  Number of qualifying children: [2]                     │
│  Number of other dependents: [0]                        │
│  Total: $4,000                                          │
│                                                         │
│  Other Adjustments:                                     │
│  Other income: $[0]                                     │
│  Deductions: $[0]                                       │
│  Extra withholding: $[0]                                │
│                                                         │
│  Estimated Federal Withholding: $262.00 per paycheck   │
│                                                         │
│  [Submit W-4] [Use IRS Withholding Calculator]         │
└─────────────────────────────────────────────────────────┘
```

#### **Tax Forms**
- **W-2**: Wage and Tax Statement (annual)
- **W-4**: Employee's Withholding Certificate
- **Form 941**: Employer's Quarterly Federal Tax Return
- **Form 940**: Federal Unemployment Tax (FUTA)
- **1099-NEC**: Nonemployee Compensation (contractors)

### State Tax Compliance

#### **State Withholding**
- State W-4 equivalent forms
- State income tax withholding
- State unemployment insurance (SUI/SUTA)
- State disability insurance (where applicable)
- Local/city taxes (where applicable)

### Year-End Processing

#### **W-2 Distribution**
```
┌─────────────────────────────────────────────────────────┐
│  Your 2025 W-2 is Ready! 📄                             │
│                                                         │
│  Your W-2 Wage and Tax Statement is now available.     │
│                                                         │
│  Box 1 - Wages: $48,000.00                              │
│  Box 2 - Federal Tax Withheld: $5,240.00                │
│  Box 3 - Social Security Wages: $48,000.00              │
│  Box 4 - Social Security Tax: $2,976.00                 │
│  Box 5 - Medicare Wages: $48,000.00                     │
│  Box 6 - Medicare Tax: $696.00                          │
│  Box 16 - State Wages: $48,000.00                       │
│  Box 17 - State Tax Withheld: $1,550.40                 │
│                                                         │
│  [View W-2] [Download PDF] [Print]                     │
│                                                         │
│  Need help filing your taxes?                           │
│  Visit our VITA site for FREE tax preparation!         │
│  [Find VITA Location]                                   │
└─────────────────────────────────────────────────────────┘
```

#### **Year-End Deadlines**
- **January 31**: W-2s to employees
- **January 31**: W-2s to Social Security Administration
- **January 31**: 1099-NEC to contractors and IRS
- **February 28**: Paper filing deadline (various forms)
- **March 31**: Electronic filing deadline (various forms)

---

## Benefits Administration

### Health Insurance

#### **Enrollment**
```
┌─────────────────────────────────────────────────────────┐
│  Health Insurance Enrollment 🏥                         │
│                                                         │
│  Plan Options:                                          │
│                                                         │
│  ○ PPO Plan - High Coverage                             │
│     Premium: $150/month (employee only)                 │
│     Deductible: $500 | Out-of-Pocket Max: $2,000       │
│                                                         │
│  ● PPO Plan - Standard Coverage                         │
│     Premium: $75/month (employee only)                  │
│     Deductible: $1,500 | Out-of-Pocket Max: $5,000     │
│                                                         │
│  ○ HDHP with HSA                                        │
│     Premium: $50/month (employee only)                  │
│     Deductible: $3,000 | Out-of-Pocket Max: $6,000     │
│     HSA Contribution: Up to $4,150/year                 │
│                                                         │
│  Coverage Level:                                        │
│  ○ Employee Only  ● Employee + Spouse  ○ Family         │
│                                                         │
│  Dependents:                                            │
│  ☑ Jane Smith (Spouse) - DOB: 01/15/1985               │
│  ☑ Emily Smith (Child) - DOB: 06/20/2015               │
│  ☑ Michael Smith (Child) - DOB: 03/10/2018             │
│                                                         │
│  Total Monthly Premium: $225.00                         │
│  Per Paycheck (bi-weekly): $103.85                      │
│                                                         │
│  [Enroll] [Compare Plans] [Decline Coverage]           │
└─────────────────────────────────────────────────────────┘
```

### Retirement Plans

#### **401(k) Enrollment**
```
┌─────────────────────────────────────────────────────────┐
│  401(k) Retirement Plan 💰                              │
│                                                         │
│  Contribution Amount:                                   │
│  ● Percentage of Pay: [5]%                              │
│  ○ Fixed Dollar Amount: $[____]                         │
│                                                         │
│  Contribution Type:                                     │
│  ☑ Traditional 401(k) (Pre-tax)                         │
│  ☐ Roth 401(k) (After-tax)                              │
│                                                         │
│  Employer Match:                                        │
│  We match 100% up to 3% of your salary!                │
│  Your contribution: 5% ($2,400/year)                    │
│  Employer match: 3% ($1,440/year)                       │
│  Total annual contribution: $3,840                      │
│                                                         │
│  Investment Options:                                    │
│  ● Target Date Fund 2055                                │
│  ○ Custom Portfolio                                     │
│                                                         │
│  [Enroll] [View Investment Options] [Decline]          │
└─────────────────────────────────────────────────────────┘
```

### Other Benefits

#### **Available Benefits**
- Dental insurance
- Vision insurance
- Life insurance (basic and supplemental)
- Short-term disability
- Long-term disability
- Flexible Spending Account (FSA)
- Health Savings Account (HSA)
- Commuter benefits
- Employee Assistance Program (EAP)

---

## Earn-to-Learn Payroll

### On-the-Job Training (OJT) Payroll

#### **OJT Participant Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│  OJT Program - Clinical Informatics 🎓💼               │
│                                                         │
│  Trainee: Sarah Johnson                                 │
│  Employer: ABC Healthcare System                        │
│  Training Period: 6 months (3 months completed)         │
│                                                         │
│  Current Pay Rate: $18.00/hour                          │
│  Post-Training Rate: $22.00/hour                        │
│  Next Rate Increase: Month 4 ($20.00/hour)             │
│                                                         │
│  This Pay Period (10/1 - 10/15)                         │
│  Training Hours: 80.0 hours                             │
│  Gross Pay: $1,440.00                                   │
│  Net Pay: $1,152.00                                     │
│                                                         │
│  Training Progress: 50% Complete ████████░░░░░░░░      │
│                                                         │
│  Milestones:                                            │
│  ✅ Month 1: Orientation & Basic Skills                 │
│  ✅ Month 2: Intermediate Skills                        │
│  ✅ Month 3: Advanced Skills                            │
│  🔄 Month 4: Specialization (In Progress)               │
│  ⏳ Month 5: Independent Work                           │
│  ⏳ Month 6: Final Assessment                           │
│                                                         │
│  [View Pay Stubs] [Track Progress] [Contact Supervisor]│
└─────────────────────────────────────────────────────────┘
```

#### **OJT Wage Progression**
```
Month 1-2: $18.00/hour (Entry Level)
Month 3-4: $20.00/hour (Developing)
Month 5-6: $21.00/hour (Proficient)
Post-Training: $22.00/hour (Full Rate)
```

### Internship Payroll

#### **Paid Internships**
- Hourly wage (minimum wage or higher)
- Part-time schedule (10-20 hours/week)
- Academic credit (optional)
- Performance evaluations
- Potential for full-time hire

#### **Unpaid Internships**
- Must meet DOL criteria for unpaid internships
- Academic credit required
- Educational benefit to intern
- No displacement of regular employees
- Written agreement

### Apprenticeship Payroll

#### **Registered Apprenticeship**
```
┌─────────────────────────────────────────────────────────┐
│  Apprenticeship Program - CNC Machinist 🔧              │
│                                                         │
│  Apprentice: John Doe                                   │
│  Employer: XYZ Manufacturing                            │
│  Program Length: 4 years                                │
│  Current Year: Year 2                                   │
│                                                         │
│  Wage Progression:                                      │
│  Year 1: $15.00/hour (50% of journeyman wage)          │
│  Year 2: $18.00/hour (60% of journeyman wage) ← Current│
│  Year 3: $21.00/hour (70% of journeyman wage)          │
│  Year 4: $24.00/hour (80% of journeyman wage)          │
│  Journeyman: $30.00/hour (100%)                         │
│                                                         │
│  Training Hours:                                        │
│  On-the-Job: 2,000 hours/year (Required)               │
│  Classroom: 144 hours/year (Required)                   │
│                                                         │
│  Current Pay Period:                                    │
│  OJT Hours: 80.0 @ $18.00 = $1,440.00                  │
│  Classroom Hours: 8.0 @ $18.00 = $144.00               │
│  Total Gross Pay: $1,584.00                             │
│                                                         │
│  [View Pay Details] [Track Training Hours]             │
└─────────────────────────────────────────────────────────┘
```

### Work-Study Payroll

#### **Federal Work-Study**
- Funded by federal financial aid
- Part-time employment (10-15 hours/week)
- On-campus or off-campus positions
- Hourly wage (at least minimum wage)
- Earnings don't count against financial aid

---

## Reporting & Analytics

### Payroll Reports

#### **Standard Reports**
- Payroll register (by pay period)
- Payroll summary (by department, location)
- Tax liability report
- Deduction report
- Labor cost analysis
- Overtime report
- PTO accrual and usage

#### **Compliance Reports**
- EEO-1 Report (Equal Employment Opportunity)
- VETS-4212 Report (Veterans employment)
- Affordable Care Act (ACA) reporting
- Workers' compensation reporting
- Garnishment reporting

### Analytics Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Payroll Analytics Dashboard 📊                         │
│                                                         │
│  Current Pay Period                                     │
│  Total Gross Payroll: $125,450.00                       │
│  Total Net Payroll: $95,340.00                          │
│  Total Employees Paid: 45                               │
│                                                         │
│  Year-to-Date                                           │
│  Total Gross Payroll: $2,509,000.00                     │
│  Average Pay per Employee: $55,756                      │
│  Total Overtime: $45,200 (1.8% of gross)                │
│                                                         │
│  Labor Cost by Department                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Instruction          [████████░░] $1,200,000    │  │
│  │ Administration       [████░░░░░░] $600,000      │  │
│  │ Student Services     [███░░░░░░░] $450,000      │  │
│  │ Operations           [██░░░░░░░░] $259,000      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [View Detailed Reports] [Export Data] [Schedule]      │
└─────────────────────────────────────────────────────────┘
```

---

## Compliance & Auditing

### Regulatory Compliance

#### **Federal Laws**
- **Fair Labor Standards Act (FLSA)**: Minimum wage, overtime
- **Equal Pay Act**: Pay equity
- **Family and Medical Leave Act (FMLA)**: Job-protected leave
- **Affordable Care Act (ACA)**: Health insurance reporting
- **IRS Regulations**: Tax withholding and reporting

#### **State Laws**
- State minimum wage laws
- State overtime laws
- State leave laws (sick leave, family leave)
- State tax withholding
- State unemployment insurance

### Audit Trail

#### **Activity Logging**
- All payroll changes logged
- User and timestamp recorded
- Before/after values captured
- Approval workflow tracked
- Report generation logged

#### **Audit Reports**
- Payroll change log
- User activity report
- Exception report (unusual transactions)
- Compliance checklist
- Internal control assessment

### Data Security

#### **Security Measures**
- Encryption at rest and in transit (AES-256, TLS 1.3)
- Role-based access control
- Multi-factor authentication
- Regular security audits
- SOC 2 Type II compliance
- Annual penetration testing

#### **Data Retention**
- Active employee records: Duration of employment + 7 years
- Terminated employee records: 7 years
- Tax records: 7 years
- Payroll registers: 7 years
- Time records: 3 years

---

## Document Control

- **Version**: 1.0
- **Last Updated**: October 10, 2025
- **Next Review**: January 10, 2026
- **Owner**: Payroll & HR Department
- **Classification**: Internal Use - Confidential

---

*Accurate, timely, and compliant payroll processing for all employees and earn-to-learn participants.*
