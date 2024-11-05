// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as fs from 'fs';
import {ErrorPreview} from '../../errors/ErrorPreview';
import {IConfig} from './../../types/types';
import {handleError} from './../../utils/log';

export const initialCheck = async (config: IConfig): Promise<void> => {
    try {
        await fs.promises.access(config.inputRootPath);
    } catch (e) {
        throw new ErrorPreview({
            error: 101,
            params: {
                errorId: handleError(e)
            }
        });
    }

    try {
        await fs.promises.access(config.outputRootPath);
    } catch (e) {
        throw new ErrorPreview({
            error: 102,
            params: {
                errorId: handleError(e)
            }
        });
    }
};
