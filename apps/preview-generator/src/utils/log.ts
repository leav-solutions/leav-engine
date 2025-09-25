// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import uuid = require('uuid/v4');

export const handleError = (error: any) => {
    const errorId = uuid();

    logger.error(`Error with id ${errorId} : ${error?.stack || error}`);

    return errorId;
};
