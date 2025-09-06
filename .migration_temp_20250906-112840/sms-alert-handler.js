const fs = require('fs');
const path = require('path');

// SMS Alert System for EFH Marketplace
class SMSAlertHandler {
  constructor() {
    this.phoneNumber = '3177607908';
    this.twilio = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Try to load Twilio if available
      this.twilio = require('twilio');
      this.client = this.twilio(
        process.env.TWILIO_ACCOUNT_SID || 'demo_sid',
        process.env.TWILIO_AUTH_TOKEN || 'demo_token'
      );
      this.initialized = true;
      console.log('📱 SMS Alert System initialized');
    } catch (error) {
      console.log('📱 SMS Mock Mode (Twilio not configured)');
      this.mockMode = true;
    }
  }

  async sendAlert(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const fullMessage = `🚀 EFH Alert [${type.toUpperCase()}]: ${message} - ${timestamp}`;

    try {
      if (this.mockMode || !this.initialized) {
        // Mock mode - log to console and file
        console.log(`📱 SMS MOCK: ${fullMessage}`);
        this.logAlert(fullMessage);
        return { success: true, mode: 'mock' };
      }

      // Real SMS via Twilio
      const result = await this.client.messages.create({
        body: fullMessage,
        from: process.env.TWILIO_PHONE_NUMBER || '+15551234567',
        to: `+1${this.phoneNumber}`
      });

      this.logAlert(`SMS SENT: ${fullMessage} (SID: ${result.sid})`);
      return { success: true, sid: result.sid, mode: 'live' };

    } catch (error) {
      console.error('📱 SMS Error:', error.message);
      this.logAlert(`SMS ERROR: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  logAlert(message) {
    const logEntry = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(path.join(__dirname, 'sms-alerts.log'), logEntry);
  }

  // Marketplace event handlers
  async onListingViewed(platform, listing) {
    await this.sendAlert(`🔥 NEW VIEW: ${listing} on ${platform}`, 'traffic');
  }

  async onInquiry(platform, inquiry) {
    await this.sendAlert(`💬 INQUIRY: "${inquiry}" from ${platform}`, 'lead');
  }

  async onSale(platform, amount, product) {
    await this.sendAlert(`💰 SALE: $${amount} for ${product} on ${platform}`, 'sale');
  }

  async onPaymentReceived(amount, method, product) {
    await this.sendAlert(`💳 PAYMENT: $${amount} via ${method} for ${product}`, 'payment');
  }

  async onSystemAlert(message) {
    await this.sendAlert(`⚠️ SYSTEM: ${message}`, 'system');
  }

  // Setup Express routes for webhooks
  setupExpressRoutes(app) {
    // Marketplace tracking endpoint
    app.post('/api/sms/track', async (req, res) => {
      try {
        const { event, platform, data } = req.body;

        switch (event) {
          case 'view':
            await this.onListingViewed(platform, data.listing);
            break;
          case 'inquiry':
            await this.onInquiry(platform, data.inquiry);
            break;
          case 'sale':
            await this.onSale(platform, data.amount, data.product);
            break;
          case 'payment':
            await this.onPaymentReceived(data.amount, data.method, data.product);
            break;
          default:
            await this.onSystemAlert(`Unknown event: ${event}`);
        }

        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Manual test endpoint
    app.post('/api/sms/test', async (req, res) => {
      try {
        const result = await this.sendAlert('🧪 Test alert from EFH system', 'test');
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    console.log('📱 SMS Alert routes configured');
  }
}

// Export singleton instance
module.exports = new SMSAlertHandler();