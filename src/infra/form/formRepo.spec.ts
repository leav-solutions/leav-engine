import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {mockForm} from '../../__tests__/mocks/forms';
import formRepo from './formRepo';
import {IQueryInfos} from '_types/queryInfos';

describe('FormRepo', () => {
    const docFormData = {...mockForm, _key: 'my_lib__test_form'};
    const formData = {...mockForm};
    const mockCleanupRes = {...formData, id: 'my_lib__test_form'};
    const ctx: IQueryInfos = {
        userId: 0,
        queryId: 'formRepoTest'
    };
    describe('Get forms', () => {
        test('Retrieve forms list with clean id', async () => {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils: Mockify<IDbUtils> = {
                findCoreEntity: global.__mockPromise({list: [{...mockForm, id: 'my_lib__test_form'}]})
            };

            const repo = formRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const forms = await repo.getForms({ctx});

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(forms).toEqual({list: [mockForm]});
        });

        test('Convert ID filter', async () => {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils: Mockify<IDbUtils> = {
                findCoreEntity: global.__mockPromise({list: [{...mockForm, id: 'my_lib__test_form'}]})
            };

            const repo = formRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const forms = await repo.getForms({
                params: {filters: {library: 'my_lib', id: 'test_form'}},
                ctx
            });

            expect(mockDbUtils.findCoreEntity.mock.calls[0][0].filters.id).toBe('my_lib__test_form');
        });
    });

    test('Update form', async () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([docFormData])
        };

        const mockDbUtils: Mockify<IDbUtils> = {
            cleanup: jest.fn().mockReturnValue(mockCleanupRes),
            convertToDoc: jest.fn().mockReturnValue(docFormData)
        };

        const repo = formRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils
        });

        const updatedForm = await repo.updateForm({formData, ctx});
        expect(mockDbServ.execute.mock.calls.length).toBe(1);
        expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPDATE/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(updatedForm).toMatchObject(formData);
    });

    test('Create form', async () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([docFormData])
        };

        const mockDbUtils: Mockify<IDbUtils> = {
            cleanup: jest.fn().mockReturnValue(mockCleanupRes),
            convertToDoc: jest.fn().mockReturnValue(docFormData)
        };

        const repo = formRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils
        });

        const createdForm = await repo.createForm({formData, ctx});
        expect(mockDbServ.execute.mock.calls.length).toBe(1);
        expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(createdForm).toMatchObject(formData);
    });

    test('Delete form', async () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([docFormData])
        };

        const mockDbUtils: Mockify<IDbUtils> = {
            cleanup: jest.fn().mockReturnValue(mockCleanupRes),
            convertToDoc: jest.fn().mockReturnValue(docFormData)
        };

        const repo = formRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils
        });

        const deleteRes = await repo.deleteForm({formData, ctx});

        expect(mockDbServ.execute.mock.calls.length).toBe(1);

        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^REMOVE/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(deleteRes).toMatchObject(formData);
    });
});
