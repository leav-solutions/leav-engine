import * as fs from 'fs';
import {ErrorPreview} from '../../errors/ErrorPreview';
import {type IConfig} from './../../types/types';
import {handleError} from './../../utils/log';

export const initialCheck = async (config: IConfig): Promise<void> => {
    try {
        await fs.promises.access(config.inputRootPath);
    } catch (e) {
        throw new ErrorPreview({
            error: 101,
            params: {
                errorId: handleError(e),
            },
        });
    }

    try {
        await fs.promises.access(config.outputRootPath);
    } catch (e) {
        throw new ErrorPreview({
            error: 102,
            params: {
                errorId: handleError(e),
            },
        });
    }
};
