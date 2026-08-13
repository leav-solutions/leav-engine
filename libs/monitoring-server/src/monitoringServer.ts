import {Hono} from 'hono';
import {serve} from '@hono/node-server';
import {logger} from '@leav/logger';

export interface IMonitoringServer {
    init(): Promise<void>;
    close(): Promise<void>;
}

export type MonitoringHealthCheckFunction = () => Promise<boolean>;

export interface IMonitoringServerParams {
    /**
     * Check health of the application. If not provided, the /health endpoint will always return OK.
     */
    healthCheckFunction?: MonitoringHealthCheckFunction;
}

const DEFAULT_MONITORING_SERVER_PORT = 44444;

export function monitoringServer({healthCheckFunction}: IMonitoringServerParams = {}): IMonitoringServer {
    const serverPort =
        Number.parseInt(process.env.MONITORING_SERVER_PORT || `${DEFAULT_MONITORING_SERVER_PORT}`, 10) ||
        DEFAULT_MONITORING_SERVER_PORT;
    let server: ReturnType<typeof serve> | undefined;

    const createMonitoringApp = (): Hono => {
        const app = new Hono();

        app.get('/', c => c.text('Hello! This is the monitoring server.'));
        app.get('/health', async c => {
            if (healthCheckFunction) {
                try {
                    const healthy = await healthCheckFunction();
                    if (healthy) {
                        return c.text('OK');
                    } else {
                        return c.text('NOT OK', 500);
                    }
                } catch (e) {
                    logger.error(`Health check function error: ${e.message}`);
                    return c.text('NOT OK', 500);
                }
            }
            return c.text('OK');
        });

        app.onError((err, c) => {
            logger.error(`Monitoring server error: ${err.message}`);
            return c.text('Internal Server Error', 500);
        });

        return app;
    };

    return {
        init: async () => {
            try {
                server = serve(
                    {
                        port: serverPort,
                        fetch: createMonitoringApp().fetch,
                    },
                    info => {
                        logger.info(`Monitoring server listening on http://localhost:${info.port}`);
                    },
                );
            } catch (e) {
                logger.error(`Unable to start monitoring server because of error: ${e.message}`);
            }
        },
        close: async () => {
            if (server && typeof server.close === 'function') {
                await new Promise<void>((resolve, reject) => {
                    server?.close((err?: Error) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
                server = undefined;
                logger.info('Monitoring server closed');
            }
        },
    };
}
