// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {e2eAdminUser, e2eGuestUser, makeGraphQlCall} from '../../e2eUtils';

describe('LibrariesAdminPermissions', () => {
    const libraryId = 'libraries_admin_permissions_library_id';

    beforeAll(async () => {
        const res = await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${libraryId}", label: {en: "Library test label"}}) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveLibrary.id).toBe(libraryId);
    });

    describe('create library', () => {
        it('Should not be authorized to create a library', async () => {
            const gqlMutation = `mutation {
                saveLibrary(library: {id: "libraries_admin_permissions_new_library_id", label: {en: "New library"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to create a library', async () => {
            const gqlMutation = `mutation {
                saveLibrary(library: {id: "libraries_admin_permissions_new_library_id_from_admin", label: {en: "New library from admin"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('edit library', () => {
        it('Should not be authorized to edit a library', async () => {
            const gqlMutation = `mutation {
                saveLibrary(library: {id: "${libraryId}", label: {en: "new label"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to edit a library', async () => {
            const gqlMutation = `mutation {
                saveLibrary(library: {id: "${libraryId}", label: {en: "new label from admin"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('delete library', () => {
        it('Should not be authorized to delete a library', async () => {
            const gqlMutation = `mutation { deleteLibrary(id: "${libraryId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to delete a library', async () => {
            const gqlMutation = `mutation { deleteLibrary(id: "${libraryId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });
});
