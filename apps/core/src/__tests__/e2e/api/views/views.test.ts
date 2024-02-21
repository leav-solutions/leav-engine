// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';
import {ViewSizes, ViewTypes} from '../../../../_types/views';

describe('Views', () => {
    const testLibName = 'test_views_lib';

    beforeAll(async () => {
        await gqlSaveLibrary(testLibName, 'Test Lib');
    });

    test('CRUD', async () => {
        // Create view
        const resSaveView = await makeGraphQlCall(`mutation {
            v1: saveView(view: {
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
            },
            v2: saveView(view: {
                library: "${testLibName}",
                display: {type: ${ViewTypes.LIST}, size: ${ViewSizes.MEDIUM}},
                shared: true,
                label: {en: "test_second_view"},
                description: {en: "Best view ever!"},
                color: "#FFFFFF",
                filters: [
                  {field: "label", value: "Test", condition: ${AttributeCondition.EQUAL}}
                ],
                sort: {field: "created_at", order: asc}
              }) {
                id
              }
          }
        `);

        const viewId = resSaveView.data.data.v1.id;
        expect(resSaveView.status).toBe(200);
        expect(resSaveView.data.errors).toBeUndefined();
        expect(viewId).toBeTruthy();

        // Get view
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
                settings {name value}
              }
            }
          }`);

        expect(resGetViews.status).toBe(200);
        expect(resGetViews.data.errors).toBeUndefined();
        expect(resGetViews.data.data.views.list.length).toBeGreaterThanOrEqual(2);
        expect(resGetViews.data.data.views.list[0].created_by.whoAmI.id).toBeTruthy();

        // Update view
        const resUpdateView = await makeGraphQlCall(`mutation {
            saveView(view: {
              id: "${viewId}",
              library: "${testLibName}",
              display: {type: ${ViewTypes.LIST}, size: ${ViewSizes.MEDIUM}},
              shared: true,
              label: {en: "My super view!"},
              description: {en: "Best view ever!"},
              color: "#000000",
              filters: [
                {field: "label", value: "Test", condition: EQUAL}
              ],
              sort: {field: "created_at", order: asc}
            }) {
              id
              library
              display {
                type
                size
              }
              label
              description
              color
              filters {field value condition operator}
              sort {field order}
            }
          }
        `);

        expect(resUpdateView.status).toBe(200);
        expect(resUpdateView.data.errors).toBeUndefined();
        expect(resUpdateView.data.data.saveView.color).toBe('#000000');

        // Delete view
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
