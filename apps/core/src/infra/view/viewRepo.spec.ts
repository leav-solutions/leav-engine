// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {IQueryInfos} from '_types/queryInfos';
import {mockView} from '../../__tests__/mocks/view';
import viewRepo from './viewRepo';
import {IViewFilterOptions} from '_types/views';

describe('viewRepo', () => {
    const docViewData = {
        ...mockView,
        _key: mockView.id
    };

    const ctx: IQueryInfos = {
        userId: '1'
    };

    const mockDbUtils: Mockify<IDbUtils> = {
        cleanup: jest.fn().mockReturnValue(mockView),
        convertToDoc: jest.fn().mockReturnValue(docViewData),
        findCoreEntity: global.__mockPromise({list: [{...mockView}]})
    };

    const mockDbServ = {
        db: new Database(),
        execute: global.__mockPromise([docViewData])
    };

    beforeEach(() => jest.clearAllMocks());

    describe('createView', () => {
        test('Should create a new view', async () => {
            const repo = viewRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const newView = await repo.createView({...mockView}, ctx);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(newView).toMatchObject(mockView);
        });
    });

    describe('updateView', () => {
        test('Should update an existing view', async () => {
            const repo = viewRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedView = await repo.updateView({...mockView}, ctx);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(updatedView).toMatchObject(mockView);
        });
    });

    describe('getViews', () => {
        test("Get shared and user's views", async () => {
            const repo = viewRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const filters: IViewFilterOptions = {
                created_by: '1',
                library: 'test_lib'
            };

            const views = await repo.getViews({filters}, ctx);

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(views).toEqual({list: [mockView]});
        });
    });

    describe('deleteView', () => {
        test('Should delete view', async () => {
            const repo = viewRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const delView = await repo.deleteView(mockView.id, ctx);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(delView).toMatchObject(mockView);
        });
    });
});
