import dbUtils from './dbUtils';

describe('dbUtils', () => {
    describe('cleanupSystemKeys', () => {
        test('Should remove all system keys', () => {
            const testDbUtils = dbUtils(null, null);

            const testObj = {
                _key: 'testKey',
                _id: 'testId',
                _rev: 'testRev',
                _randomSystemKey: 'test',
                normalKey: 'shouldBeKept'
            };

            const res = testDbUtils.cleanup(testObj);

            expect(res).toMatchObject({id: 'testKey', normalKey: 'shouldBeKept'});
        });

        test('Should return null if param is null', () => {
            const testDbUtils = dbUtils(null, null);

            const res = testDbUtils.cleanup(null);

            expect(res).toBeNull();
        });
    });

    describe('convertToDoc', () => {
        test('Should add needed system keys', () => {
            const testDbUtils = dbUtils(null, null);

            const testObj = {
                id: 'testId',
                normalKey: 'shouldBeKept'
            };

            const res = testDbUtils.convertToDoc(testObj);

            expect(res).toMatchObject({_key: 'testId', normalKey: 'shouldBeKept'});
        });
    });
});
