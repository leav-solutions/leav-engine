// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {OidcClient} from './oidcClient';
import {generators, TokenSet} from 'openid-client';
import {ECacheType, ICachesService} from '../cache/cacheService';
import LeavError from '../../errors/LeavError';
import {ErrorTypes} from '../../_types/errors';
import AuthenticationError from '../../errors/AuthenticationError';
import {IConfig} from '../../_types/config';
import ms from 'ms';

const AUTH_REDIRECT_HEADER = 'oidc_redirect';
const TOKENS_HEADER = 'oidc_tokens';
const ONE_DAY_IN_MS = 1_000 * 60 * 60 * 24;

type AuthRedirectStoredData = [codeVerifier: string, redirectUri: string];

export interface IOIDCClientService {
    oidcClient?: OidcClient;
    getTokensFromCodes: (params: {authorizationCode: string; queryId: string}) => Promise<TokenSet>;
    getAuthorizationUrl: (params: {redirectUri: string; queryId: string}) => Promise<string>;
    getLogoutUrl: () => string;
    saveOIDCTokens: (params: {
        userId: string;
        tokens: TokenSet;
    }) => Promise<void>;
    checkTokensValidity: (params: {userId: string}) => Promise<void> | never;
}

interface IDeps {
    'core.infra.oidcClient'?: OidcClient;
    'core.infra.cache.cacheService'?: ICachesService;
    config?: IConfig;
}

export default function({
    'core.infra.oidcClient': oidcClient = null,
    'core.infra.cache.cacheService': cacheService = null,
    config = null
}: IDeps = {}): IOIDCClientService {
    const cache = cacheService?.getCache(ECacheType.RAM);
    if (cache === undefined) {
        throw new LeavError(ErrorTypes.INTERNAL_ERROR, 'Cache service not found');
    }

    const _buildCacheKey = (queryId: string) => `${AUTH_REDIRECT_HEADER}:${queryId}`;
    const _buildTokensCacheKey = (userId: string) => `${TOKENS_HEADER}:${userId}`;

    const _getCodeVerifierRedirectUriByQueryId = async (queryId: string): Promise<AuthRedirectStoredData> => {
        const cacheContent = await cache.getData([_buildCacheKey(queryId)]);
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized');
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized');
        }
        return JSON.parse(cacheContent[0]) as AuthRedirectStoredData;
    };

    const _deleteCodeVerifierRedirectUriByQueryId = (queryId: string) => cache.deleteData([_buildCacheKey(queryId)]);

    const _writeCodeVerifierRedirectUriByQueryId = async (queryId: string, data: AuthRedirectStoredData) => cache.storeData({
        key: _buildCacheKey(queryId),
        data: JSON.stringify(data),
        expiresIn: ONE_DAY_IN_MS
    });

    const _writeTokensSetByUserId = async (userId: string, tokens: TokenSet): Promise<void> => cache.storeData({
        key: _buildTokensCacheKey(userId),
        data: JSON.stringify(tokens),
        expiresIn: ms(config.auth.refreshTokenExpiration) + (1_000 * 60)
    });

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

    const _deleteTokenSetByUserId = async (userId: string) => cache.deleteData([_buildTokensCacheKey(userId)]);

    return {
        oidcClient,
        getTokensFromCodes: async ({authorizationCode, queryId}) => {
            const [codeVerifier, redirectUri] = await _getCodeVerifierRedirectUriByQueryId(queryId);
            await _deleteCodeVerifierRedirectUriByQueryId(queryId);

            return oidcClient.grant({
                code: authorizationCode,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
                client_id: oidcClient.metadata.client_id
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
        getLogoutUrl: () => oidcClient.endSessionUrl(),
        saveOIDCTokens: ({userId, tokens}) => _writeTokensSetByUserId(userId, tokens),
        checkTokensValidity: async ({userId}) => {
            const tokenSet = await _getTokenSetByUserId(userId);

            if (tokenSet.expired()) {
                await _deleteTokenSetByUserId(userId);
                const newTokenSet = await oidcClient.refresh(tokenSet);
                await _writeTokensSetByUserId(userId, newTokenSet);
            }
        }
    };
}
