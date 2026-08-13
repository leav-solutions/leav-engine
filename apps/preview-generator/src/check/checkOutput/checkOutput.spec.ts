import {checkOutput} from './checkOutput';

describe('checkOutput', () => {
    const path = '/data/test.jpg';
    const size = 800;
    const name = 'big';

    test('should throw an error', async () => {
        checkOutput(path, size, name).catch(e => expect(e).not.toBeNull());
    });
});
