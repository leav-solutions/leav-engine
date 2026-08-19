import {initOIDCClient} from '../oidcClient';
import {type IConfig} from '../../../_types/config';
import {None, allowInsecureRequests, discovery} from 'openid-client';
import {type Mock} from 'vitest';

const discoveryMock = discovery as Mock;
const NoneMock = None as Mock;

vi.mock('openid-client', () => ({
    discovery: vi.fn(),
    // None is a factory — None() returns the ClientAuth handler
    None: vi.fn().mockReturnValue(vi.fn()),
    allowInsecureRequests: vi.fn(),
}));

describe('initOIDCClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call discovery with wellKnownEndpoint, clientId and None() for HTTPS', async () => {
        const mockConfiguration = {issuer: 'https://example.com'};
        discoveryMock.mockResolvedValueOnce(mockConfiguration);

        const config = {
            auth: {
                oidc: {
                    wellKnownEndpoint: 'https://example.com/.well-known/openid-configuration',
                    clientId: 'clientId',
                },
            },
        };

        await initOIDCClient(config as IConfig);

        expect(NoneMock).toHaveBeenCalledTimes(1);
        expect(discoveryMock).toHaveBeenCalledTimes(1);
        expect(discoveryMock).toHaveBeenCalledWith(
            new URL(config.auth.oidc.wellKnownEndpoint),
            config.auth.oidc.clientId,
            undefined,
            NoneMock.mock.results[0].value, // result of None()
            {execute: []}, // HTTPS → no allowInsecureRequests
        );
    });

    it('should include allowInsecureRequests in execute for HTTP endpoints', async () => {
        const mockConfiguration = {issuer: 'http://example.com'};
        discoveryMock.mockResolvedValueOnce(mockConfiguration);

        const config = {
            auth: {
                oidc: {
                    wellKnownEndpoint: 'http://example.com/.well-known/openid-configuration',
                    clientId: 'clientId',
                },
            },
        };

        await initOIDCClient(config as IConfig);

        expect(discoveryMock).toHaveBeenCalledWith(
            new URL(config.auth.oidc.wellKnownEndpoint),
            config.auth.oidc.clientId,
            undefined,
            NoneMock.mock.results[0].value,
            {execute: [allowInsecureRequests]},
        );
    });

    it('should return the configuration from discovery', async () => {
        const mockConfiguration = {issuer: 'https://example.com'};
        discoveryMock.mockResolvedValueOnce(mockConfiguration);

        const config = {
            auth: {
                oidc: {
                    wellKnownEndpoint: 'https://example.com/.well-known/openid-configuration',
                    clientId: 'clientId',
                },
            },
        };

        const result = await initOIDCClient(config as IConfig);

        expect(result).toBe(mockConfiguration);
    });
});
