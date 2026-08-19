import {type Configuration, None, allowInsecureRequests, discovery} from 'openid-client';
import {type IConfig} from '../../_types/config';

export type OidcClient = Configuration;

// None = public client without secret, no authentication at the token endpoint
// https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication
export const initOIDCClient = async (config: IConfig): Promise<OidcClient> => {
    const issuerUrl = new URL(config.auth.oidc.wellKnownEndpoint);
    // allowInsecureRequests is needed for local HTTP endpoints (dev/test environments)
    const execute = issuerUrl.protocol === 'http:' ? [allowInsecureRequests] : [];
    return discovery(issuerUrl, config.auth.oidc.clientId, undefined, None(), {execute});
};
