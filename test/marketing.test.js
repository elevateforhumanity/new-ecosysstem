import request from 'supertest';
import app from '../simple-server.cjs';

describe('Marketing Content', () => {
  test('Banners load', async () => {
    const res = await request(app).get('/api/marketing/banners');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.banners)).toBe(true);
    expect(res.body.banners.length).toBeGreaterThan(0);
  });
  test('Landing page loads', async () => {
    const res = await request(app).get('/api/marketing/page/landing');
    expect(res.status).toBe(200);
    expect(res.body.hero.title).toContain('Rise Forward');
  });
  test('Lead capture works', async () => {
    const res = await request(app).post('/api/marketing/lead').send({ email: 'demo@example.org', intent: 'info' });
    expect(res.status).toBe(200);
    expect(res.body.stored).toBe(true);
  });
});
