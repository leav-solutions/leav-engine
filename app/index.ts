import fs from "fs";
import amqp from "amqplib/callback_api";
import { Options, Connection, Channel } from "amqplib";
import { start } from "./watch/watch";

interface Config {
  rootPath: string;
  rootKey?: string;
  amqp?: {
    protocol: string;
    hostname: string;
    port: number;
    username: string;
    password: string;
    queue: string;
  };
  watcher?: {
    awaitWriteFinish: {
      stabilityThreshold: number;
      pollIntervak: number;
    };
  };
  verbose?: boolean;
}

const configPathArg = process.argv[2];
const configPath = configPathArg ? configPathArg : "./config/config.json";

const rawConfig = fs.readFileSync(configPath);
export const config: Config = JSON.parse(rawConfig.toString());

if (config.amqp) {
  const amqpConfig: Options.Connect = {
    protocol: config.amqp.protocol,
    hostname: config.amqp.hostname,
    username: config.amqp.username,
    password: config.amqp.password,
  };

  const queue = config.amqp.queue;

  amqp.connect(
    amqpConfig,
    async (error0: any, connection: Connection | any) => {
      // Connection is not compatible with Connection?
      if (error0) {
        throw error0;
      }

      const channel: Channel = await connection.createChannel();
      start(config.rootPath, config.verbose, { channel, queue });
    },
  );
} else {
  start(config.rootPath, config.verbose, {});
}
