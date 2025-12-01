// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {e2eAdminUser, e2eGuestUser, makeGraphQlCall} from '../e2eUtils';

describe('ApplicationsAdminPermissions', () => {
    const applicationId = 'applications_admin_permissions_application_id';

    beforeAll(async () => {
        const res = await makeGraphQlCall(`mutation {
            saveApplication(application: {id: "${applicationId}", label: {en: "Application test label"}, endpoint: "app-endpoint"}) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveApplication.id).toBe(applicationId);
    });

    describe('create application', () => {
        it('Should not be authorized to create an application', async () => {
            const gqlMutation = `mutation {
                saveApplication(application: {id: "applications_admin_permissions_new_application_id", label: {en: "New application"}, endpoint: "app-endpoint"}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to create an application', async () => {
            const gqlMutation = `mutation {
                saveApplication(application: {id: "applications_admin_permissions_new_application_id_from_admin", label: {en: "New application from admin"}, endpoint: "app-endpoint"}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('edit application', () => {
        it('Should not be authorized to edit an application', async () => {
            const gqlMutation = `mutation {
                saveApplication(application: {id: "${applicationId}", label: {en: "new label"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to edit an application', async () => {
            const gqlMutation = `mutation {
                saveApplication(application: {id: "${applicationId}", label: {en: "new label from admin"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('delete application', () => {
        it('Should not be authorized to delete an application', async () => {
            const gqlMutation = `mutation { deleteApplication(id: "${applicationId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to delete an application', async () => {
            const gqlMutation = `mutation { deleteApplication(id: "${applicationId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });
});
