# Federal Compliance Framework

This document describes the compliance checks implemented in the EFH ecosystem to ensure adherence to federal workforce development standards.

## Compliance Categories

### 1. Participant Eligibility (`participant`)

#### WIOA Title I Adult Program Eligibility (`wioa_eligibility`)
- **Requirement**: Verify eligibility criteria for WIOA Title I participants
- **Implementation**: 
  - Age verification (18+ years)
  - Employment status validation
  - Income level assessment
  - Documentation requirements check
- **Current Status**: PASS

### 2. Planning & Documentation (`planning`)

#### Individual Employment Plan Compliance (`iep_compliance`)
- **Requirement**: Ensure IEPs are current and aligned with participant goals
- **Implementation**:
  - IEP creation within required timeframes
  - Goal setting and milestone tracking
  - Regular review and update cycles
  - Career pathway alignment
- **Current Status**: PASS

### 3. Reporting & Data Quality (`reporting`)

#### PIRL Data Quality and Timeliness (`pirl_reporting`)
- **Requirement**: Accurate & timely Participant Individual Record Layout submissions
- **Implementation**:
  - Data validation before submission
  - Required field completion checks
  - Quarterly reporting schedules
  - Performance outcome tracking
- **Current Status**: PASS

### 4. Financial Management (`financial`)

#### Federal Cost Principles (2 CFR 200) (`financial_compliance`)
- **Requirement**: Adherence to allowable cost allocation & tracking
- **Implementation**:
  - Direct cost allocation tracking
  - Indirect cost rate calculations
  - Expenditure documentation
  - Audit trail maintenance
- **Current Status**: PASS

### 5. Governance & Equity (`governance`)

#### Equal Opportunity & Non-Discrimination (`equal_opportunity`)
- **Requirement**: EO notices, grievance procedures, accessibility
- **Implementation**:
  - Equal opportunity notices on all materials
  - Formal grievance procedures
  - ADA accommodation processes
  - Anti-discrimination policies
- **Current Status**: PASS

### 6. Security & Privacy (`security`)

#### Data Security & Privacy Standards (`data_security`)
- **Requirement**: Secure handling of PII and access controls
- **Implementation**:
  - Encryption of sensitive data at rest and in transit
  - Role-based access controls
  - Audit logging of data access
  - GDPR/CCPA compliance measures
- **Current Status**: PASS

## API Endpoints

### Compliance Summary
```
GET /api/compliance
```
Returns overall compliance status and summary statistics.

### Detailed Validation Results
```
GET /api/compliance/validate
```
Returns detailed validation results for all compliance checks.

## Monitoring and Alerting

The compliance service provides:
- Real-time status monitoring via health checks
- Automated validation of compliance criteria
- Integration with the main health aggregator at `/api/healthz`
- Structured logging for audit purposes

## Compliance Reporting

Regular compliance reports are generated including:
- Monthly compliance status summaries
- Quarterly audit preparation reports
- Annual compliance review documentation
- Exception tracking and remediation plans

## Contact

For compliance-related questions or issues, contact the EFH compliance team or review the detailed implementation in `services/compliance.cjs`.