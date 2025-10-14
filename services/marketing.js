/**
 * Marketing Service
 * Handles marketing campaigns, analytics, and lead generation
 */

class MarketingService {
  constructor() {
    this.campaigns = new Map();
    this.leads = [];
  }

  async createCampaign(campaignData) {
    const campaign = {
      id: `campaign_${Date.now()}`,
      ...campaignData,
      createdAt: new Date(),
      status: 'active'
    };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async trackLead(leadData) {
    const lead = {
      id: `lead_${Date.now()}`,
      ...leadData,
      timestamp: new Date(),
      source: leadData.source || 'direct'
    };
    this.leads.push(lead);
    return lead;
  }

  async getCampaignMetrics(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const campaignLeads = this.leads.filter(l => l.campaignId === campaignId);
    return {
      totalLeads: campaignLeads.length,
      conversionRate: this.calculateConversionRate(campaignLeads),
      roi: this.calculateROI(campaign, campaignLeads)
    };
  }

  calculateConversionRate(leads) {
    const converted = leads.filter(l => l.converted).length;
    return leads.length > 0 ? (converted / leads.length) * 100 : 0;
  }

  calculateROI(campaign, leads) {
    const revenue = leads.reduce((sum, l) => sum + (l.revenue || 0), 0);
    const cost = campaign.budget || 0;
    return cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
  }
}

module.exports = new MarketingService();
