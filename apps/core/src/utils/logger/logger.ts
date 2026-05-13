import Bugsnag from '@bugsnag/js';
import {configureLogger, logger} from '@leav/logger';
import {type IConfig} from '../../_types/config';

export default function () {
    // Do not configure logger here, should be done in app entry point

    return logger;
}

export function setupLogger(config: IConfig) {
    const onErrorLog = config.bugsnag.enable
        ? (message: string, meta: any, getCallStackTrace: () => string) => {
              const error = new Error(JSON.stringify({message, meta}));

              // When error log comes from bugsnag, do not notify again
              if (!error.stack.match(/node_modules\/@bugsnag\//)) {
                  // Improve stack trace to start from the caller of logger.error
                  error.stack = error.stack.split('\n')[0] + '\n' + getCallStackTrace();

                  Bugsnag.notify(error);
              }
          }
        : undefined;

    configureLogger({
        onErrorLog,
    });
}
