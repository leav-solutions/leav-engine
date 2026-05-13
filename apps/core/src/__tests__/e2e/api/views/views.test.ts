import {adminUserSdk, e2eGuestUser, makeGraphQlCall} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';
import {ViewSizes, ViewTypes} from '../../../../_types/views';

describe('Views', () => {
    const testLibName = 'test_views_lib';
    let viewId: string;

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: testLibName, label: {en: 'Test Lib'}}});
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

    describe('Permissions', () => {
        describe('Private views', () => {
            it('Should not be able to edit views owned by other users', async () => {
                const resSaveView = await makeGraphQlCall(`mutation {
                saveView(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewTypes.LIST}, size: ${ViewSizes.MEDIUM}},
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

                const savedViewId = resSaveView.data.data.saveView.id;

                const mutationUpdateView = `mutation {
                updateView(view: {
                  id: "${savedViewId}",
                  display: {type: ${ViewTypes.LIST}},
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

            it('Should not be able to delete views owned by other users', async () => {
                const resSaveView = await makeGraphQlCall(`mutation {
                saveView(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewTypes.LIST}, size: ${ViewSizes.MEDIUM}},
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

                const savedViewId = resSaveView.data.data.saveView.id;

                const mutationDeleteView = `mutation {
                deleteView(viewId: "${savedViewId}") {
                  id
                }
            }`;

                await expect(makeGraphQlCall(mutationDeleteView, {user: e2eGuestUser()})).rejects.toThrow(
                    /USER_IS_NOT_VIEW_OWNER/,
                );
            });
        });

        describe('Shared views', () => {
            it('Should not be able to edit shared views owned by other users', async () => {
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

                const savedViewId = resSaveView.data.data.saveView.id;

                const mutationUpdateView = `mutation {
                updateView(view: {
                  id: "${savedViewId}",
                  display: {type: ${ViewTypes.LIST}},
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

            it('Should not be able to delete shared views owned by other users', async () => {
                const resSaveView = await makeGraphQlCall(`mutation {
                saveView(view: {
                  library: "${testLibName}",
                  display: {type: ${ViewTypes.LIST}, size: ${ViewSizes.MEDIUM}},
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

                const savedViewId = resSaveView.data.data.saveView.id;

                const mutationDeleteView = `mutation {
                deleteView(viewId: "${savedViewId}") {
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
