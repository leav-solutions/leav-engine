import {GraphQLClient} from 'graphql-request';
import {getSdk} from '../../_gqlTypes';
import {adminUserSdk, getGraphQLUrl} from '../e2eUtils';
import {adminUserId} from '../../../../_constants/users';

describe('ApiKeys', () => {
    const createSdKWithApiKey = (apiKey: string): ReturnType<typeof getSdk> =>
        getSdk(new GraphQLClient(getGraphQLUrl() + `?key=${apiKey}`, {}));

    test('CRUD', async () => {
        // Create key
        const resSaveApiKey = await adminUserSdk.SaveApiKey({
            apiKey: {
                label: 'test key',
                expiresAt: 1234567890,
                userId: '1',
            },
        });

        expect(resSaveApiKey.saveApiKey.id).toBeTruthy();
        expect(resSaveApiKey.saveApiKey.label).toBeTruthy();
        expect(resSaveApiKey.saveApiKey.key).toBeTruthy();
        expect(resSaveApiKey.saveApiKey.expiresAt).toBeTruthy();
        expect(resSaveApiKey.saveApiKey.user.id).toBeTruthy();
        expect(resSaveApiKey.saveApiKey.createdBy.id).toBe(adminUserId);
        expect(resSaveApiKey.saveApiKey.modifiedBy.id).toBe(adminUserId);
        const keyId = resSaveApiKey.saveApiKey.id;

        // Get view
        const resGetApiKeys = await adminUserSdk.GetApiKeys();

        expect(resGetApiKeys.apiKeys.list.length).toBeGreaterThanOrEqual(1);
        expect(resGetApiKeys.apiKeys.list[0].id).toBeTruthy();
        expect(resGetApiKeys.apiKeys.list[0].label).toBeTruthy();
        expect(resGetApiKeys.apiKeys.list[0].key).toBe(null); // Don't send key to client after creation
        expect(resGetApiKeys.apiKeys.list[0].user.id).toBe('1'); // Don't send key to client after creation

        // Update key
        const resUpdateKey = await adminUserSdk.SaveApiKey({
            apiKey: {
                id: keyId,
                label: 'test key modified',
                userId: '2',
            },
        });

        expect(resUpdateKey.saveApiKey.label).toBe('test key modified');
        expect(resUpdateKey.saveApiKey.user.id).toBe('2');

        // Delete view
        const resDeleteKey = await adminUserSdk.DeleteApiKey({
            id: keyId,
        });
        expect(resDeleteKey.deleteApiKey.id).toBe(keyId);
    });

    test('Authenticate with API key', async () => {
        // Create key
        const resSaveApiKey = await adminUserSdk.SaveApiKey({
            apiKey: {
                label: 'test key',
                expiresAt: null,
                userId: '1',
            },
        });

        const apiKey = resSaveApiKey.saveApiKey.key;

        const sdkWithKey = createSdKWithApiKey(apiKey);
        const resMe = await sdkWithKey.Me();
        expect(resMe.me.id).toBe('1');
    });

    test('It should fail, if using an expired key', async () => {
        // Create key
        const resSaveApiKey = await adminUserSdk.SaveApiKey({
            apiKey: {
                label: 'test key expired',
                expiresAt: 1234567890,
                userId: '1',
            },
        });

        const apiKey = resSaveApiKey.saveApiKey.key;

        const sdkWithKey = createSdKWithApiKey(apiKey);
        await expect(sdkWithKey.Me()).rejects.toThrow('API key expired');
    });
});
