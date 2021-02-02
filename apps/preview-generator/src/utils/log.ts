// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import uuid = require('uuid/v4');

export const handleError = (error: any) => {
    const errorId = uuid();

    logError(errorId, error);

    return errorId;
};

export const logError = (errorId: string, error: any) => {
    console.error(errorId, error);
};
