// Minimal compliance service stub providing a stable contract.
// Expand with real data sources (Prisma, external APIs) later.
function buildCertId(prefix) {
	const year = new Date().getFullYear();
	return `${prefix}-${year}-FL-001`;
}

function nowISO(offsetDays = 0) {
	const d = new Date();
	if (offsetDays) d.setDate(d.getDate() + offsetDays);
	return d.toISOString();
}

module.exports = {
	getStatus() {
		return {
			status: 'ok',
			policies: 3,
			auditsEnabled: true,
			lastAudit: nowISO(-7),
			notes: 'Stub compliance service active.'
		};
	},
	getSummary() {
		return {
			title: 'Federal Workforce Compliance Portal',
			status: 'STABLE',
			lastAudit: nowISO(-7),
			nextAudit: nowISO(21),
			complianceAreas: {
				doe: { status: 'CERTIFIED', certificationNumber: buildCertId('DOE-WIOA') },
				dwd: { status: 'ACTIVE_COMPLIANCE', contractNumber: buildCertId('DWD-FL') },
				dol: { status: 'CURRENT_REPORTING', registrationId: buildCertId('DOL-RPT') }
			},
			updated: nowISO()
		};
	},
	getValidations() {
		return {
			generatedAt: nowISO(),
			validations: {
				iep_compliance: { status: 'PASS', reviewed: nowISO(-2) },
				financial_compliance: { status: 'PASS', reviewed: nowISO(-3) },
				wioa_eligibility: { status: 'PASS', participantsSampled: 12 },
				pirl_reporting: { status: 'PASS', lastSubmission: nowISO(-10) }
			}
		};
	}
};
