import uuid = require('uuid/v4');

export const handleError = (error: any) => {
    const errorId = uuid();

    logError(errorId, error);

    return errorId;
};

export const logError = (errorId: string, error: any) => {
    console.info(errorId, error);
};
