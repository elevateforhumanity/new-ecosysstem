// Payments service stub (CommonJS)
function createPaymentIntent({ amount = 1000, programId, userId, requestId }) {
	return Promise.resolve({
		id: 'pi_simulated_' + Date.now(),
		amount,
		currency: 'usd',
		programId: programId || null,
		userId: userId || null,
		simulated: true,
		requestId
	});
}
function listStripeConfiguredPrices() {
	// Return env price IDs matching pattern PRICE_* if set
	return Object.keys(process.env)
		.filter(k => /^PRICE_[A-Z0-9_]+$/.test(k))
		.map(k => ({ env: k, value: process.env[k] }));
}
module.exports = { createPaymentIntent, listStripeConfiguredPrices };
