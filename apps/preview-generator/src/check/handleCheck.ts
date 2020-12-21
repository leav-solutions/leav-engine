import {initialCheck} from './initialCheck/initialCheck';
import {join} from 'path';
import {IMessageConsume, IConfig} from '../types/types';
import {checkInput} from './checkInput/checkInput';
import {checkOutput} from './checkOutput/checkOutput';

export const handleCheck = async (msgContent: IMessageConsume, config: IConfig) => {
    const {input, versions} = msgContent;

    await initialCheck(config);
    await checkInput(input, config.inputRootPath);

    for (const version of versions) {
        for (const size of version.sizes) {
            const output = join(config.outputRootPath, size.output);
            await checkOutput(output, size.size, size.name, config);
        }
    }
};
