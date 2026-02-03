// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';
import {ViewSizes, ViewTypes} from '../../../../_types/views';

describe('Views', () => {
    const testLibName = 'test_views_lib';
    let viewId: string;

    beforeAll(async () => {
        await gqlSaveLibrary(testLibName, 'Test Lib');
    });

    describe('CRUD operations', () => {
        test('Create view', async () => {
            const resSaveView = await makeGraphQlCall(`mutation {
                saveView(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewTypes.LIST}, size: ${ViewSizes.MEDIUM}},
                  shared: true,
                  label: {en: "test_first_view"},
                  description: {en: "Best view ever!"},
                  color: "#FFFFFF",
                  filters: [
                    {field: "label", value: "Test", condition: ${AttributeCondition.EQUAL}}
                  ],
                  sort: {field: "created_at", order: asc}
                }) {
                  id
                }
            }`);

            viewId = resSaveView.data.data.saveView.id;

            expect(resSaveView.status).toBe(200);
            expect(resSaveView.data.errors).toBeUndefined();
            expect(viewId).toBeTruthy();
        });

        test('Get views', async () => {
            const resGetViews = await makeGraphQlCall(`{
                views(library: "${testLibName}") {
                  totalCount
                  list {
                    id
                    created_by { whoAmI { id }}
                    modified_at
                    created_at
                    shared
                    label
                    description
                    color
                    filters {field value condition operator}
                    sort {field order}
                    attributes {id}
                  }
                }
            }`);

            expect(resGetViews.status).toBe(200);
            expect(resGetViews.data.errors).toBeUndefined();
            expect(resGetViews.data.data.views.list.length).toBeGreaterThanOrEqual(1);
            expect(resGetViews.data.data.views.list[0].created_by.whoAmI.id).toBeTruthy();
        });

        test('Update view', async () => {
            const resUpdateView = await makeGraphQlCall(`mutation {
                updateView(view: {
                  id: "${viewId}",
                  display: {type: ${ViewTypes.LIST}},
                }) {
                  id
                  display {
                    type
                  }
                }
            }`);

            expect(resUpdateView.status).toBe(200);
            expect(resUpdateView.data.errors).toBeUndefined();
            expect(resUpdateView.data.data.updateView.id).toBe(viewId);
        });

        test('Delete view', async () => {
            const resDeleteView = await makeGraphQlCall(`mutation {
                deleteView(viewId: "${viewId}") {
                    id
                }
            }`);

            expect(resDeleteView.status).toBe(200);
            expect(resDeleteView.data.errors).toBeUndefined();
            expect(resDeleteView.data.data.deleteView.id).toBe(viewId);
        });
    });
});
