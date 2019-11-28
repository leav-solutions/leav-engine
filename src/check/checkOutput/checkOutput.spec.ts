import {checkOutput} from './checkOutput';

describe('checkOutput', () => {
    const path = '/app/test.jpg';
    const size = 800;

    test('should throw an error', () => {
        expect(() => checkOutput(path, size)).toThrow();
    });
});
