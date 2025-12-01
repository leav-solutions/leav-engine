// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {e2eAdminUser, e2eNonAdminUser, makeGraphQlCall} from '../e2eUtils';

describe('ApiKeyAdminPermissions', () => {
    let apiKeyId: string;

    const gqlCreateQuery = `mutation {
            saveApiKey(apiKey: {
                label: "API Key test label",
                expiresAt: 1234567890,
                userId: "1"
            }) {
                id
                label
                expiresAt
                user {
                    id
                }
            }
        }`;

    const gqlEditQuery = (id: string) => `mutation {
            saveApiKey(apiKey: {
                id: "${id}",
                label: "Label edited",
                userId: "1"
            }) {
                id
                label
                user {
                    id
                }
            }
        }`;

    const gqlDeleteQuery = (id: string) => `mutation { deleteApiKey(id: "${id}") { id } }`;

    beforeAll(async () => {
        const res = await makeGraphQlCall(gqlCreateQuery);

        expect(res.status).toBe(200);
        expect(res.data.data.saveApiKey.id).toBeTruthy();
        expect(res.data.data.saveApiKey.label).toBe('API Key test label');
        expect(res.data.data.saveApiKey.expiresAt).toBe(1234567890);
        expect(res.data.data.saveApiKey.user.id).toBe('1');

        apiKeyId = res.data.data.saveApiKey.id;
    });

    describe('create apiKey', () => {
        it('Should not be authorized to create a new apiKey', async () => {
            await expect(makeGraphQlCall(gqlCreateQuery, {user: e2eNonAdminUser()})).rejects.toThrow(
                /Action forbidden/,
            );
        });

        it('Should be authorized to create an apiKey', async () => {
            const res = await makeGraphQlCall(gqlCreateQuery, {user: e2eAdminUser()});

            expect(res.data.data.saveApiKey).toBeDefined();
            expect(res.data.data.saveApiKey.id).toBeTruthy();
            expect(res.data.data.saveApiKey.label).toBe('API Key test label');
            expect(res.data.data.saveApiKey.user.id).toBe('1');
        });
    });

    describe('edit apiKey', () => {
        it('Should not be authorized to edit an apiKey', async () => {
            await expect(makeGraphQlCall(gqlEditQuery(apiKeyId), {user: e2eNonAdminUser()})).rejects.toThrow(
                /Action forbidden/,
            );
        });

        it('Should be authorized to edit an apiKey', async () => {
            const res = await makeGraphQlCall(gqlEditQuery(apiKeyId), {user: e2eAdminUser()});

            expect(res.data.data.saveApiKey).toBeDefined();
            expect(res.data.data.saveApiKey.id).toBe(apiKeyId);
            expect(res.data.data.saveApiKey.label).toBe('Label edited');
        });
    });

    describe('delete apiKey', () => {
        it('Should not be authorized to delete an apiKey', async () => {
            await expect(makeGraphQlCall(gqlDeleteQuery(apiKeyId), {user: e2eNonAdminUser()})).rejects.toThrow(
                /Action forbidden/,
            );
        });

        it('Should be authorized to delete an apiKey', async () => {
            const res = await makeGraphQlCall(gqlDeleteQuery(apiKeyId), {user: e2eAdminUser()});

            expect(res.data.data.deleteApiKey).toBeDefined();
            expect(res.data.data.deleteApiKey.id).toBe(apiKeyId);
        });
    });
});
