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

export interface IResult {
    error: number;
    params?: {
        background?: true | false | string;
        density?: number;
        size: number;
        output: string;
    };
}

export interface IResponse {
    context: any;
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
    sizes: ISize[];
}

export interface ISize {
    size: number;
    output: string;
}

export enum ErrorList {
    "file doesn't exist" = 1,
    'input is not a file' = 2,
    'error when get file stats' = 3,
    'file output must be a png' = 4,
    'file type unknow' = 5,
    "can't parse message" = 6,
    'error in execImage' = 11,
    'error in execImageWithClip' = 12,
    'error in execPsd' = 13,
    'error in execPsdWithClip' = 14,
    'error in execVideo' = 15,
}

export interface IExec {
    command: string;
    args: string[];
}

export interface IArgs {
    before: string[];
    after: string[];
}
