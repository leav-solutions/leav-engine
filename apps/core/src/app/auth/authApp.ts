// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {IApiKeyDomain} from 'domain/apiKey/apiKeyDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUserDomain} from 'domain/user/userDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {Express, NextFunction, Request, Response} from 'express';
import useragent from 'express-useragent';
import jwt, {Algorithm} from 'jsonwebtoken';
import ms from 'ms';
import {v4 as uuidv4} from 'uuid';
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IStandardValue, ITreeValue} from '_types/value';
import AuthenticationError from '../../errors/AuthenticationError';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import {USERS_GROUP_ATTRIBUTE_NAME} from '../../infra/permission/permissionRepo';
import {ACCESS_TOKEN_COOKIE_NAME, ITokenUserData, REFRESH_TOKEN_COOKIE_NAME} from '../../_types/auth';
import {USERS_LIBRARY} from '../../_types/library';
import {AttributeCondition, IRecord} from '../../_types/record';
import {IRequestWithContext} from '../../_types/express';
import winston from 'winston';
import {IOIDCClientService} from '../../infra/oidc/oidcClientService';

export interface IAuthApp {
    getGraphQLSchema(): IAppGraphQLSchema;
    validateRequestToken(params: {apiKey?: string; cookies?: {}}): Promise<ITokenUserData>;
    registerRoute(app: Express): void;
    authenticateWithOIDCService(req: IRequestWithContext, res: Response<unknown>): Promise<void | Response>;
}

const SESSION_CACHE_HEADER = 'session';

interface ISessionPayload extends jwt.JwtPayload {
    userId: string;
    ip: string | string[];
    agent: string;
}

interface ITransfertPayloadInIODC {
    originalUrl: string;
    queryId: string;
}

interface IAccessTokenPayload extends jwt.JwtPayload {
    userId: string;
    groupsId: string[];
}

interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.apiKey'?: IApiKeyDomain;
    'core.domain.user'?: IUserDomain;
    'core.infra.cache.cacheService'?: ICachesService;
    'core.utils.logger'?: winston.Winston;
    'core.infra.oidc.oidcClientService'?: IOIDCClientService;
    config?: IConfig;
}

export default function({
    'core.domain.value': valueDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.apiKey': apiKeyDomain = null,
    'core.domain.user': userDomain = null,
    'core.utils.logger': logger = null,
    'core.infra.cache.cacheService': cacheService = null,
    'core.infra.oidc.oidcClientService': oidcClientService = null,
    config = null
}: IDeps = {}): IAuthApp {
    const _generateAccessToken = async (userId: string, ctx: IQueryInfos) => {
        const groups = await valueDomain.getValues({
            library: 'users',
            recordId: userId,
            attribute: 'user_groups',
            ctx
        });

        return jwt.sign(
            {
                userId,
                groupsId: groups.map(g => g.value.id)
            },
            config.auth.key,
            {
                algorithm: config.auth.algorithm as Algorithm,
                expiresIn: String(config.auth.tokenExpiration)
            }
        );
    };

    const _generateRefreshToken = (payload: ISessionPayload) =>
        jwt.sign(payload, config.auth.key, {
            algorithm: config.auth.algorithm as Algorithm,
            expiresIn: String(config.auth.refreshTokenExpiration),
            jwtid: uuidv4()
        });

    return {
        getGraphQLSchema(): IAppGraphQLSchema {
            return {
                typeDefs: `
                    extend type Query {
                        me: Record
                    }
                `,
                resolvers: {
                    Query: {
                        async me(parent, args, ctx, info): Promise<IRecord> {
                            const users = await recordDomain.find({
                                params: {
                                    library: 'users',
                                    filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: ctx.userId}],
                                    withCount: false,
                                    retrieveInactive: true
                                },
                                ctx
                            });

                            return users.list[0];
                        }
                    }
                }
            };
        },
        registerRoute(app): void {
            app.get(
                '/auth/oidc/verify/*',
                async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
                    if (config.auth.oidc === null) {
                        return res.status(401);
                    }

                    const {code} = req.query;
                    const payloadBase64Encoded = req.params[0];

                    const {queryId, originalUrl}: ITransfertPayloadInIODC = JSON.parse(
                        Buffer.from(payloadBase64Encoded, 'base64').toString()
                    );

                    try {
                        const oidcTokenSet = await oidcClientService.getTokensFromCodes({
                            authorizationCode: code as string,
                            queryId
                        });

                        const decodedToken = jwt.decode(oidcTokenSet.id_token) as jwt.JwtPayload;
                        const {email} = decodedToken;

                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'authenticate'
                        };

                        const userRecords = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'email', condition: AttributeCondition.EQUAL, value: email}]
                            },
                            ctx
                        });

                        if (userRecords.list.length < 1) {
                            throw new AuthenticationError('Invalid user');
                        }

                        const user = userRecords.list[0];

                        await oidcClientService.saveOIDCTokens({userId: user.id, tokens: oidcTokenSet});

                        const accessToken = await _generateAccessToken(user.id, ctx);

                        const refreshToken = _generateRefreshToken({
                            userId: user.id,
                            ip: req.headers['x-forwarded-for'],
                            agent: req.headers['user-agent']
                        });

                        // store refresh token in cache
                        const cacheKey = `${SESSION_CACHE_HEADER}:${refreshToken}`;
                        const refreshExpires = ms(config.auth.refreshTokenExpiration);
                        await cacheService.getCache(ECacheType.RAM).storeData({
                            key: cacheKey,
                            data: user.id,
                            expiresIn: refreshExpires
                        });
                        // TODO check if cookie consent is set for the user
                        res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
                            httpOnly: true,
                            sameSite: config.auth.oidc.cookie.sameSite,
                            secure: config.auth.oidc.cookie.secure,
                            domain: req.headers.host,
                            expires: new Date(Date.now() + refreshExpires)
                        });

                        // We need the milliseconds value to set cookie expiration
                        // ms is the package used by jsonwebtoken under the hood, hence we're sure the value is same
                        const cookieExpires = ms(String(config.auth.tokenExpiration));
                        res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
                            httpOnly: true,
                            sameSite: config.auth.cookie.sameSite,
                            secure: config.auth.cookie.secure,
                            domain: req.headers.host,
                            expires: new Date(Date.now() + cookieExpires)
                        });

                        return res.redirect(originalUrl);
                    } catch (err) {
                        logger.error(err);
                        return next(err);
                    }
                }
            );

            app.post(
                '/auth/authenticate',
                async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
                    try {
                        const {login, password} = req.body;

                        if (typeof login === 'undefined' || typeof password === 'undefined') {
                            return res.status(401).send('Missing credentials');
                        }

                        // Check if user is active
                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'authenticate'
                        };

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'login', condition: AttributeCondition.EQUAL, value: login}]
                            },
                            ctx
                        });

                        if (!users.list.length) {
                            return res.status(401).send('Invalid credentials');
                        }

                        // Check if password is correct
                        const user = users.list[0];
                        const userPwd: IStandardValue[] = await valueDomain.getValues({
                            library: 'users',
                            recordId: user.id,
                            attribute: 'password',
                            ctx
                        });

                        const isValidPwd =
                            !!userPwd[0].raw_value && (await bcrypt.compare(password, userPwd[0].raw_value));

                        if (!isValidPwd) {
                            return res.status(401).send('Invalid credentials');
                        }

                        const accessToken = await _generateAccessToken(user.id, ctx);

                        const refreshToken = _generateRefreshToken({
                            userId: user.id,
                            ip: req.headers['x-forwarded-for'],
                            agent: req.headers['user-agent']
                        });

                        // store refresh token in cache
                        const cacheKey = `${SESSION_CACHE_HEADER}:${refreshToken}`;
                        await cacheService.getCache(ECacheType.RAM).storeData({
                            key: cacheKey,
                            data: user.id,
                            expiresIn: ms(config.auth.refreshTokenExpiration)
                        });

                        // We need the milliseconds value to set cookie expiration
                        // ms is the package used by jsonwebtoken under the hood, hence we're sure the value is same
                        const cookieExpires = ms(String(config.auth.tokenExpiration));
                        res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
                            httpOnly: true,
                            sameSite: config.auth.cookie.sameSite,
                            secure: config.auth.cookie.secure,
                            domain: req.headers.host,
                            expires: new Date(Date.now() + cookieExpires)
                        });

                        return res.status(200).json({
                            refreshToken
                        });
                    } catch (err) {
                        return next(err);
                    }
                }
            );

            app.post('/auth/logout', async (req, res) => {
                res.cookie(ACCESS_TOKEN_COOKIE_NAME, '', {
                    expires: new Date(0),
                    httpOnly: true,
                    sameSite: config.auth.cookie.sameSite,
                    secure: config.auth.cookie.secure,
                    domain: req.headers.host
                });

                if (config.auth.oidc !== null) {
                    const redirectUrl = oidcClientService.getLogoutUrl();
                    return res.status(200).json({redirectUrl});
                }

                return res.status(200).json({});
            });

            app.post(
                '/auth/forgot-password',
                async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
                    try {
                        const {email, lang} = req.body;
                        const ua = useragent.parse(req.headers['user-agent']);

                        if (typeof email === 'undefined' || typeof lang === 'undefined') {
                            return res.status(400).send('Missing parameters');
                        }

                        // Get user id
                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'forgot-password'
                        };

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'email', condition: AttributeCondition.EQUAL, value: email}]
                            },
                            ctx
                        });

                        if (!users.list.length) {
                            return res.status(401).send('Email not found');
                        }

                        const user = users.list[0];

                        // Generate token
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                email: user.email
                            },
                            config.auth.key,
                            {
                                algorithm: config.auth.algorithm as Algorithm,
                                expiresIn: String(config.auth.resetPasswordExpiration)
                            }
                        );

                        await userDomain.sendResetPasswordEmail(
                            user.email,
                            token,
                            user.login,
                            ua.browser,
                            ua.os,
                            lang,
                            ctx
                        );

                        return res.sendStatus(200);
                    } catch (err) {
                        return next(err);
                    }
                }
            );

            app.post(
                '/auth/reset-password',
                async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
                    try {
                        const {token, newPassword} = req.body;

                        if (typeof token === 'undefined' || typeof newPassword === 'undefined') {
                            return res.status(400).send('Missing required parameters');
                        }

                        let payload: jwt.JwtPayload;

                        // to catch expired token error properly
                        try {
                            payload = jwt.verify(token, config.auth.key) as jwt.JwtPayload;
                        } catch (e) {
                            throw new AuthenticationError('Invalid token');
                        }

                        if (typeof payload.userId === 'undefined' || typeof payload.email === 'undefined') {
                            throw new AuthenticationError('Invalid token');
                        }

                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'resetPassword'
                        };

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: payload.userId}]
                            },
                            ctx
                        });

                        if (!users.list.length) {
                            throw new AuthenticationError('User not found');
                        }

                        try {
                            // save new password
                            await valueDomain.saveValue({
                                library: 'users',
                                recordId: payload.userId,
                                attribute: 'password',
                                value: {value: newPassword},
                                ctx
                            });
                        } catch (e) {
                            return res.status(422).send('Invalid password');
                        }

                        return res.sendStatus(200);
                    } catch (err) {
                        return next(err);
                    }
                }
            );

            app.post('/auth/refresh', async (req, res, next) => {
                try {
                    const refreshToken =
                        config.auth.oidc !== null ? req.cookies[REFRESH_TOKEN_COOKIE_NAME] : req.body.refreshToken;

                    if (typeof refreshToken === 'undefined') {
                        return res.status(400).send('Missing refresh token');
                    }

                    let payload: ISessionPayload;

                    try {
                        payload = jwt.verify(refreshToken, config.auth.key) as ISessionPayload;
                    } catch (e) {
                        throw new AuthenticationError('Invalid token');
                    }

                    try {
                        if (config.auth.oidc !== null) {
                            await oidcClientService.checkTokensValidity({userId: payload.userId});
                        }
                    } catch (err) {
                        throw new AuthenticationError('oidc session expired');
                    }

                    if (!payload.userId || !payload.ip || !payload.agent) {
                        throw new AuthenticationError('Invalid token');
                    }

                    // Get user data
                    const ctx: IQueryInfos = {
                        userId: config.defaultUserId,
                        queryId: 'refresh'
                    };

                    const users = await recordDomain.find({
                        params: {
                            library: 'users',
                            filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: payload.userId}]
                        },
                        ctx
                    });

                    // User could have been deleted / disabled in database
                    if (!users.list.length) {
                        return res.status(401).send('Invalid token');
                    }

                    const userSessionId = (
                        await cacheService.getCache(ECacheType.RAM).getData([`${SESSION_CACHE_HEADER}:${refreshToken}`])
                    )[0];

                    if (!userSessionId) {
                        return res.status(401).send('Invalid session');
                    }

                    // We check if user agent is the same
                    if (payload.agent !== req.headers['user-agent']) {
                        return res.status(401).send('Invalid session');
                    }

                    // Everything is ok, we can generate, update and return new tokens

                    const newAccessToken = await _generateAccessToken(payload.userId, ctx);
                    const newRefreshToken = _generateRefreshToken({
                        userId: payload.userId,
                        ip: req.headers['x-forwarded-for'],
                        agent: req.headers['user-agent']
                    });

                    await cacheService.getCache(ECacheType.RAM).storeData({
                        key: `${SESSION_CACHE_HEADER}:${newRefreshToken}`,
                        data: payload.userId,
                        expiresIn: ms(config.auth.refreshTokenExpiration)
                    });

                    // Delete old session
                    await cacheService.getCache(ECacheType.RAM).deleteData([`${SESSION_CACHE_HEADER}:${refreshToken}`]);

                    const cookieExpires = ms(String(config.auth.tokenExpiration));
                    res.cookie(ACCESS_TOKEN_COOKIE_NAME, newAccessToken, {
                        httpOnly: true,
                        sameSite: config.auth.cookie.sameSite,
                        secure: config.auth.cookie.secure,
                        domain: req.headers.host,
                        expires: new Date(Date.now() + cookieExpires)
                    });

                    if (config.auth.oidc !== null) {
                        const refreshCookieExpires = ms(String(config.auth.refreshTokenExpiration));
                        res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
                            httpOnly: true,
                            sameSite: config.auth.cookie.sameSite,
                            secure: config.auth.cookie.secure,
                            domain: req.headers.host,
                            expires: new Date(Date.now() + refreshCookieExpires)
                        });
                    }

                    return res.status(200).json(
                        config.auth.oidc !== null
                            ? {}
                            : {
                                  refreshToken: newRefreshToken
                              }
                    );
                } catch (err) {
                    return next(err);
                }
            });
        },
        async validateRequestToken({apiKey, cookies}) {
            const ctx: IQueryInfos = {
                userId: config.defaultUserId,
                queryId: 'validateToken'
            };

            const token = cookies?.[ACCESS_TOKEN_COOKIE_NAME];

            let userId: string;
            let groupsId: string[];

            if (!token && !apiKey) {
                throw new AuthenticationError('No token or api key provided');
            }

            if (token) {
                // Token validation checking
                let payload: IAccessTokenPayload;

                try {
                    payload = jwt.verify(token, config.auth.key) as IAccessTokenPayload;
                } catch (e) {
                    throw new AuthenticationError('Invalid token');
                }

                if (!payload.userId) {
                    throw new AuthenticationError('Invalid token');
                }

                userId = payload.userId;
                groupsId = payload.groupsId;
            }

            if (!userId && apiKey) {
                // If no valid token in cookies, check api key
                const apiKeyData = await apiKeyDomain.validateApiKey({apiKey, ctx});

                // Check API key has not expired
                const hasExpired = apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date();
                if (hasExpired) {
                    throw new AuthenticationError('API key expired');
                }

                userId = apiKeyData.userId;

                // Fetch user groups
                const userGroups = (await valueDomain.getValues({
                    library: USERS_LIBRARY,
                    recordId: userId,
                    attribute: USERS_GROUP_ATTRIBUTE_NAME,
                    ctx
                })) as ITreeValue[];
                groupsId = userGroups.map(g => g.value.id);
            }

            // Validate user
            const users = await recordDomain.find({
                params: {
                    library: 'users',
                    filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: userId}]
                },
                ctx
            });

            if (!users.list.length) {
                throw new AuthenticationError('User not found');
            }

            return {
                userId,
                groupsId
            };
        },
        authenticateWithOIDCService: async (req, res) => {
            if (config.auth.oidc === null) {
                return res.status(401);
            }

            const payload = Buffer.from(
                JSON.stringify({originalUrl: req.originalUrl, queryId: req.ctx.queryId} as ITransfertPayloadInIODC)
            ).toString('base64url');

            const oidcLoginUrl = await oidcClientService.getAuthorizationUrl({
                redirectUri: `${config.server.publicUrl}/auth/oidc/verify/${payload}`,
                queryId: req.ctx.queryId
            });

            return res.redirect(oidcLoginUrl);
        }
    };
}
