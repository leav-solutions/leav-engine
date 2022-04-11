// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('Applications', () => {
    test('Create application', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "test_app",
                    label: {fr: "Test app"},
                    endpoint: "my-app",
                    component: "explorer"
                }) {
                    id
                    label
                    endpoint
                    component
                    permissions {
                        access_application
                    }
                }
            }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.saveApplication.id).toBe('test_app');
        expect(res.data.data.saveApplication.component).toBe('explorer');
        expect(res.data.data.saveApplication.permissions.access_application).toBeDefined();

        // Check if new app is in applications list
        const appsRes = await makeGraphQlCall('{ applications { list { id permissions {access_application}} } }');

        expect(appsRes.status).toBe(200);
        expect(appsRes.data.errors).toBeUndefined();

        expect(appsRes.data.data.applications.list.filter(app => app.id === 'test_app').length).toBe(1);
        expect(appsRes.data.data.applications.list[0].permissions.access_application).toBeDefined();
    });

    test('Get applications list', async () => {
        const res = await makeGraphQlCall('{ applications { list { id } } }');

        expect(res.status).toBe(200);
        expect(res.data.data.applications.list.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get application by ID', async () => {
        const res = await makeGraphQlCall('{applications(filters: {id: "test_app"}) { list { id } }}');

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.applications.list.length).toBe(1);
    });

    test('Delete an application', async () => {
        const res = await makeGraphQlCall('mutation {deleteApplication(id: "test_app") { id }}');

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.deleteApplication).toBeDefined();
        expect(res.data.data.deleteApplication.id).toBe('test_app');
    });
});
