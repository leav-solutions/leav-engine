import { Channel } from "amqplib";

export interface AmqpParams {
  channel?: Channel;
  exchange?: string;
  routingKey?: string;
}

export interface WatcherParams {
  awaitWriteFinish?: {
    stabilityThreshold?: number;
    pollInterval: 100;
  };
  timeout?: number;
  verbose?: boolean;
}

export interface Config {
  rootPath: string;
  rootKey?: string;
  redis: {
    host: string;
    port: number;
  };
  amqp?: {
    protocol: string;
    hostname: string;
    port: number;
    username: string;
    password: string;
    queue: string;
    exchange: string;
    routingKey: string;
  };
  watcher?: {
    awaitWriteFinish: {
      stabilityThreshold: number;
      pollIntervak: number;
    };
  };
  verbose?: boolean;
}

export interface Params {
  rootKey: string;
  verbose: boolean;
  amqp?: AmqpParams;
}

export interface ParamsExtends extends Params {
  timeout?: number;
  ready?: boolean;
}
