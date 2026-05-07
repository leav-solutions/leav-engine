// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {type IDbUtils} from '../db/dbUtils';
import {type IQueryInfos} from '../../_types/queryInfos';
import {mockViewV2} from '../../__tests__/mocks/viewV2';
import viewV2Repo from './viewV2Repo';
import {type IViewV2FilterOptions} from '../../_types/viewsV2';

describe('viewV2Repo', () => {
    const docViewData = {
        ...mockViewV2,
        _key: mockViewV2.id,
    };

    const ctx: IQueryInfos = {
        userId: '1',
    };

    const mockDbUtils: Mockify<IDbUtils> = {
        cleanup: vi.fn().mockReturnValue(mockViewV2),
        convertToDoc: vi.fn().mockReturnValue(docViewData),
        findCoreEntity: global.__mockPromise({list: [{...mockViewV2}]}),
    };

    const mockDbServ = {
        db: new Database(),
        execute: global.__mockPromise([docViewData]),
    };

    beforeEach(() => vi.clearAllMocks());

    describe('createViewV2', () => {
        test('Should create a new viewV2', async () => {
            const repo = viewV2Repo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const newView = await repo.createViewV2({...mockViewV2}, ctx);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(newView).toMatchObject(mockViewV2);
        });
    });

    describe('updateViewV2', () => {
        test('Should update an existing viewV2', async () => {
            const repo = viewV2Repo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const updatedView = await repo.updateViewV2({...mockViewV2}, ctx);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(updatedView).toMatchObject(mockViewV2);
        });
    });

    describe('getViewsV2', () => {
        test("Get shared and user's viewsV2", async () => {
            const repo = viewV2Repo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const filters: IViewV2FilterOptions = {
                created_by: '1',
                library: 'test_lib',
            };

            const views = await repo.getViewsV2({filters}, ctx);

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(views).toEqual({list: [mockViewV2]});
        });
    });

    describe('deleteViewV2', () => {
        test('Should delete viewV2', async () => {
            const repo = viewV2Repo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const delView = await repo.deleteViewV2(mockViewV2.id, ctx);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(delView).toMatchObject(mockViewV2);
        });
    });
});
