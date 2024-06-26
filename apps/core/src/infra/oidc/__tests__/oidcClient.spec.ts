// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {initOIDCClient} from '../oidcClient';
import {IConfig} from '../../../_types/config';
import {Issuer} from 'openid-client';

const clientMock = jest.fn();

class ClientClassMock {
    constructor(...args) {
        clientMock(...args);
    }
}

jest.mock('openid-client', () => ({
    Issuer: {
        discover: jest.fn(() => ({
            Client: ClientClassMock
        }))
    }
}));

describe('initOIDCClient', () => {
    const discoverMock = Issuer.discover as jest.Mock;
    beforeEach(() => {
        discoverMock.mockClear();
        clientMock.mockClear();
    });

    it('should discover wellKnownEndpoint', async () => {
        const config = {
            auth: {
                oidc: {
                    wellKnownEndpoint: 'wellKnownEndpoint'
                }
            }
        };

        await initOIDCClient(config as IConfig);

        expect(discoverMock).toHaveBeenCalledTimes(1);
        expect(discoverMock).toHaveBeenCalledWith(config.auth.oidc.wellKnownEndpoint);
    });

    it('should return a new client', async () => {
        const config = {
            auth: {
                oidc: {
                    wellKnownEndpoint: 'wellKnownEndpoint',
                    clientId: 'clientId'
                }
            }
        };
        clientMock.mockResolvedValueOnce('client');

        const clientResult = await initOIDCClient(config as IConfig);

        expect(clientMock).toHaveBeenCalledTimes(1);
        expect(clientMock).toHaveBeenCalledWith({
            client_id: config.auth.oidc.clientId,
            token_endpoint_auth_method: 'none'
        });
        expect(clientResult).toBeInstanceOf(ClientClassMock);
    });
});
