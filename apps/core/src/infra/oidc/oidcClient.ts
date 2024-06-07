// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {BaseClient, Issuer} from 'openid-client';
import {IConfig} from '../../_types/config';

export type OidcClient = BaseClient;

export const initOIDCClient = async (config: IConfig): Promise<OidcClient> => {
    const oidcIssuer = await Issuer.discover(config.auth.oidc.wellKnownEndpoint);

    return new oidcIssuer.Client({
        client_id: config.auth.oidc.clientId,
        token_endpoint_auth_method: 'none' // see doc here https://backstage.forgerock.com/docs/am/7/oidc1-guide/oidc-client-auth.html
    });
};
