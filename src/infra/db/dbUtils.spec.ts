import {Database} from 'arangojs';
import {TREES_COLLECTION_NAME} from '../../infra/tree/treeRepo';
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

    describe('findCoreEntity', () => {
        let mockDbServ;
        let testDbUtils;
        beforeEach(() => {
            mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: 'categories',
                        _id: 'core_trees/categories',
                        _rev: '_Wm_Qdtu--_',
                        label: {
                            fr: 'Arbre des catégories'
                        },
                        libraries: ['categories'],
                        system: false
                    }
                ])
            };
            testDbUtils = dbUtils(mockDbServ, null, {lang: {available: ['fr', 'en']}});
            testDbUtils.cleanup = jest.fn().mockReturnValue({
                id: 'categories',
                system: false,
                label: {
                    fr: 'Arbre des catégories'
                }
            });
            testDbUtils.convertToDoc = jest.fn().mockReturnValue({
                _key: 'categories',
                system: false,
                label: 'Arbre des catégories'
            });
        });

        test('Find core entity without filters', async () => {
            const res = await testDbUtils.findCoreEntity(TREES_COLLECTION_NAME);

            expect(res).toHaveLength(1);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FOR el IN core_trees/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(res[0]).toMatchObject({
                id: 'categories',
                system: false,
                label: {
                    fr: 'Arbre des catégories'
                }
            });
        });

        test('Filter with a LIKE on ID', async function() {
            const res = await testDbUtils.findCoreEntity(TREES_COLLECTION_NAME, {id: 'test'});

            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(FILTER LIKE){1}/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });

        test('Should filter label on any language', async function() {
            const res = await testDbUtils.findCoreEntity(TREES_COLLECTION_NAME, {label: 'test'});

            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(LIKE(.*)label\.fr(.*)OR LIKE(.*)label\.en)/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });

        test('Should return an empty array if no results', async function() {
            mockDbServ = {db: null, execute: global.__mockPromise([])};
            testDbUtils = dbUtils(mockDbServ, null, {lang: {available: ['fr', 'en']}});
            testDbUtils.cleanup = jest.fn();
            testDbUtils.convertToDoc = jest.fn();

            mockDbServ = {db: null, execute: global.__mockPromise([])};
            const res = await testDbUtils.findCoreEntity(TREES_COLLECTION_NAME);

            expect(res).toBeInstanceOf(Array);
            expect(res.length).toBe(0);
        });
    });
});
