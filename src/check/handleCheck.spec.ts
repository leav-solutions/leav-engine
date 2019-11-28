import {handleCheck} from './handleCheck';
import {checkInput} from './checkInput/checkInput';
import {IMessageConsume} from './../types';
import {checkOutput} from './checkOutput/checkOutput';

describe('handleCheck', () => {
    const rootPath = '/app/';
    const input = 'test.jpg';
    const output = 'test.png';
    const size = 800;

    const msgContent: Mockify<IMessageConsume> = {
        input,
        versions: [
            {
                sizes: [
                    {
                        size,
                        output,
                    },
                ],
            },
        ],
    };

    test('should call checkInput with input absolute path', () => {
        (checkInput as jest.FunctionLike) = jest.fn();
        (checkOutput as jest.FunctionLike) = jest.fn();

        handleCheck(msgContent as IMessageConsume, rootPath);

        expect(checkInput).toBeCalledWith(rootPath + msgContent.input);
    });

    test('should call checkOuput with output', () => {
        (checkInput as jest.FunctionLike) = jest.fn();
        (checkOutput as jest.FunctionLike) = jest.fn();

        handleCheck(msgContent as IMessageConsume, rootPath);

        expect(checkOutput).toBeCalledWith(rootPath + output, size);
    });
});
