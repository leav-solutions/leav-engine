// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {e2eAdminUser, e2eGuestUser, makeGraphQlCall} from '../../e2eUtils';

describe('FormsAdminPermissions', () => {
    const formId = 'forms_admin_permissions_form_id';
    const libraryId = 'forms_admin_permissions_library_id';

    beforeAll(async () => {
        const resSaveLibrary = await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${libraryId}", label: {en: "Library test label"}}) {
                id
            }
        }`);

        expect(resSaveLibrary.status).toBe(200);
        expect(resSaveLibrary.data.data.saveLibrary.id).toBe(libraryId);

        const resSaveForm = await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formId}"
                    library: "${libraryId}"
                }
            ) { id }
        }`);

        expect(resSaveForm.status).toBe(200);
        expect(resSaveForm.data.data.saveForm.id).toBe(formId);
    });

    describe('create form', () => {
        it('Should not be authorized to create a form', async () => {
            const gqlMutation = `mutation {
                saveForm(
                    form: {
                        id: "forms_admin_permissions_new_form_id"
                        library: "${libraryId}"
                    }
                ) { id }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to create a form', async () => {
            const gqlMutation = `mutation {
                 saveForm(
                    form: {
                        id: "forms_admin_permissions_new_form_id"
                        library: "${libraryId}"
                    }
                 ) { id }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('edit form', () => {
        it('Should not be authorized to edit a form', async () => {
            const gqlMutation = `mutation {
               saveForm(
                    form: {
                        id: "${formId}"
                        library: "${libraryId}",
                        label: {en: "new label"}
                    }
                 ) { id }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to edit a form', async () => {
            const gqlMutation = `mutation {
                saveForm(
                    form: {
                        id: "${formId}"
                        library: "${libraryId}",
                        label: {en: "new label"}
                    }
                 ) { id }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('delete form', () => {
        it('Should not be authorized to delete a form', async () => {
            const gqlMutation = `mutation { deleteForm(library: "${libraryId}", id: "${formId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to delete a form', async () => {
            const gqlMutation = `mutation { deleteForm(library: "${libraryId}", id: "${formId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });
});
