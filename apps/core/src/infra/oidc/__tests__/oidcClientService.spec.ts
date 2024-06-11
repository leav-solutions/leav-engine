import createOIDCClientService from '../oidcClientService';
import {OidcClient} from '../oidcClient';
import {ICacheService, ICachesService, IStoreDataParams} from '../../cache/cacheService';
import {TokenSet} from 'openid-client';
import {IConfig} from '../../../_types/config';

describe('OIDCClientService', () => {
    it('Should return oidcClient instance', () => {
        const oidcClientMock = {};
        const cacheServiceMock: Mockify<ICachesService> = {
            getCache: jest.fn(() => ({}))
        };

        const oidcClientService = createOIDCClientService({
            'core.infra.oidcClient': oidcClientMock as OidcClient,
            'core.infra.cache.cacheService': cacheServiceMock as ICachesService
        });

        expect(oidcClientService.oidcClient).toBe(oidcClientMock);
    });

    it('Should store token in cache with expiration as string', async () => {
        const oidcClientMock = {};
        const cacheMock: Mockify<ICacheService> = {
            storeData: jest.fn()
        };
        const cacheServiceMock: Mockify<ICachesService> = {
            getCache: jest.fn(() => cacheMock)
        };
        const config = {
            auth: {
                refreshTokenExpiration: '1'
            }
        };
        const oidcClientService = createOIDCClientService({
            'core.infra.oidcClient': oidcClientMock as OidcClient,
            'core.infra.cache.cacheService': cacheServiceMock as ICachesService,
            config: config as IConfig
        });

        await oidcClientService.saveOIDCTokens({
            userId: 'userId',
            tokens: new TokenSet({
                access_token: 'access_token',
                refresh_token: 'refresh_token',
                expires_at: 42
            })
        });

        expect(cacheMock.storeData).toHaveBeenCalledTimes(1);
        expect(cacheMock.storeData).toHaveBeenCalledWith({
            key: 'oidc_tokens:userId',
            data: '{"access_token":"access_token","refresh_token":"refresh_token","expires_at":42}',
            expiresIn: 60_000 + Number(config.auth.refreshTokenExpiration)
        });
    });
});
