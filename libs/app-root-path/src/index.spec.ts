import {appRootPath} from '.';

vi.mock('app-root-path', () => ({
    path: 'path/from/deps',
}));

describe('appRootPath', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = {...OLD_ENV};
    });

    test('Return path from env variable', async () => {
        process.env.APP_ROOT_PATH = 'path/from/variable';
        expect(appRootPath()).toMatch(new RegExp(/path\/from\/variable$/));
    });

    test('Determine path from app location', async () => {
        expect(appRootPath()).toMatch(new RegExp(/path\/from\/deps$/));
    });

    test('Remove trailing slashes', async () => {
        process.env.APP_ROOT_PATH = 'path/from/variable/';
        expect(appRootPath()).toMatch(new RegExp(/path\/from\/variable$/));
    });
});
