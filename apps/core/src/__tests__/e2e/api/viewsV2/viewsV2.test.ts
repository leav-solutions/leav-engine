// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {adminUserSdk, e2eGuestUser, makeGraphQlCall} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';
import {ViewV2Sizes, ViewV2Types} from '../../../../_types/viewsV2';

describe('ViewsV2', () => {
    const testLibName = 'test_views_v2_lib';
    let viewId: string;

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: testLibName, label: {en: 'Test Lib'}}});
    });

    describe('CRUD operations', () => {
        test('Create viewV2', async () => {
            const resSaveView = await makeGraphQlCall(`mutation {
                saveViewV2(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewV2Types.LIST}, size: ${ViewV2Sizes.MEDIUM}},
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

            viewId = resSaveView.data.data.saveViewV2.id;

            expect(resSaveView.status).toBe(200);
            expect(resSaveView.data.errors).toBeUndefined();
            expect(viewId).toBeTruthy();
        });

        test('Get viewsV2', async () => {
            const resGetViews = await makeGraphQlCall(`{
                viewsV2(library: "${testLibName}") {
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
            expect(resGetViews.data.data.viewsV2.list.length).toBeGreaterThanOrEqual(1);
            expect(resGetViews.data.data.viewsV2.list[0].created_by.whoAmI.id).toBeTruthy();
        });

        test('Update viewV2', async () => {
            const resUpdateView = await makeGraphQlCall(`mutation {
                updateViewV2(view: {
                  id: "${viewId}",
                  display: {type: ${ViewV2Types.LIST}},
                }) {
                  id
                  display {
                    type
                  }
                }
            }`);

            expect(resUpdateView.status).toBe(200);
            expect(resUpdateView.data.errors).toBeUndefined();
            expect(resUpdateView.data.data.updateViewV2.id).toBe(viewId);
        });

        test('Delete viewV2', async () => {
            const resDeleteView = await makeGraphQlCall(`mutation {
                deleteViewV2(viewId: "${viewId}") {
                    id
                }
            }`);

            expect(resDeleteView.status).toBe(200);
            expect(resDeleteView.data.errors).toBeUndefined();
            expect(resDeleteView.data.data.deleteViewV2.id).toBe(viewId);
        });
    });

    describe('Permissions', () => {
        describe('Private viewsV2', () => {
            it('Should not be able to edit viewsV2 owned by other users', async () => {
                const resSaveView = await makeGraphQlCall(`mutation {
                saveViewV2(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewV2Types.LIST}, size: ${ViewV2Sizes.MEDIUM}},
                  shared: false,
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

                const savedViewId = resSaveView.data.data.saveViewV2.id;

                const mutationUpdateView = `mutation {
                updateViewV2(view: {
                  id: "${savedViewId}",
                  display: {type: ${ViewV2Types.LIST}},
                }) {
                  id
                  display {
                    type
                  }
                }
            }`;

                await expect(makeGraphQlCall(mutationUpdateView, {user: e2eGuestUser()})).rejects.toThrow(
                    /USER_IS_NOT_VIEW_OWNER/,
                );
            });

            it('Should not be able to delete viewsV2 owned by other users', async () => {
                const resSaveView = await makeGraphQlCall(`mutation {
                saveViewV2(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewV2Types.LIST}, size: ${ViewV2Sizes.MEDIUM}},
                  shared: false,
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

                const savedViewId = resSaveView.data.data.saveViewV2.id;

                const mutationDeleteView = `mutation {
                deleteViewV2(viewId: "${savedViewId}") {
                  id
                }
            }`;

                await expect(makeGraphQlCall(mutationDeleteView, {user: e2eGuestUser()})).rejects.toThrow(
                    /USER_IS_NOT_VIEW_OWNER/,
                );
            });
        });

        describe('Shared viewsV2', () => {
            it('Should not be able to edit shared viewsV2 owned by other users', async () => {
                const resSaveView = await makeGraphQlCall(`mutation {
                saveViewV2(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewV2Types.LIST}, size: ${ViewV2Sizes.MEDIUM}},
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

                const savedViewId = resSaveView.data.data.saveViewV2.id;

                const mutationUpdateView = `mutation {
                updateViewV2(view: {
                  id: "${savedViewId}",
                  display: {type: ${ViewV2Types.LIST}},
                }) {
                  id
                  display {
                    type
                  }
                }
            }`;

                await expect(makeGraphQlCall(mutationUpdateView, {user: e2eGuestUser()})).rejects.toThrow(
                    /USER_IS_NOT_VIEW_OWNER/,
                );
            });

            it('Should not be able to delete shared viewsV2 owned by other users', async () => {
                const resSaveView = await makeGraphQlCall(`mutation {
                saveViewV2(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewV2Types.LIST}, size: ${ViewV2Sizes.MEDIUM}},
                  shared: false,
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

                const savedViewId = resSaveView.data.data.saveViewV2.id;

                const mutationDeleteView = `mutation {
                deleteViewV2(viewId: "${savedViewId}") {
                  id
                }
            }`;

                await expect(makeGraphQlCall(mutationDeleteView, {user: e2eGuestUser()})).rejects.toThrow(
                    /USER_IS_NOT_VIEW_OWNER/,
                );
            });
        });
    });
});
