/**
 * Compliance Service
 * Handles regulatory compliance, WIOA tracking, and reporting
 */

class ComplianceService {
  constructor() {
    this.reports = new Map();
    this.audits = [];
  }

  async trackWIOACompliance(programId, data) {
    const record = {
      id: `wioa_${Date.now()}`,
      programId,
      ...data,
      timestamp: new Date(),
      status: 'compliant'
    };

    this.reports.set(record.id, record);
    return record;
  }

  async generateComplianceReport(programId, startDate, endDate) {
    const records = Array.from(this.reports.values()).filter(r => 
      r.programId === programId &&
      r.timestamp >= startDate &&
      r.timestamp <= endDate
    );

    return {
      programId,
      period: { startDate, endDate },
      totalRecords: records.length,
      compliantRecords: records.filter(r => r.status === 'compliant').length,
      nonCompliantRecords: records.filter(r => r.status === 'non-compliant').length,
      complianceRate: this.calculateComplianceRate(records),
      generatedAt: new Date()
    };
  }

  calculateComplianceRate(records) {
    if (records.length === 0) return 100;
    const compliant = records.filter(r => r.status === 'compliant').length;
    return (compliant / records.length) * 100;
  }

  async performAudit(programId) {
    const audit = {
      id: `audit_${Date.now()}`,
      programId,
      performedAt: new Date(),
      findings: [],
      status: 'completed'
    };

    const programRecords = Array.from(this.reports.values())
      .filter(r => r.programId === programId);

    if (programRecords.length === 0) {
      audit.findings.push('No compliance records found');
      audit.status = 'warning';
    }

    this.audits.push(audit);
    return audit;
  }

  async getAuditHistory(programId) {
    return this.audits.filter(a => a.programId === programId);
  }
}

module.exports = new ComplianceService();
