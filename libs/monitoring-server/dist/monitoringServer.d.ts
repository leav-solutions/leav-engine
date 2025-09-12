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
export declare function monitoringServer({ healthCheckFunction }?: IMonitoringServerParams): IMonitoringServer;
