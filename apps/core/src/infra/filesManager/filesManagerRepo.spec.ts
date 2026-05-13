import {Database} from 'arangojs';
import {type IQueryInfos} from '../../_types/queryInfos';
import filesManagerRepo from './filesManagerRepo';

describe('FilesManagerRepo', () => {
    test('getRecord', async function () {
        const ctx: IQueryInfos = {
            userId: '0',
            queryId: 'filesManagerRepoTest',
        };
        const mockEnsureIndex = vi.fn();
        const mockCollection = new Database().collection('test');
        mockCollection.ensureIndex = mockEnsureIndex;

        const mockDb = new Database();
        mockDb.collection = vi.fn().mockReturnValue(mockCollection);

        const mockDbServ = {
            db: mockDb,
            execute: global.__mockPromise([]),
        };

        const repo = filesManagerRepo({
            'core.infra.db.dbService': mockDbServ,
        });

        const res = await repo.getRecord(
            {
                fileName: 'fileNameTest',
                filePath: 'filePathTest',
                fileInode: 128,
            },
            {
                recordLibrary: 'test',
                recordId: '128',
            },
            false,
            ctx,
        );
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
    });
    test('getParentRecord', async function () {
        const ctx: IQueryInfos = {
            userId: '0',
            queryId: 'filesManagerRepoTest',
        };
        const mockEnsureIndex = vi.fn();
        const mockCollection = new Database().collection('test');
        mockCollection.ensureIndex = mockEnsureIndex;

        const mockDb = new Database();
        mockDb.collection = vi.fn().mockReturnValue(mockCollection);

        const mockDbServ = {
            db: mockDb,
            execute: global.__mockPromise([]),
        };

        const repo = filesManagerRepo({
            'core.infra.db.dbService': mockDbServ,
        });

        const res = await repo.getParentRecord('fullParentPath', 'libraryTest', ctx);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
    });
});
