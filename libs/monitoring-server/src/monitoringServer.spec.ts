import {monitoringServer} from './monitoringServer';
import fetch from 'node-fetch';

describe('monitoringServer', () => {
    let server: ReturnType<typeof monitoringServer>;
    const healthCheckFunction = vi.fn();
    const port = 44445;

    beforeAll(async () => {
        vi.resetAllMocks();
        process.env.MONITORING_SERVER_PORT = port.toString();
        server = monitoringServer({
            healthCheckFunction,
        });
        healthCheckFunction.mockResolvedValue(true);
        await server.init();
    });

    afterAll(async () => {
        await server?.close();
    });

    it('should respond OK on /', async () => {
        const res = await fetch(`http://localhost:${port}/`);
        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toBe('Hello! This is the monitoring server.');
    });

    it('should respond OK (status 200) on /health if healthCheckFunction returns true', async () => {
        const res = await fetch(`http://localhost:${port}/health`);
        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toBe('OK');
    });

    it('should respond NOT OK (status 500) on /health if healthCheckFunction returns false', async () => {
        healthCheckFunction.mockResolvedValue(false);
        const res = await fetch(`http://localhost:${port}/health`);
        expect(res.status).toBe(500);
        const text = await res.text();
        expect(text).toBe('NOT OK');
    });

    it('should respond NOT OK (status 500) on /health if healthCheckFunction throws', async () => {
        healthCheckFunction.mockRejectedValue(new Error('Health check failed'));
        const res = await fetch(`http://localhost:${port}/health`);
        expect(res.status).toBe(500);
        const text = await res.text();
        expect(text).toBe('NOT OK');
    });

    it('should respond with Prometheus metrics on /metrics', async () => {
        const res = await fetch(`http://localhost:${port}/metrics`);
        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toContain('process_cpu_user_seconds_total'); // standard nodejs metric
    });
});
