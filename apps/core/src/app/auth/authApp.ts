// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {IApiKeyDomain} from 'domain/apiKey/apiKeyDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUserDomain} from 'domain/user/userDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {CookieOptions, Express, NextFunction, Request, Response} from 'express';
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
import {InitQueryContextFunc} from '../helpers/initQueryContext';
import {IConvertOIDCIdentifier} from '../helpers/convertOIDCIdentifier';
import {IncomingHttpHeaders} from 'http';
import {IRecordRepo} from '../../infra/record/recordRepo';
import {AttributeTypes} from '../../_types/attribute';

export interface IAuthApp {
    getGraphQLSchema(): IAppGraphQLSchema;
    validateRequestToken(
        params: {apiKey?: string; headers: IncomingHttpHeaders; cookies?: {}},
        res: Response<unknown>
    ): Promise<ITokenUserData>;
    registerRoute(app: Express): void;
    authenticateWithOIDCService(req: IRequestWithContext, res: Response<unknown>): Promise<void | Response>;
}

const SESSION_CACHE_HEADER = 'session';

interface ISessionPayload extends jwt.JwtPayload {
    userId: string;
    ip: string | string[] | null;
    agent: string | null;
}

interface IAccessTokenPayload extends jwt.JwtPayload {
    userId: string;
    groupsId: string[];
}

export interface IAuthAppDeps {
    'core.domain.value': IValueDomain;
    'core.domain.record': IRecordDomain;
    'core.infra.record': IRecordRepo;
    'core.domain.apiKey': IApiKeyDomain;
    'core.domain.user': IUserDomain;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils.logger': winston.Winston;
    'core.infra.oidc.oidcClientService': IOIDCClientService;
    'core.app.helpers.initQueryContext': InitQueryContextFunc;
    'core.app.helpers.convertOIDCIdentifier': IConvertOIDCIdentifier;
    config: IConfig;
}

type authCookieName = typeof ACCESS_TOKEN_COOKIE_NAME | typeof REFRESH_TOKEN_COOKIE_NAME;

export default function ({
    'core.domain.value': valueDomain,
    'core.domain.record': recordDomain,
    'core.infra.record': recordRepo,
    'core.domain.apiKey': apiKeyDomain,
    'core.domain.user': userDomain,
    'core.utils.logger': logger,
    'core.infra.cache.cacheService': cacheService,
    'core.infra.oidc.oidcClientService': oidcClientService,
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.app.helpers.convertOIDCIdentifier': convertOIDCIdentifier,
    config
}: IAuthAppDeps): IAuthApp {
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
                groupsId: groups.map(g => g.payload.id)
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

    const _getAuthCookieArgs = (
        cookieName: authCookieName,
        value: string,
        host: string | null
    ): [authCookieName, string, CookieOptions] => {
        const cookieExpires = ms(
            String(
                cookieName === ACCESS_TOKEN_COOKIE_NAME
                    ? config.auth.tokenExpiration
                    : config.auth.refreshTokenExpiration
            )
        );
        if (!host) {
            throw new AuthenticationError('Missing host, cannot scope cookie domain.');
        }
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            sameSite: config.auth.cookie.sameSite,
            secure: config.auth.cookie.secure,
            expires: new Date(Date.now() + cookieExpires),
            domain: host
        };

        return [cookieName, value, cookieOptions];
    };

    const _checkIfUserExistsById = async (userId: string, ctx: IQueryInfos) => {
        const users = await recordDomain.find({
            params: {
                library: 'users',
                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: userId}]
            },
            ctx
        });

        // User could have been deleted / disabled in database
        if (!users.list.length) {
            throw new AuthenticationError('User not found');
        }
    };

    const _generateAccessAndRefreshTokens = async (
        userId: string,
        refreshToken: string,
        headers: IncomingHttpHeaders,
        res: Response,
        ctx: IQueryInfos
    ) => {
        const newAccessToken = await _generateAccessToken(userId, ctx);

        const newRefreshToken = _generateRefreshToken({
            userId,
            ip: headers['x-forwarded-for'] ?? null,
            agent: headers['user-agent'] ?? null
        });

        await cacheService.getCache(ECacheType.RAM).storeData({
            key: `${SESSION_CACHE_HEADER}:${newRefreshToken}`,
            data: userId,
            expiresIn: ms(config.auth.refreshTokenExpiration)
        });

        await cacheService.getCache(ECacheType.RAM).deleteData([`${SESSION_CACHE_HEADER}:${refreshToken}`]);
        const host = headers.host ?? null;
        res.cookie(..._getAuthCookieArgs(ACCESS_TOKEN_COOKIE_NAME, newAccessToken, host));
        res.cookie(..._getAuthCookieArgs(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, host));
    };

    return {
        getGraphQLSchema: () => ({
            typeDefs: `
                    extend type Query {
                        me: Record
                    }
                `,
            resolvers: {
                Query: {
                    async me(parent, args, ctx: IQueryInfos, info): Promise<IRecord> {
                        const users = await recordRepo.find({
                            libraryId: USERS_LIBRARY,
                            filters: [
                                {
                                    attributes: [{id: 'id', type: AttributeTypes.SIMPLE}],
                                    condition: AttributeCondition.EQUAL,
                                    value: ctx.userId
                                }
                            ],
                            withCount: false,
                            retrieveInactive: true,
                            ctx
                        });

                        return users.list[0];
                    }
                }
            }
        }),
        registerRoute(app) {
            app.get(
                '/auth/oidc/verify/:identifierBase64Url',
                async (
                    req: Request<{identifierBase64Url: string}>,
                    res: Response,
                    next: NextFunction
                ): Promise<Response | void> => {
                    if (!config.auth.oidc.enable) {
                        return res.status(401);
                    }

                    const {code} = req.query;

                    const queryId = convertOIDCIdentifier.decodeIdentifierFromBase64Url(req.params.identifierBase64Url);

                    try {
                        const oidcTokenSet = await oidcClientService.getTokensFromCodes({
                            authorizationCode: code as string,
                            queryId
                        });

                        const decodedToken = jwt.decode(oidcTokenSet.id_token) as jwt.JwtPayload;
                        const email = decodedToken[config.auth.oidc.idTokenUserClaim];

                        const ctx: IQueryInfos = {
                            ...initQueryContext(req),
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
                            ip: req.headers['x-forwarded-for'] ?? null,
                            agent: req.headers['user-agent'] ?? null
                        });

                        // store refresh token in cache
                        const cacheKey = `${SESSION_CACHE_HEADER}:${refreshToken}`;
                        const refreshExpires = ms(config.auth.refreshTokenExpiration);
                        await cacheService.getCache(ECacheType.RAM).storeData({
                            key: cacheKey,
                            data: user.id,
                            expiresIn: refreshExpires
                        });
                        const host = req.headers.host ?? null;
                        res.cookie(..._getAuthCookieArgs(REFRESH_TOKEN_COOKIE_NAME, refreshToken, host));
                        res.cookie(..._getAuthCookieArgs(ACCESS_TOKEN_COOKIE_NAME, accessToken, host));

                        const originalUrl = await oidcClientService.getOriginalUrl(queryId);
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
                            ...initQueryContext(req),
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
                            !!userPwd[0].raw_payload && (await bcrypt.compare(password, userPwd[0].raw_payload));

                        if (!isValidPwd) {
                            return res.status(401).send('Invalid credentials');
                        }

                        const accessToken = await _generateAccessToken(user.id, ctx);

                        const refreshToken = _generateRefreshToken({
                            userId: user.id,
                            ip: req.headers['x-forwarded-for'] ?? null,
                            agent: req.headers['user-agent'] ?? null
                        });

                        // store refresh token in cache
                        const cacheKey = `${SESSION_CACHE_HEADER}:${refreshToken}`;

                        await cacheService.getCache(ECacheType.RAM).storeData({
                            key: cacheKey,
                            data: user.id,
                            expiresIn: ms(config.auth.refreshTokenExpiration)
                        });
                        const host = req.headers.host ?? null;
                        res.cookie(..._getAuthCookieArgs(ACCESS_TOKEN_COOKIE_NAME, accessToken, host));
                        res.cookie(..._getAuthCookieArgs(REFRESH_TOKEN_COOKIE_NAME, refreshToken, host));

                        return res.status(200).json({});
                    } catch (err) {
                        return next(err);
                    }
                }
            );

            app.post('/auth/logout', async (req, res) => {
                const host = req.headers.host ?? null;
                const {refreshToken} = req.cookies;

                res.cookie(..._getAuthCookieArgs(ACCESS_TOKEN_COOKIE_NAME, '', host));
                res.cookie(..._getAuthCookieArgs(REFRESH_TOKEN_COOKIE_NAME, '', host));

                if (config.auth.oidc.enable) {
                    try {
                        const payload = jwt.verify(refreshToken, config.auth.key) as IAccessTokenPayload;
                        const userId = payload.userId;
                        const redirectUrl = await oidcClientService.getLogoutUrl({userId});
                        return res.status(200).json({redirectUrl});
                    } catch {
                        const redirectUrl = await oidcClientService.getLogoutUrl({userId: null});
                        return res.status(200).json({redirectUrl});
                    }
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
                            ...initQueryContext(req),
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
                            ...initQueryContext(req),
                            userId: config.defaultUserId,
                            queryId: 'resetPassword'
                        };

                        await _checkIfUserExistsById(payload.userId, ctx);

                        try {
                            // save new password
                            await valueDomain.saveValue({
                                library: 'users',
                                recordId: payload.userId,
                                attribute: 'password',
                                value: {payload: newPassword},
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

            app.post('/auth/login-checker', async (req: IRequestWithContext, res, next) => {
                try {
                    // Get user data
                    const ctx: IQueryInfos = {
                        ...initQueryContext(req),
                        userId: config.defaultUserId,
                        queryId: 'refresh'
                    };
                    req.ctx = initQueryContext(req);
                    req.ctx.userId = ctx.userId;
                    req.ctx.queryId = ctx.queryId;

                    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

                    if (typeof refreshToken === 'undefined') {
                        return res.status(400).send('Missing refresh token');
                    }

                    let payload: ISessionPayload;

                    try {
                        payload = jwt.verify(refreshToken, config.auth.key) as ISessionPayload;
                    } catch (e) {
                        throw new AuthenticationError('Invalid token');
                    }

                    if (config.auth.oidc.enable) {
                        try {
                            await oidcClientService.checkTokensValidity({userId: payload.userId});
                        } catch (err) {
                            throw new AuthenticationError('oidc session expired');
                        }
                    }

                    if (!payload.userId || !payload.ip || !payload.agent) {
                        throw new AuthenticationError('Invalid token');
                    }

                    await _checkIfUserExistsById(payload.userId, ctx);

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

                    await _generateAccessAndRefreshTokens(payload.userId, refreshToken, req.headers, res, ctx);

                    return res.status(200).json({});
                } catch (err) {
                    return next(err);
                }
            });
        },
        async validateRequestToken({apiKey, headers, cookies}, res) {
            const ctx: IQueryInfos = {
                ...initQueryContext(),
                userId: config.defaultUserId,
                queryId: 'validateToken'
            };

            const accessToken = cookies?.[ACCESS_TOKEN_COOKIE_NAME];
            const refreshToken = cookies?.[REFRESH_TOKEN_COOKIE_NAME];

            let userId: string;
            let groupsId: string[];
            let payload: IAccessTokenPayload | ISessionPayload;

            if (accessToken) {
                try {
                    payload = jwt.verify(accessToken, config.auth.key) as IAccessTokenPayload;
                } catch (e) {
                    throw new AuthenticationError('Invalid accessToken');
                }

                userId = payload.userId;

                if (!userId) {
                    throw new AuthenticationError('Invalid accessToken');
                }

                groupsId = payload.groupsId;
            } else if (refreshToken) {
                try {
                    payload = jwt.verify(refreshToken, config.auth.key) as ISessionPayload;
                } catch (e) {
                    throw new AuthenticationError('Invalid refreshToken');
                }

                if (!payload.userId || !payload.ip || !payload.agent) {
                    throw new AuthenticationError('Invalid refreshToken');
                }

                if (config.auth.oidc.enable) {
                    try {
                        await oidcClientService.checkTokensValidity({userId: payload.userId});
                    } catch (err) {
                        throw new AuthenticationError('OIDC session expired');
                    }
                }

                const userSessionId = (
                    await cacheService.getCache(ECacheType.RAM).getData([`${SESSION_CACHE_HEADER}:${refreshToken}`])
                )[0];

                if (!userSessionId || payload.agent !== headers['user-agent']) {
                    throw new AuthenticationError('Invalid session');
                }

                await _generateAccessAndRefreshTokens(payload.userId, refreshToken, headers, res, ctx);

                userId = payload.userId;
                groupsId = payload.groupsId;
            } else {
                if (!apiKey) {
                    throw new AuthenticationError('No api key provided');
                }

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
                groupsId = userGroups.map(g => g.payload?.id);
            }

            await _checkIfUserExistsById(userId, ctx);

            return {
                userId,
                groupsId
            };
        },
        authenticateWithOIDCService: async (req, res) => {
            if (!config.auth.oidc.enable) {
                return res.status(401);
            }

            const queryId = req.ctx.queryId;

            const identifierBase64Url = convertOIDCIdentifier.encodeIdentifierToBase64Url(queryId);
            await oidcClientService.saveOriginalUrl({originalUrl: req.originalUrl, queryId});

            const oidcLoginUrl = await oidcClientService.getAuthorizationUrl({
                redirectUri: `${config.server.publicUrl}/auth/oidc/verify/${identifierBase64Url}`,
                queryId
            });

            return res.redirect(oidcLoginUrl);
        }
    };
}
