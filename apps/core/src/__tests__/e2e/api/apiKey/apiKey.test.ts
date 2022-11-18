// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import {getGraphQLUrl, makeGraphQlCall} from '../e2eUtils';

describe('ApiKeys', () => {
    test('CRUD', async () => {
        // Create key
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
        const keyId = resSaveApiKey.data.data.saveApiKey.id;

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

    test('Authenticate with API key', async () => {
        // Create key
        const resSaveApiKey = await makeGraphQlCall(`mutation {
            saveApiKey(apiKey: {
                label: "test key",
                expiresAt: null,
                userId: "1"
            }) {
                id
                key
            }
        }`);

        const apiKey = resSaveApiKey.data.data.saveApiKey.key;

        // Make a query using the key
        const url = await getGraphQLUrl();
        const urlWithKey = `${url}?key=${apiKey}`;

        const query = `{
            me {
                id
            }
        }`;

        const data = {query};

        let res;
        try {
            res = await axios.post(urlWithKey, data);
        } catch (e) {
            console.error(e);
            console.trace();
        }

        expect(res.data.data.me.id).toBe('1');
    });

    test('It should fail, if using an expired key', async () => {
        // Create key
        const resSaveApiKey = await makeGraphQlCall(`mutation {
            saveApiKey(apiKey: {
                label: "test key expired",
                expiresAt: 1234567890,
                userId: "1"
            }) {
                id
                key
            }
        }`);

        const apiKey = resSaveApiKey.data.data.saveApiKey.key;

        // Make a query using the key
        const url = await getGraphQLUrl();
        const urlWithKey = `${url}?key=${apiKey}`;

        const query = `{
            me {
                id
            }
        }`;

        const data = {query};

        expect(() => axios.post(urlWithKey, data)).rejects.toThrow();
    });
});
