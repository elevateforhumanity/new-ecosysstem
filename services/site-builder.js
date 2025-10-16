/**
 * Site Builder Service (Google Sites Alternative)
 */
class SiteBuilderService {
  constructor() {
    this.sites = new Map();
    this.pages = new Map();
  }

  async createSite({ title, ownerId, template = 'blank' }) {
    const siteId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const site = {
      id: siteId,
      title,
      ownerId,
      domain: `${title.toLowerCase().replace(/\s+/g, '-')}.elevate.site`,
      pages: [],
      theme: { primaryColor: '#4285f4', fontFamily: 'Arial' },
      published: false,
      createdAt: new Date()
    };
    this.sites.set(siteId, site);
    return site;
  }

  async addPage(siteId, page) {
    const site = this.sites.get(siteId);
    if (!site) throw new Error('Site not found');
    const pageId = `page_${Date.now()}`;
    const newPage = { id: pageId, siteId, ...page };
    this.pages.set(pageId, newPage);
    site.pages.push(pageId);
    return newPage;
  }

  async publishSite(siteId) {
    const site = this.sites.get(siteId);
    if (!site) throw new Error('Site not found');
    site.published = true;
    site.publishedAt = new Date();
    return site;
  }
}
module.exports = new SiteBuilderService();
