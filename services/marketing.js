// CommonJS marketing service (fallback) used in tests
function getBanners() {
	return [
		{ id: 'b1', title: 'Workforce Acceleration', active: true },
		{ id: 'b2', title: 'Funding Eligible Programs', active: true }
	];
}
function getPricingPlans() {
	return [
		{ code: 'starter', name: 'Starter', price: 0 },
		{ code: 'pro', name: 'Pro', price: 1499 },
		{ code: 'enterprise', name: 'Enterprise', price: 75000 }
	];
}
function getPage(key) {
	if (key === 'about') return { key, title: 'About EFH', body: 'Mission-driven workforce development.' };
	return null;
}
module.exports = { getBanners, getPricingPlans, getPage };
