export interface IConfig {
    inputRootPath: string;
    outputRootPath: string;
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
    verbose?: boolean;
}

export interface IResult {
    error: number;
    error_detail?: string;
    params?: {
        background?: true | false | string;
        density?: number;
        size?: number;
        output: string;
        name: string;
    };
}

export interface IResponse {
    context: any;
    input: string;
    results?: IResult[];
}

export interface IMessageConsume {
    input: string;
    context: any;
    versions: IVersion[];
}

export interface IVersion {
    background?: true | false | string;
    density?: number;
    multiPage?: string;
    sizes: ISize[];
}

export interface ISize {
    size: number;
    output: string;
    name: string;
}

export interface IExec {
    command: string;
    args: string[];
}

export interface IArgs {
    before: string[];
    after: string[];
}

export interface IRootPaths {
    input: string;
    output: string;
}
