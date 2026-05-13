import {e2eAdminUser, e2eGuestUser, makeGraphQlCall} from '../../e2eUtils';
import {AttributeFormats, AttributeTypes} from '../../../../../_types/attribute';

describe('AttributesAdminPermissions', () => {
    const createAttributeId = 'admin_attribute_permissions_test_create';
    const editAttributeId = 'admin_attribute_permissions_test_edit';
    const deleteAttributeId = 'admin_attribute_permissions_test_delete';

    const makeCreateQuery = (id: string) => `mutation {
            saveAttribute(attribute: {id: "${id}", format: ${AttributeFormats.TEXT},type: ${AttributeTypes.SIMPLE},label: {en: "Attribute test label"}}) {
                id
            }
        }`;

    const makeEditQuery = (id: string) => `mutation {
            saveAttribute(attribute: {id: "${id}",label: {en: "Label edited"}}) {
                id
            }
        }`;

    const makeDeleteQuery = (id: string) => `mutation { deleteAttribute(id: "${id}") { id } }`;

    describe('create attribute', () => {
        afterEach(async () => {
            // Clean up: delete the attribute if it exists
            try {
                await makeGraphQlCall(makeDeleteQuery(createAttributeId), {user: e2eAdminUser()});
            } catch (e) {
                // Ignore errors if attribute doesn't exist
            }
        });

        it('Should not be authorized to create a new attribute', async () => {
            await expect(makeGraphQlCall(makeCreateQuery(createAttributeId), {user: e2eGuestUser()})).rejects.toThrow(
                /Action forbidden/,
            );
        });

        it('Should be authorized to create a attribute', async () => {
            await expect(
                makeGraphQlCall(makeCreateQuery(createAttributeId), {user: e2eAdminUser()}),
            ).resolves.toBeDefined();
        });
    });

    describe('edit attribute', () => {
        beforeEach(async () => {
            // Ensure attribute exists before editing
            await makeGraphQlCall(makeCreateQuery(editAttributeId), {user: e2eAdminUser()});
        });

        afterEach(async () => {
            // Clean up: delete the attribute
            await makeGraphQlCall(makeDeleteQuery(editAttributeId), {user: e2eAdminUser()});
        });

        it('Should not be authorized to edit a attribute', async () => {
            await expect(makeGraphQlCall(makeEditQuery(editAttributeId), {user: e2eGuestUser()})).rejects.toThrow(
                /Action forbidden/,
            );
        });

        it('Should be authorized to edit a attribute', async () => {
            await expect(
                makeGraphQlCall(makeEditQuery(editAttributeId), {user: e2eAdminUser()}),
            ).resolves.toBeDefined();
        });
    });

    describe('delete attribute', () => {
        beforeEach(async () => {
            // Ensure attribute exists before deleting
            await makeGraphQlCall(makeCreateQuery(deleteAttributeId), {user: e2eAdminUser()});
        });

        afterEach(async () => {
            // Clean up: try to delete if it still exists
            try {
                await makeGraphQlCall(makeDeleteQuery(deleteAttributeId), {user: e2eAdminUser()});
            } catch (e) {
                // Ignore errors if attribute was already deleted
            }
        });

        it('Should not be authorized to delete a attribute', async () => {
            await expect(makeGraphQlCall(makeDeleteQuery(deleteAttributeId), {user: e2eGuestUser()})).rejects.toThrow(
                /Action forbidden/,
            );
        });

        it('Should be authorized to delete a attribute', async () => {
            await expect(
                makeGraphQlCall(makeDeleteQuery(deleteAttributeId), {user: e2eAdminUser()}),
            ).resolves.toBeDefined();
        });
    });
});
