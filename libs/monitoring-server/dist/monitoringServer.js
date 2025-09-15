"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringServer = monitoringServer;
// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const Prometheus = __importStar(require("prom-client"));
const logger_1 = require("@leav/logger");
const DEFAULT_MONITORING_SERVER_PORT = 44444;
function monitoringServer({ healthCheckFunction } = {}) {
    Prometheus.collectDefaultMetrics({ register: Prometheus.register });
    const serverPort = Number.parseInt(process.env.MONITORING_SERVER_PORT || `${DEFAULT_MONITORING_SERVER_PORT}`, 10) ||
        DEFAULT_MONITORING_SERVER_PORT;
    let server;
    const createMonitoringApp = () => {
        const app = new hono_1.Hono();
        app.get('/', c => c.text('Hello! This is the monitoring server.'));
        app.get('/health', async (c) => {
            if (healthCheckFunction) {
                try {
                    const healthy = await healthCheckFunction();
                    if (healthy) {
                        return c.text('OK');
                    }
                    else {
                        return c.text('NOT OK', 500);
                    }
                }
                catch (e) {
                    logger_1.logger.error(`Health check function error: ${e.message}`);
                    return c.text('NOT OK', 500);
                }
            }
            return c.text('OK');
        });
        app.get('/metrics', async (c) => {
            const metrics = await Prometheus.register.metrics();
            return c.text(metrics);
        });
        app.onError((err, c) => {
            logger_1.logger.error(`Monitoring server error: ${err.message}`);
            return c.text('Internal Server Error', 500);
        });
        return app;
    };
    return {
        init: async () => {
            try {
                server = (0, node_server_1.serve)({
                    port: serverPort,
                    fetch: createMonitoringApp().fetch
                }, info => {
                    logger_1.logger.info(`Monitoring server listening on http://localhost:${info.port}`);
                });
            }
            catch (e) {
                logger_1.logger.error(`Unable to start monitoring server because of error: ${e.message}`);
            }
        },
        close: async () => {
            if (server && typeof server.close === 'function') {
                await new Promise((resolve, reject) => {
                    server.close((err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
                server = undefined;
                logger_1.logger.info('Monitoring server closed');
            }
        }
    };
}
//# sourceMappingURL=monitoringServer.js.map