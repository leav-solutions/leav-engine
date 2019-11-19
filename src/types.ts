export interface ISize {
    width: number;
    height: number;
}

export interface IConfig {
    rootPath: string;
    ICCPath: string;
    amqp: {
        protocol: string;
        hostname: string;
        port: number;
        username: string;
        password: string;
        consume: {
            queue: string;
            exchange: string;
            routingKey: string;
        };
        publish: {
            queue: string;
            exchange: string;
            routingKey: string;
        };
    };
}

export interface IResponse {
    error_code: number;
    error: string | null;
    output: string | null;
}
