// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import validateRequestTokenHelper from './validateRequestToken';
import createAuthApp, {IAuthApp} from '../auth/authApp';
import initQueryContext from './initQueryContext';
import {Mockify} from '@leav/utils';
import {IConfig} from '../../_types/config';
import {DeepPartial} from '../../_types/utils';
import {IRequestWithContext} from '../../_types/express';
import {Response} from 'express';
import {API_KEY_PARAM_NAME} from '../../_types/auth';
import jwt from 'jsonwebtoken';
import {IRecordDomain} from '../../domain/record/recordDomain';
import {IValueDomain} from '../../domain/value/valueDomain';
import {ICacheService, ICachesService} from '../../infra/cache/cacheService';

describe('validateRequestToken', () => {
    const invalidAccessToken = 'invalid_access_token';
    const validAccessTokenWithoutUserId =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cHNJZCI6WyIxIl0sImlhdCI6MjgyNDc0ODM1MSwiZXhwIjoyODI0NzQ5MjUxfQ.tWTXkdQOoJ79gHi-Yo_ugVoqbmyEGVUK2HYPLhVfvh0';
    const invalidRefreshToken = 'invalid_refresh_token';
    const validRefreshTokenWithoutUserId =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cHNJZCI6WyIxIl0sImlhdCI6MjgyNDc0ODM1MSwiZXhwIjoyODI0NzQ5MjUxfQ.tWTXkdQOoJ79gHi-Yo_ugVoqbmyEGVUK2HYPLhVfvh0';
    const validRefreshToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZ3JvdXBzSWQiOlsiMSJdLCJpYXQiOjI4MjQ3NDgzNTEsImV4cCI6MjgyNDc0OTI1MX0.tdSeq1n1__zQk6Q64t8AsMj8CRCQsNeu7HF8cpMWxDM';

    const mockConfig: DeepPartial<IConfig> = {
        auth: {
            key: 'key',
            cookie: {
                sameSite: 'lax',
                secure: false
            },
            oidc: {enable: false},
            algorithm: 'HS256',
            tokenExpiration: '15m',
            refreshTokenExpiration: '2h'
        },
        lang: {
            default: 'en'
        }
    };

    const mockRecordDomain: Mockify<IRecordDomain> = {
        find: global.__mockPromise({
            cursor: {},
            totalCount: 1,
            list: [{id: '1'}]
        })
    };

    const mockCacheService: Mockify<ICacheService> = {
        getData: global.__mockPromise(['id']),
        storeData: global.__mockPromise(),
        deleteData: global.__mockPromise()
    };

    const mockCachesService: Mockify<ICachesService> = {
        getCache: jest.fn().mockReturnValue(mockCacheService)
    };

    const mockValueDomain: Mockify<IValueDomain> = {
        getValues: global.__mockPromise([{value: {id: '1'}}])
    };

    describe('With accessToken', () => {
        it('Should throw an error if access token is invalid', async () => {
            const authApp = createAuthApp({
                'core.app.helpers.initQueryContext': initQueryContext({config: mockConfig as IConfig}),
                config: mockConfig as IConfig
            });

            const validateRequestToken = validateRequestTokenHelper({'core.app.auth': authApp as IAuthApp});

            const requestMock: Mockify<IRequestWithContext> = {
                cookies: {
                    accessToken: invalidAccessToken
                },
                query: {
                    [API_KEY_PARAM_NAME]: '123456'
                }
            };

            const responseMock: Mockify<Response> = {
                cookie: jest.fn()
            };

            await expect(
                validateRequestToken(requestMock as unknown as IRequestWithContext, responseMock as unknown as Response)
            ).rejects.toThrow('Invalid accessToken');
        });

        it("Should throw an error if access token payload doesn't contain userId", async () => {
            const authApp = createAuthApp({
                'core.app.helpers.initQueryContext': initQueryContext({config: mockConfig as IConfig}),
                config: mockConfig as IConfig
            });

            const validateRequestToken = validateRequestTokenHelper({'core.app.auth': authApp as IAuthApp});

            const requestMock: Mockify<IRequestWithContext> = {
                cookies: {
                    accessToken: validAccessTokenWithoutUserId
                },
                query: {
                    [API_KEY_PARAM_NAME]: '123456'
                }
            };

            const responseMock: Mockify<Response> = {
                cookie: jest.fn()
            };

            await expect(
                validateRequestToken(requestMock as unknown as IRequestWithContext, responseMock as unknown as Response)
            ).rejects.toThrow('Invalid accessToken');
        });
    });

    describe('With refreshToken', () => {
        it('Should throw an error if refresh token is invalid', async () => {
            const authApp = createAuthApp({
                'core.app.helpers.initQueryContext': initQueryContext({config: mockConfig as IConfig}),
                config: mockConfig as IConfig
            });

            const validateRequestToken = validateRequestTokenHelper({'core.app.auth': authApp as IAuthApp});

            const requestMock: Mockify<IRequestWithContext> = {
                cookies: {
                    refreshToken: invalidRefreshToken
                },
                query: {
                    [API_KEY_PARAM_NAME]: '123456'
                }
            };

            const responseMock: Mockify<Response> = {
                cookie: jest.fn()
            };

            await expect(
                validateRequestToken(requestMock as unknown as IRequestWithContext, responseMock as unknown as Response)
            ).rejects.toThrow('Invalid refreshToken');
        });

        it("Should throw an error if refresh token payload doesn't contain userId", async () => {
            const authApp = createAuthApp({
                'core.app.helpers.initQueryContext': initQueryContext({config: mockConfig as IConfig}),
                config: mockConfig as IConfig
            });

            const validateRequestToken = validateRequestTokenHelper({'core.app.auth': authApp as IAuthApp});

            const requestMock: Mockify<IRequestWithContext> = {
                cookies: {
                    accessToken: validRefreshTokenWithoutUserId
                },
                query: {
                    [API_KEY_PARAM_NAME]: '123456'
                }
            };

            const responseMock: Mockify<Response> = {
                cookie: jest.fn()
            };

            await expect(
                validateRequestToken(requestMock as unknown as IRequestWithContext, responseMock as unknown as Response)
            ).rejects.toThrow('Invalid accessToken');
        });

        it('Should set new access and refresh token', async () => {
            const authApp = createAuthApp({
                'core.app.helpers.initQueryContext': initQueryContext({config: mockConfig as IConfig}),
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                config: mockConfig as IConfig
            });

            const validateRequestToken = validateRequestTokenHelper({'core.app.auth': authApp as IAuthApp});

            const requestMock: Mockify<IRequestWithContext> = {
                cookies: {
                    refreshToken: validRefreshToken
                },
                query: {
                    [API_KEY_PARAM_NAME]: '123456'
                },
                headers: {
                    host: 'host',
                    'user-agent': 'test',
                    'x-forwarded-for': '1'
                }
            };

            const responseMock: Mockify<Response> = {
                cookie: jest.fn()
            };

            const mockedVerify = jest.spyOn(jwt, 'verify');

            mockedVerify.mockImplementation(() => ({
                userId: '1',
                ip: '1',
                agent: 'test'
            }));

            const mockedSign = jest.spyOn(jwt, 'sign') as jest.MockedFunction<typeof jwt.sign>;

            mockedSign
                .mockImplementationOnce(() => 'new_mocked_access_token')
                .mockImplementationOnce(() => 'new_mocked_refresh_token');

            await validateRequestToken(
                requestMock as unknown as IRequestWithContext,
                responseMock as unknown as Response
            );

            expect(responseMock.cookie).toHaveBeenCalledWith('accessToken', 'new_mocked_access_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });

            expect(responseMock.cookie).toHaveBeenCalledWith('refreshToken', 'new_mocked_refresh_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });
        });
    });

    it('Should return userId and groupId if accessToken is valid and userId payload exist', async () => {
        const authApp = createAuthApp({
            'core.app.helpers.initQueryContext': initQueryContext({config: mockConfig as IConfig}),
            'core.infra.cache.cacheService': mockCachesService as ICachesService,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            config: mockConfig as IConfig
        });

        const validateRequestToken = validateRequestTokenHelper({'core.app.auth': authApp as IAuthApp});

        const requestMock: Mockify<IRequestWithContext> = {
            cookies: {
                refreshToken: validRefreshToken
            },
            query: {
                [API_KEY_PARAM_NAME]: '123456'
            },
            headers: {
                host: 'host',
                'user-agent': 'test',
                'x-forwarded-for': '1'
            }
        };

        const responseMock: Mockify<Response> = {
            cookie: jest.fn()
        };

        const mockedVerify = jest.spyOn(jwt, 'verify');

        mockedVerify.mockImplementation(() => ({
            userId: '1',
            groupsId: ['1'],
            ip: '1',
            agent: 'test'
        }));

        const mockedSign = jest.spyOn(jwt, 'sign') as jest.MockedFunction<typeof jwt.sign>;

        mockedSign
            .mockImplementationOnce(() => 'new_mocked_access_token')
            .mockImplementationOnce(() => 'new_mocked_refresh_token');

        const result = await validateRequestToken(
            requestMock as unknown as IRequestWithContext,
            responseMock as unknown as Response
        );

        expect(result).toEqual({
            userId: '1',
            groupsId: ['1']
        });
    });
});
