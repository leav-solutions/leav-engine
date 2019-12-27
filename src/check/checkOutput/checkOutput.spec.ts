import {IConfig} from './../../types';
import {checkOutput} from './checkOutput';

describe('checkOutput', () => {
    const path = '/data/test.jpg';
    const size = 800;
    const config: Mockify<IConfig> = {
        outputRootPath: '/data/',
    };

    test('should throw an error', async () => {
        checkOutput(path, size, config as IConfig).catch(e => expect(e).not.toBeNull());
    });
});
