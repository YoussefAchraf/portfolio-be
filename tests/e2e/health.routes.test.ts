import request from 'supertest';
import { buildTestApp } from '../helpers/buildTestApp';

describe('health endpoints', () => {
  it('GET /health is always 200 (liveness, no I/O)', async () => {
    const { app, probe } = buildTestApp();
    probe.up = false;
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /ready reflects the probes (200 ready / 503 not_ready)', async () => {
    const { app, probe } = buildTestApp();
    expect((await request(app).get('/ready')).body).toEqual({ status: 'ready', checks: { postgres: 'ok' } });
    probe.up = false;
    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'not_ready', checks: { postgres: 'down' } });
  });

  it('answers malformed JSON with 400 VALIDATION_FAILED', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/v1/hello').set('Content-Type', 'application/json').send('{"broken"');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
  });
});
