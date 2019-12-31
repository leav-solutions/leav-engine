import {join} from 'path';
import {IMessageConsume, IConfig} from './../types';
import {checkInput} from './checkInput/checkInput';
import {checkOutput} from './checkOutput/checkOutput';

export const handleCheck = async (msgContent: IMessageConsume, config: IConfig) => {
    const {input, versions} = msgContent;

    await checkInput(input, config.inputRootPath);

    for (const version of versions) {
        for (const size of version.sizes) {
            await checkOutput(join(config.outputRootPath, size.output), size.size, config);
        }
    }
};
