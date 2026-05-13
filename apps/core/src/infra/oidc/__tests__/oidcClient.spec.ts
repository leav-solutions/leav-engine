import {initOIDCClient} from '../oidcClient';
import {type IConfig} from '../../../_types/config';
import {Issuer} from 'openid-client';
import {type Mock} from 'vitest';

const clientMock = vi.fn();

class ClientClassMock {
    public constructor(...args: any) {
        clientMock(...args);
    }
}

vi.mock('openid-client', () => ({
    Issuer: {
        discover: vi.fn(() => ({
            Client: ClientClassMock,
        })),
    },
}));

describe('initOIDCClient', () => {
    const discoverMock = Issuer.discover as Mock;
    beforeEach(() => {
        discoverMock.mockClear();
        clientMock.mockClear();
    });

    it('should discover wellKnownEndpoint', async () => {
        const config = {
            auth: {
                oidc: {
                    wellKnownEndpoint: 'wellKnownEndpoint',
                },
            },
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
                    clientId: 'clientId',
                },
            },
        };
        clientMock.mockResolvedValueOnce('client');

        const clientResult = await initOIDCClient(config as IConfig);

        expect(clientMock).toHaveBeenCalledTimes(1);
        expect(clientMock).toHaveBeenCalledWith({
            client_id: config.auth.oidc.clientId,
            token_endpoint_auth_method: 'none',
        });
        expect(clientResult).toBeInstanceOf(ClientClassMock);
    });
});
