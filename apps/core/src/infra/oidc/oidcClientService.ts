// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {OidcClient} from './oidcClient';
import {EndSessionParameters, generators, TokenSet} from 'openid-client';
import {ECacheType, ICachesService} from '../cache/cacheService';
import LeavError from '../../errors/LeavError';
import {ErrorTypes} from '../../_types/errors';
import AuthenticationError from '../../errors/AuthenticationError';
import {IConfig} from '../../_types/config';
import ms from 'ms';

const AUTH_VERIFICATION_KEYS_HEADER = 'oidc_verificationKeys';
const ORIGINAL_URL_HEADER = 'oidc_originalUrl';
const TOKENS_HEADER = 'oidc_tokens';
const MAX_TIME_OIDC_SERVICE_ALLOW_AUTH_IN_MS = 1_000 * 60 * 10;

type AuthRedirectStoredData = [codeVerifier: string, redirectUri: string];

export interface IOIDCClientService {
    oidcClient?: OidcClient;
    getTokensFromCodes: (params: {authorizationCode: string; queryId: string}) => Promise<TokenSet>;
    getAuthorizationUrl: (params: {redirectUri: string; queryId: string}) => Promise<string>;
    getLogoutUrl: (params: {userId: string}) => Promise<string>;
    saveOIDCTokens: (params: {userId: string; tokens: TokenSet}) => Promise<void>;
    checkTokensValidity: (params: {userId: string}) => Promise<void> | never;
    saveOriginalUrl: (params: {originalUrl: string; queryId: string}) => Promise<void>;
    getOriginalUrl: (queryId: string) => Promise<string>;
}

interface IDeps {
    'core.infra.oidcClient'?: OidcClient;
    'core.infra.cache.cacheService'?: ICachesService;
    config?: IConfig;
}

export default function ({
    'core.infra.oidcClient': oidcClient = null,
    'core.infra.cache.cacheService': cacheService = null,
    config = null
}: IDeps = {}): IOIDCClientService {
    const cache = cacheService?.getCache(ECacheType.RAM);
    if (cache === undefined) {
        throw new LeavError(ErrorTypes.INTERNAL_ERROR, 'Cache service not found');
    }

    const _buildAuthVerificationKeysCacheKey = (queryId: string) => `${AUTH_VERIFICATION_KEYS_HEADER}:${queryId}`;
    const _buildOriginalUrlCacheKey = (queryId: string) => `${ORIGINAL_URL_HEADER}:${queryId}`;
    const _buildTokensCacheKey = (userId: string) => `${TOKENS_HEADER}:${userId}`;

    const _getCodeVerifierRedirectUriByQueryId = async (queryId: string): Promise<AuthRedirectStoredData> => {
        const cacheContent = await cache.getData([_buildAuthVerificationKeysCacheKey(queryId)]);
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized');
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized');
        }
        return JSON.parse(cacheContent[0]) as AuthRedirectStoredData;
    };

    const _writeCodeVerifierRedirectUriByQueryId = async (queryId: string, data: AuthRedirectStoredData) =>
        cache.storeData({
            key: _buildAuthVerificationKeysCacheKey(queryId),
            data: JSON.stringify(data),
            expiresIn: MAX_TIME_OIDC_SERVICE_ALLOW_AUTH_IN_MS
        });

    const _deleteCodeVerifierRedirectUriByQueryId = (queryId: string) =>
        cache.deleteData([_buildAuthVerificationKeysCacheKey(queryId)]);

    const _getTokenSetByUserId = async (userId: string): Promise<TokenSet> => {
        const cacheContent = await cache.getData([_buildTokensCacheKey(userId)]);
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized');
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized');
        }
        return new TokenSet(JSON.parse(cacheContent[0]));
    };

    const _writeTokensSetByUserId = async (userId: string, tokens: TokenSet): Promise<void> =>
        cache.storeData({
            key: _buildTokensCacheKey(userId),
            data: JSON.stringify(tokens),
            expiresIn: ms(config.auth.refreshTokenExpiration) + 1_000 * 60
        });

    const _deleteTokenSetByUserId = async (userId: string) => cache.deleteData([_buildTokensCacheKey(userId)]);

    const _writeOriginalUrlByQueryId = (queryId: string, originalUrl: string) =>
        cache.storeData({
            key: _buildOriginalUrlCacheKey(queryId),
            data: originalUrl,
            expiresIn: MAX_TIME_OIDC_SERVICE_ALLOW_AUTH_IN_MS
        });

    const _getOriginalUrlByQueryId = async (queryId: string) => {
        const cacheContent = await cache.getData([_buildOriginalUrlCacheKey(queryId)]);
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized');
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized');
        }
        return cacheContent[0];
    };

    const _deleteOriginalUrlByQueryId = (queryId: string) => cache.deleteData([_buildOriginalUrlCacheKey(queryId)]);

    return {
        oidcClient,
        getTokensFromCodes: async ({authorizationCode, queryId}) => {
            const [codeVerifier, redirectUri] = await _getCodeVerifierRedirectUriByQueryId(queryId);
            _deleteCodeVerifierRedirectUriByQueryId(queryId);

            return oidcClient.grant({
                grant_type: 'authorization_code',
                code: authorizationCode,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri
            });
        },
        getAuthorizationUrl: async ({redirectUri, queryId}) => {
            const codeVerifier = generators.codeVerifier();
            await _writeCodeVerifierRedirectUriByQueryId(queryId, [codeVerifier, redirectUri]);

            return oidcClient.authorizationUrl({
                redirect_uri: redirectUri,
                response_type: 'code',
                scope: 'openid',
                code_challenge: generators.codeChallenge(codeVerifier),
                code_challenge_method: 'S256'
            });
        },
        getLogoutUrl: async ({userId}) => {
            const payload: EndSessionParameters = {
                post_logout_redirect_uri: config.auth.oidc.postLogoutRedirectUri
            };

            if (config.auth.oidc.skipLogoutConfirmationPage) {
                payload.id_token_hint = await _getTokenSetByUserId(userId);
            }

            return oidcClient.endSessionUrl(payload);
        },
        saveOIDCTokens: ({userId, tokens}) => _writeTokensSetByUserId(userId, tokens),
        checkTokensValidity: async ({userId}) => {
            const tokenSet = await _getTokenSetByUserId(userId);

            if (tokenSet.expired()) {
                _deleteTokenSetByUserId(userId);
                const newTokenSet = await oidcClient.refresh(tokenSet);
                await _writeTokensSetByUserId(userId, newTokenSet);
            }
        },
        saveOriginalUrl: ({originalUrl, queryId}) => _writeOriginalUrlByQueryId(queryId, originalUrl),
        getOriginalUrl: async queryId => {
            const originalUrl = _getOriginalUrlByQueryId(queryId);
            _deleteOriginalUrlByQueryId(queryId);
            return originalUrl;
        }
    };
}
