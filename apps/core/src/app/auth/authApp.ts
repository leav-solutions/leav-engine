// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IApiKeyDomain} from 'domain/apiKey/apiKeyDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type IUserDomain} from 'domain/user/userDomain';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type CookieOptions, type NextFunction, type Request, type Response} from 'express';
import useragent from 'express-useragent';
import jwt, {type Algorithm} from 'jsonwebtoken';
import ms from 'ms';
import {type IConfig} from '_types/config';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IQueryInfos} from '_types/queryInfos';
import {type ITreeValue} from '_types/value';
import AuthenticationError from '../../errors/AuthenticationError';
import {USERS_GROUP_ATTRIBUTE_NAME} from '../../infra/permission/permissionRepo';
import {ACCESS_TOKEN_COOKIE_NAME, type ITokenUserData, REFRESH_TOKEN_COOKIE_NAME} from '../../_types/auth';
import {USERS_LIBRARY} from '../../_types/library';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {type IRequestWithContext} from '../../_types/express';
import {type ILogger} from '@leav/logger';
import {type IOIDCClientService} from '../../infra/oidc/oidcClientService';
import {type InitQueryContextFunc} from '../helpers/initQueryContext';
import {type IConvertOIDCIdentifier} from '../helpers/convertOIDCIdentifier';
import {type IncomingHttpHeaders} from 'http';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type IGraphqlAppModule} from 'app/graphql/graphqlApp';
import {type IServerRouteAppModule} from 'interface/server';
import {adminsGroupId, systemUserId} from '../../_constants/users';
import {type GetSystemQueryContext} from 'utils/helpers/getSystemQueryContext';
import {type ISessionRepo} from '../../infra/session/sessionRepo';
import * as crypto from 'node:crypto';

export interface IAuthApp extends IGraphqlAppModule, IServerRouteAppModule {
    validateRequestToken(
        params: {apiKey?: string; headers: IncomingHttpHeaders; cookies?: {}},
        res: Response<unknown>,
    ): Promise<ITokenUserData>;
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
    'core.utils.logger': ILogger;
    'core.infra.oidc.oidcClientService': IOIDCClientService;
    'core.app.helpers.initQueryContext': InitQueryContextFunc;
    'core.app.helpers.convertOIDCIdentifier': IConvertOIDCIdentifier;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
    config: IConfig;
    'core.infra.session': ISessionRepo;
}

type AuthCookieName = typeof ACCESS_TOKEN_COOKIE_NAME | typeof REFRESH_TOKEN_COOKIE_NAME;
const ONE_MINUTE = 60 * 1000;

export default function ({
    'core.domain.value': valueDomain,
    'core.domain.record': recordDomain,
    'core.infra.record': recordRepo,
    'core.domain.apiKey': apiKeyDomain,
    'core.domain.user': userDomain,
    'core.utils.logger': logger,
    'core.infra.oidc.oidcClientService': oidcClientService,
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.app.helpers.convertOIDCIdentifier': convertOIDCIdentifier,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    'core.infra.session': sessionRepo,
    config,
}: IAuthAppDeps): IAuthApp {
    const _generateAccessToken = async (userId: string, ctx: IQueryInfos) => {
        const groups = await valueDomain.getValues({
            library: 'users',
            recordId: userId,
            attribute: 'user_groups',
            ctx,
        });

        return jwt.sign(
            {
                userId,
                groupsId: groups.map(g => g.payload.id),
            },
            config.auth.key,
            {
                algorithm: config.auth.algorithm as Algorithm,
                expiresIn: String(config.auth.tokenExpiration),
            },
        );
    };

    const _generateRefreshToken = (payload: ISessionPayload) =>
        jwt.sign(payload, config.auth.key, {
            algorithm: config.auth.algorithm as Algorithm,
            expiresIn: String(config.auth.refreshTokenExpiration),
            jwtid: crypto.randomUUID(),
        });

    const _getAuthCookieArgs = (
        cookieName: AuthCookieName,
        value: string,
        host: string | null,
    ): [AuthCookieName, string, CookieOptions] => {
        const cookieExpires =
            ms(
                String(
                    cookieName === ACCESS_TOKEN_COOKIE_NAME
                        ? config.auth.tokenExpiration
                        : config.auth.refreshTokenExpiration,
                ),
            ) - ONE_MINUTE; // we subtract one minute to avoid overlapping the access token
        if (config.auth.cookie.withDomain && !host) {
            throw new AuthenticationError('Missing host, cannot scope cookie domain.');
        }
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            sameSite: config.auth.cookie.sameSite,
            secure: config.auth.cookie.secure,
            expires: new Date(Date.now() + cookieExpires),
            domain: config.auth.cookie.withDomain ? host : undefined,
            path: config.server.basePath || '/',
        };

        return [cookieName, value, cookieOptions];
    };

    const _getSystemContextFromQuery = (req: Request, trigger: string): IQueryInfos => ({
        ...initQueryContext(req),
        userId: systemUserId,
        groupsId: [],
        trigger,
    });

    const _checkIfUserExistsById = async (userId: string, ctx: IQueryInfos) => {
        const users = await recordDomain.find({
            params: {
                library: 'users',
                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: userId}],
            },
            ctx,
        });

        // User could have been deleted / disabled in database
        if (!users.list.length) {
            throw new AuthenticationError('User not found');
        }
    };

    const _generateAccessAndRefreshTokens = async (
        userId: string,
        headers: IncomingHttpHeaders,
        res: Response,
        ctx: IQueryInfos,
    ) => {
        const newAccessToken = await _generateAccessToken(userId, ctx);

        const newRefreshToken = _generateRefreshToken({
            userId,
            ip: headers['x-forwarded-for'] ?? null,
            agent: headers['user-agent'] ?? null,
        });

        // We do not delete the refresh afterward, we let the cache service expiration handle it
        await sessionRepo.storeData({
            key: `${SESSION_CACHE_HEADER}:${newRefreshToken}`,
            data: userId,
            expiresIn: ms(config.auth.refreshTokenExpiration),
        });

        const host = headers.host ?? null;
        res.cookie(..._getAuthCookieArgs(ACCESS_TOKEN_COOKIE_NAME, newAccessToken, host));
        res.cookie(..._getAuthCookieArgs(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, host));
    };

    const _verifyRefreshToken = async (
        refreshToken: string,
        reqHeaders: IncomingHttpHeaders,
    ): Promise<ISessionPayload> => {
        let refreshPayload: ISessionPayload;
        try {
            refreshPayload = jwt.verify(refreshToken, config.auth.key) as ISessionPayload;
        } catch {
            throw new AuthenticationError('Invalid refreshToken');
        }

        if (!refreshPayload.userId || !refreshPayload.ip || !refreshPayload.agent) {
            throw new AuthenticationError('Invalid refreshToken');
        }

        if (config.auth.oidc.enable) {
            try {
                await oidcClientService.checkTokensValidity({userId: refreshPayload.userId});
            } catch {
                throw new AuthenticationError('OIDC session expired');
            }
        }

        const userSessionId = (await sessionRepo.getData([`${SESSION_CACHE_HEADER}:${refreshToken}`]))[0];

        if (!userSessionId || refreshPayload.agent !== reqHeaders['user-agent']) {
            throw new AuthenticationError('Invalid session');
        }

        return refreshPayload;
    };

    return {
        getGraphQLSchema: async (): Promise<IAppGraphQLSchema> => ({
            typeDefs: `
                    extend type Query {
                        me: Record
                    }
                `,
            resolvers: {
                Query: {
                    async me(parent, args, ctx: IQueryInfos, info): Promise<IRecord> {
                        return recordRepo.getRecord({
                            libraryId: USERS_LIBRARY,
                            recordId: ctx.userId,
                            ctx,
                        });
                    },
                },
            },
        }),
        registerRoute(app) {
            config.auth.debugLog &&
                app.use('/auth', async (req, res, next) => {
                    // log request
                    logger.silly(`Auth request: ${req.method} ${req.originalUrl}`);
                    next();
                });
            app.get(
                '/auth/oidc/verify/:identifierBase64Url',
                async (
                    req: Request<{identifierBase64Url: string}>,
                    res: Response,
                    next: NextFunction,
                ): Promise<Response | void> => {
                    if (!config.auth.oidc.enable) {
                        return res.status(401);
                    }

                    const {code} = req.query;

                    const queryId = convertOIDCIdentifier.decodeIdentifierFromBase64Url(req.params.identifierBase64Url);

                    try {
                        const oidcTokenSet = await oidcClientService.getTokensFromCodes({
                            authorizationCode: code as string,
                            queryId,
                        });

                        const decodedToken = jwt.decode(oidcTokenSet.id_token) as jwt.JwtPayload;
                        const decodedAccessToken = jwt.decode(oidcTokenSet.access_token) as jwt.JwtPayload;
                        const email = decodedToken[config.auth.oidc.idTokenUserClaim];

                        const systemCtx = _getSystemContextFromQuery(req, 'oidc:verify');

                        const userRecords = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'email', condition: AttributeCondition.EQUAL, value: email}],
                            },
                            ctx: systemCtx,
                        });

                        let user = userRecords.list[0];

                        if (!user) {
                            if (!config.auth.oidc.enableAutoProvisioning) {
                                throw new AuthenticationError('Invalid user');
                            }
                            // If no user found in DB, auto provision the user
                            const {record: createdUser} = await recordDomain.createRecord({
                                library: 'users',
                                values: [
                                    {payload: email, attribute: 'email'},
                                    {payload: decodedToken.name, attribute: 'login'}, // used to display the username in the UI instead of record id
                                ],
                                ctx: systemCtx,
                            });
                            logger.info(`User ${email} created during auto provisioning step`);
                            user = createdUser;
                            // if the user has role admin, put it in the admin group (id = 1)
                            if (
                                decodedAccessToken?.resource_access?.[config.auth.oidc.clientId]?.roles?.includes(
                                    'admin',
                                )
                            ) {
                                await valueDomain.saveValue({
                                    library: 'users',
                                    recordId: user.id,
                                    attribute: 'user_groups',
                                    value: {payload: adminsGroupId},
                                    ctx: systemCtx,
                                });
                            }
                        }

                        await oidcClientService.saveOIDCTokens({userId: user.id, tokens: oidcTokenSet});

                        const accessToken = await _generateAccessToken(user.id, systemCtx);

                        const refreshToken = _generateRefreshToken({
                            userId: user.id,
                            ip: req.headers['x-forwarded-for'] ?? null,
                            agent: req.headers['user-agent'] ?? null,
                        });

                        // store refresh token in cache
                        const refreshExpires = ms(config.auth.refreshTokenExpiration);
                        await sessionRepo.storeData({
                            key: `${SESSION_CACHE_HEADER}:${refreshToken}`,
                            data: user.id,
                            expiresIn: refreshExpires,
                        });
                        const host = req.headers.host ?? null;
                        res.cookie(..._getAuthCookieArgs(REFRESH_TOKEN_COOKIE_NAME, refreshToken, host));
                        res.cookie(..._getAuthCookieArgs(ACCESS_TOKEN_COOKIE_NAME, accessToken, host));

                        const originalUrl = await oidcClientService.getOriginalUrl(queryId);
                        return res.redirect(originalUrl);
                    } catch (err) {
                        // We may have AuthenticationError because our oidc_verificationKeys is expired in redis
                        // it has a max duration of 10 min (MAX_TIME_OIDC_SERVICE_ALLOW_AUTH_IN_MS)
                        // If our refresh token expire, after 2h (REFRESH_TOKEN_TTL),
                        // then we are redirected to keycloak to verify our authentication with a new oidc_verificationKeys, but there is more than 10 min between
                        // the redirection and the validation, so our oidc_verificationKeys are expired.
                        // Redirect in background tab in browser while user do something else for ex ?
                        //
                        // So, in that case, redirect to home page to trigger a new login flow with new oidc_verificationKeys
                        if (err instanceof AuthenticationError && err.retryAuthenticationFlow) {
                            // Add temporary feature flag in config to be able to disable this behavior if needed
                            if (config.auth.oidc.retryAuthenticationFlowAfterExpiry) {
                                const originalUrl = await oidcClientService.getOriginalUrl(queryId);
                                logger.warn(
                                    `Retrying authentication flow due to expired OIDC verification keys, redirect to original URL ${originalUrl}`,
                                );
                                return res.redirect(originalUrl);
                            } else {
                                logger.warn(
                                    'Not retrying authentication flow due to configuration, but would have redirect if enabled.',
                                );
                            }
                        }

                        logger.error(`Auth oidc verify error ${err.stack}`);
                        return next(err);
                    }
                },
            );

            app.post(
                '/auth/authenticate',
                async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
                    try {
                        const {login, password} = req.body;

                        if (typeof login === 'undefined' || typeof password === 'undefined') {
                            return res.status(401).send('Missing credentials');
                        }

                        const systemCtx = _getSystemContextFromQuery(req, 'authenticate');

                        // Check if user is active
                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'login', condition: AttributeCondition.EQUAL, value: login}],
                            },
                            ctx: systemCtx,
                        });

                        if (!users.list.length) {
                            return res.status(401).send('Invalid credentials');
                        }

                        // Check if password is correct
                        const user = users.list[0];
                        const isValidPwd = await userDomain.verifyPassword(user.id, password, systemCtx);

                        if (!isValidPwd) {
                            return res.status(401).send('Invalid credentials');
                        }

                        const accessToken = await _generateAccessToken(user.id, systemCtx);

                        const refreshToken = _generateRefreshToken({
                            userId: user.id,
                            ip: req.headers['x-forwarded-for'] ?? null,
                            agent: req.headers['user-agent'] ?? null,
                        });

                        // store refresh token in cache
                        await sessionRepo.storeData({
                            key: `${SESSION_CACHE_HEADER}:${refreshToken}`,
                            data: user.id,
                            expiresIn: ms(config.auth.refreshTokenExpiration),
                        });
                        const host = req.headers.host ?? null;
                        res.cookie(..._getAuthCookieArgs(ACCESS_TOKEN_COOKIE_NAME, accessToken, host));
                        res.cookie(..._getAuthCookieArgs(REFRESH_TOKEN_COOKIE_NAME, refreshToken, host));

                        return res.status(200).json({});
                    } catch (err) {
                        logger.error(`Auth authenticate error ${err.stack}`);
                        return next(err);
                    }
                },
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

                        const systemCtx = _getSystemContextFromQuery(req, 'forgot-password');

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'email', condition: AttributeCondition.EQUAL, value: email}],
                            },
                            ctx: systemCtx,
                        });

                        if (!users.list.length) {
                            return res.status(401).send('Email not found');
                        }

                        const user = users.list[0];

                        // Generate token
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                email: user.email,
                            },
                            config.auth.key,
                            {
                                algorithm: config.auth.algorithm as Algorithm,
                                expiresIn: String(config.auth.resetPasswordExpiration),
                            },
                        );

                        await userDomain.sendResetPasswordEmail(
                            user.email,
                            token,
                            user.login,
                            ua.browser,
                            ua.os,
                            lang,
                            systemCtx,
                        );

                        return res.sendStatus(200);
                    } catch (err) {
                        return next(err);
                    }
                },
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

                        const systemCtx = _getSystemContextFromQuery(req, 'reset-password');

                        await _checkIfUserExistsById(payload.userId, systemCtx);

                        try {
                            // save new password
                            await valueDomain.saveValue({
                                library: 'users',
                                recordId: payload.userId,
                                attribute: 'password',
                                value: {payload: newPassword},
                                ctx: systemCtx,
                            });
                        } catch (e) {
                            return res.status(422).send('Invalid password');
                        }

                        return res.sendStatus(200);
                    } catch (err) {
                        return next(err);
                    }
                },
            );

            app.post('/auth/login-checker', async (req: IRequestWithContext, res, next) => {
                try {
                    // Get user data
                    const systemCtx = _getSystemContextFromQuery(req, 'login-checker');

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

                    await _checkIfUserExistsById(payload.userId, systemCtx);

                    const userSessionId = (await sessionRepo.getData([`${SESSION_CACHE_HEADER}:${refreshToken}`]))[0];

                    if (!userSessionId) {
                        return res.status(401).send('Invalid session');
                    }

                    // We check if user agent is the same
                    if (payload.agent !== req.headers['user-agent']) {
                        return res.status(401).send('Invalid session');
                    }

                    await _generateAccessAndRefreshTokens(payload.userId, req.headers, res, systemCtx);

                    return res.status(200).json({});
                } catch (err) {
                    return next(err);
                }
            });
        },
        async validateRequestToken({apiKey, headers, cookies}, res) {
            try {
                const systemCtx = getSystemQueryContext('validateToken');

                const accessToken = cookies?.[ACCESS_TOKEN_COOKIE_NAME];
                const refreshToken = cookies?.[REFRESH_TOKEN_COOKIE_NAME];

                // edge case: throw an error if a user provide an apiKey with a cookie
                if ((accessToken || refreshToken) && apiKey) {
                    throw new AuthenticationError(
                        'Cannot use both API key and cookie-based authentication simultaneously. ' +
                            'Please use either an API key or session cookies, not both.',
                    );
                }

                const getUserGroups = async (uid: string): Promise<string[]> => {
                    const userGroups = (await valueDomain.getValues({
                        library: USERS_LIBRARY,
                        recordId: uid,
                        attribute: USERS_GROUP_ATTRIBUTE_NAME,
                        ctx: systemCtx,
                    })) as ITreeValue[];
                    return userGroups.map(g => g.payload?.id);
                };

                let userId: string;
                let groupsId: string[];

                if (accessToken) {
                    try {
                        const payload = jwt.verify(accessToken, config.auth.key) as IAccessTokenPayload;
                        userId = payload.userId;
                        if (!userId) {
                            throw new AuthenticationError('Invalid accessToken');
                        }
                        groupsId = payload.groupsId;
                    } catch (e: any) {
                        // We could have a time race condition here, there is a delta between the time the token is signed and the time the cookie is created
                        // We could end up with a token expired (from jwt) but not yet from the cookie
                        // To avoid this, we check if the error is a token expired error, and if so, we regenerate the tokens
                        if (e.name === 'TokenExpiredError' && refreshToken) {
                            const refreshPayload = await _verifyRefreshToken(refreshToken, headers);
                            await _generateAccessAndRefreshTokens(refreshPayload.userId, headers, res, systemCtx);
                            userId = refreshPayload.userId;
                            groupsId = await getUserGroups(userId);
                        } else {
                            throw new AuthenticationError('Invalid accessToken');
                        }
                    }
                } else if (refreshToken) {
                    const payload = await _verifyRefreshToken(refreshToken, headers);
                    await _generateAccessAndRefreshTokens(payload.userId, headers, res, systemCtx);
                    userId = payload.userId;
                    groupsId = await getUserGroups(userId);
                } else {
                    if (!apiKey) {
                        throw new AuthenticationError('No api key provided');
                    }

                    const apiKeyData = await apiKeyDomain.validateApiKey({apiKey, ctx: systemCtx});

                    const hasExpired = apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date();
                    if (hasExpired) {
                        throw new AuthenticationError('API key expired');
                    }

                    userId = apiKeyData.userId;
                    groupsId = await getUserGroups(userId);
                }

                await _checkIfUserExistsById(userId, systemCtx);

                return {
                    userId,
                    groupsId,
                };
            } catch (err) {
                config.auth.debugLog && logger.error(`Auth validateRequestToken error ${err.stack}`);
                throw err;
            }
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
                queryId,
            });
            config.auth.debugLog && logger.debug('Redirecting to OIDC login url', {oidcLoginUrl});

            return res.redirect(oidcLoginUrl);
        },
    };
}
