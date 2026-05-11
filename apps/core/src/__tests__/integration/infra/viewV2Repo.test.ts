// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '../../../_types/queryInfos';
import {
    type IViewV2CreateInRepo,
    type IViewV2Repo,
    type IViewV2UpdateInRepo,
    VIEWS_V2_COLLECTION_NAME,
} from '../../../infra/viewV2/viewV2Repo';
import {ViewV2Types} from '../../../_types/viewsV2';
import {clearAllCollectionDocuments, getViewV2Repo} from './integrationTestRepoUtils';

describe('viewV2Repo', () => {
    let viewV2Repo: IViewV2Repo;
    const ctx: IQueryInfos = {
        userId: '1',
    };

    const baseView: IViewV2CreateInRepo = {
        library: 'test_lib',
        label: {fr: 'My view'},
        color: '#123456',
        display: {type: ViewV2Types.LIST},
        filters: [{field: 'id', value: 'fake_id_filter'}],
        sort: [{field: 'id', order: 'asc'}],
        shared: false,
        created_by: '1',
        created_at: 1234567890,
        modified_at: 1234567890,
        attributes: ['id', 'label'],
    };

    beforeAll(() => {
        viewV2Repo = getViewV2Repo();
    });

    afterEach(async () => {
        await clearAllCollectionDocuments(VIEWS_V2_COLLECTION_NAME);
    });

    describe('createViewV2', () => {
        it('should create a viewV2 with an explicit id', async () => {
            const created = await viewV2Repo.createViewV2({...baseView, id: 'created_view'}, ctx);

            expect(created.id).toBe('created_view');
            expect(created.library).toBe('test_lib');
            expect(created.color).toBe('#123456');
            expect(created.display).toEqual({type: ViewV2Types.LIST});
            expect(created.attributes).toEqual(['id', 'label']);
        });

        it('should create a viewV2 with an auto-generated id when none is provided', async () => {
            const created = await viewV2Repo.createViewV2({...baseView}, ctx);

            expect(created.id).toBeTruthy();
            expect(created.library).toBe('test_lib');
        });
    });

    describe('updateViewV2', () => {
        it('should update only the provided fields and leave the rest untouched', async () => {
            const created = await viewV2Repo.createViewV2({...baseView, id: 'updated_view', color: '#000000'}, ctx);

            const updated = await viewV2Repo.updateViewV2(
                {
                    id: created.id,
                    color: '#FFFFFF',
                    label: {fr: 'Updated label'},
                    modified_at: 1234567999,
                },
                ctx,
            );

            expect(updated.id).toBe('updated_view');
            expect(updated.color).toBe('#FFFFFF');
            expect(updated.label).toEqual({fr: 'Updated label'});
            expect(updated.modified_at).toBe(1234567999);
            expect(updated.library).toBe('test_lib');
            expect(updated.shared).toBe(false);
        });

        it('should drop fields that are null in the update payload (keepNull: false)', async () => {
            await viewV2Repo.createViewV2({...baseView, id: 'view_drop_null'}, ctx);

            const updated = await viewV2Repo.updateViewV2(
                {id: 'view_drop_null', modified_at: 1234567999, filters: null} as IViewV2UpdateInRepo,
                ctx,
            );

            expect(updated.filters).toBeUndefined();
        });
    });

    describe('getViewsV2', () => {
        beforeEach(async () => {
            await viewV2Repo.createViewV2({...baseView, id: 'own_private', shared: false, created_by: '1'}, ctx);
            await viewV2Repo.createViewV2({...baseView, id: 'own_shared', shared: true, created_by: '1'}, ctx);
            await viewV2Repo.createViewV2({...baseView, id: 'other_private', shared: false, created_by: '42'}, ctx);
            await viewV2Repo.createViewV2({...baseView, id: 'other_shared', shared: true, created_by: '42'}, ctx);
        });

        it('should return only shared views and views owned by the requesting user', async () => {
            const result = await viewV2Repo.getViewsV2(
                {filters: {created_by: '1', library: 'test_lib'}, withCount: true},
                ctx,
            );

            const ids = result.list.map(v => v.id).sort();
            expect(ids).toEqual(['other_shared', 'own_private', 'own_shared']);
            expect(result.totalCount).toBe(3);
        });

        it('should return a single view when filtered by id with strictFilters', async () => {
            const result = await viewV2Repo.getViewsV2({filters: {id: 'own_private'}, strictFilters: true}, ctx);

            expect(result.list).toHaveLength(1);
            expect(result.list[0].id).toBe('own_private');
        });

        it('should return an empty list when filtering on a non-existing id', async () => {
            const result = await viewV2Repo.getViewsV2({filters: {id: 'does_not_exist'}, strictFilters: true}, ctx);

            expect(result.list).toHaveLength(0);
        });
    });

    describe('deleteViewV2', () => {
        it('should remove a viewV2 from the collection', async () => {
            await viewV2Repo.createViewV2({...baseView, id: 'to_delete'}, ctx);

            const deleted = await viewV2Repo.deleteViewV2('to_delete', ctx);
            expect(deleted.id).toBe('to_delete');

            const remaining = await viewV2Repo.getViewsV2({filters: {id: 'to_delete'}, strictFilters: true}, ctx);
            expect(remaining.list).toHaveLength(0);
        });
    });
});
