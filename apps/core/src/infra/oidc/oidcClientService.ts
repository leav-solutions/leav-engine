// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {OidcClient} from './oidcClient';
import {generators, TokenSet} from 'openid-client';

export interface IOIDCClientService {
    oidcClient?: OidcClient;
    getTokensFromCodes: (params: {authorizationCode: string; queryId: string}) => Promise<TokenSet>;
    getAuthorizationUrl: (params: {redirectUri: string; queryId: string}) => string;
}

interface IDeps {
    'core.infra.oidcClient'?: OidcClient;
}

export default function ({'core.infra.oidcClient': oidcClient = null}: IDeps = {}): IOIDCClientService {
    const mapCodeVerifierRedirectUriByQueryId = new Map<string, [codeVerifier: string, redirectUri: string]>();
    return {
        oidcClient,
        getTokensFromCodes: ({authorizationCode, queryId}) => {
            const [codeVerifier, redirectUri] = mapCodeVerifierRedirectUriByQueryId.get(queryId);
            mapCodeVerifierRedirectUriByQueryId.delete(queryId);

            return oidcClient.grant({
                code: authorizationCode,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
                client_id: oidcClient.metadata.client_id
            });
        },
        getAuthorizationUrl: ({redirectUri, queryId}) => {
            const codeVerifier = generators.codeVerifier();
            mapCodeVerifierRedirectUriByQueryId.set(queryId, [codeVerifier, redirectUri]);

            return oidcClient.authorizationUrl({
                redirect_uri: redirectUri,
                response_type: 'code',
                scope: 'openid',
                code_challenge: generators.codeChallenge(codeVerifier),
                code_challenge_method: 'S256'
            });
        }
    };
}
