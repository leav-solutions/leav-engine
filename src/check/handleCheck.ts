import {Channel, ConsumeMessage} from 'amqplib';
import * as path from 'path';
import {IMessageConsume} from './../types';
import {checkInput} from './checkInput/checkInput';
import {checkOutput} from './checkOutput/checkOutput';

export const handleCheck = (msgContent: IMessageConsume, rootPath: string) => {
    const {input, versions} = msgContent;
    const _addRootPath = (p: string) => path.join(rootPath, p);

    checkInput(_addRootPath(input));

    versions.map(version => {
        version.sizes.map(size => {
            checkOutput(_addRootPath(size.output), size.size);
        });
    });
};
