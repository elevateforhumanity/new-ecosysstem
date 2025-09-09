// Bridge file to maintain compatibility if .js is required instead of .cjs
try {
	module.exports = require('./compliance.cjs');
} catch (e) {
	module.exports = {
		getSummary: () => ({ title: 'Compliance (stub)', status: 'UNKNOWN', lastAudit: null, nextAudit: null, complianceAreas: {} }),
		getValidations: () => ({ overallStatus: 'UNKNOWN', validations: {}, certifications: [] })
	};
}
