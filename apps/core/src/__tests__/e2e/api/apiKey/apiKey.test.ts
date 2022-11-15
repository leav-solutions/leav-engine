// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('ApiKeys', () => {
    let keyId: string;

    test('CRUD', async () => {
        // Create profile
        const resSaveApiKey = await makeGraphQlCall(`mutation {
            saveApiKey(apiKey: {
                label: "test key",
                expiresAt: 1234567890,
                userId: "1"
            }) {
              id
              label
              key
              expiresAt
              user {
                id
              }
            }
          }
        `);

        expect(resSaveApiKey.status).toBe(200);
        expect(resSaveApiKey.data.errors).toBeUndefined();
        expect(resSaveApiKey.data.data.saveApiKey.id).toBeTruthy();
        expect(resSaveApiKey.data.data.saveApiKey.label).toBeTruthy();
        expect(resSaveApiKey.data.data.saveApiKey.key).toBeTruthy();
        expect(resSaveApiKey.data.data.saveApiKey.expiresAt).toBeTruthy();
        expect(resSaveApiKey.data.data.saveApiKey.user.id).toBeTruthy();
        keyId = resSaveApiKey.data.data.saveApiKey.id;

        // Get view
        const resGetApiKeys = await makeGraphQlCall(`{
            apiKeys {
                list {
                    id
                    label
                    key
                    user {
                      id
                    }
                }
            }
          }`);

        expect(resGetApiKeys.status).toBe(200);
        expect(resGetApiKeys.data.errors).toBeUndefined();
        expect(resGetApiKeys.data.data.apiKeys.list.length).toBeGreaterThanOrEqual(1);
        expect(resGetApiKeys.data.data.apiKeys.list[0].id).toBeTruthy();
        expect(resGetApiKeys.data.data.apiKeys.list[0].label).toBeTruthy();
        expect(resGetApiKeys.data.data.apiKeys.list[0].key).toBe(null); // Don't send key to client after creation
        expect(resGetApiKeys.data.data.apiKeys.list[0].user.id).toBe('1'); // Don't send key to client after creation

        // Update key
        const resUpdateKey = await makeGraphQlCall(`mutation {
            saveApiKey(apiKey: {
              id: "${keyId}",
              label: "test key modified",
              userId: "2"
            }) {
              id
              label
              user {
                id
              }
            }
          }
        `);

        expect(resUpdateKey.status).toBe(200);
        expect(resUpdateKey.data.errors).toBeUndefined();
        expect(resUpdateKey.data.data.saveApiKey.label).toBe('test key modified');
        expect(resUpdateKey.data.data.saveApiKey.user.id).toBe('2');

        // Delete view
        const resDeleteKey = await makeGraphQlCall(`mutation {
            deleteApiKey(id: "${keyId}") {
                id
            }
        }`);

        expect(resDeleteKey.status).toBe(200);
        expect(resDeleteKey.data.errors).toBeUndefined();
        expect(resDeleteKey.data.data.deleteApiKey.id).toBe(keyId);
    });
});
