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
}

export interface Config {
  rootPath: string;
  rootKey?: string;
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
  amqp?: AmqpParams;
}

export interface ParamsHandleEvent extends Params {
  timeout: number;
}

export interface ParamsCheckEvent extends ParamsHandleEvent {
  ready: boolean;
}
