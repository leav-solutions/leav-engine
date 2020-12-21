import {IConfig} from '../../types/types';
import {checkOutput} from './checkOutput';

describe('checkOutput', () => {
    const path = '/data/test.jpg';
    const size = 800;
    const name = 'big';
    const config: Mockify<IConfig> = {
        outputRootPath: '/data/'
    };

    test('should throw an error', async () => {
        (console.error as jest.FunctionLike) = jest.fn();
        checkOutput(path, size, name, config as IConfig).catch(e => expect(e).not.toBeNull());
    });
});
