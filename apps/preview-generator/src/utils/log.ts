import {logger} from '@leav/logger';

export const handleError = (error: any) => {
    const errorId = crypto.randomUUID();

    logger.error(`Error with id ${errorId} : ${error?.stack || error}`);

    return errorId;
};
