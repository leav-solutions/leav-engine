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
    multiPage?: string;
    sizes: ISize[];
}

export interface ISize {
    size: number;
    output: string;
}

export enum ErrorList {
    "file doesn't exist" = 1,
    'input is not a file' = 2,
    'error when getting file stats' = 3,
    'file output must be a png' = 4,
    'file type unknown' = 5,
    "can't parse the message" = 6,
    "can't access the inputRootPath" = 7,
    "can't access the outputRootPath" = 8,
    "can't create folder for output" = 9,
    'error when generating the preview' = 11,
    'error when creating the temporary file for the document type' = 12,
    'error when generating preview from temporary pdf document' = 13,
    'error when getting the colorspace of the input' = 14,
    'error when create the folder for multi page' = 15,
    'error when getting the number page of pdf' = 16,
    'error when generating multi page' = 17,
    'type of the file not manage' = 18,
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
