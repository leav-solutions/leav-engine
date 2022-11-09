// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUserDomain} from 'domain/user/userDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {Express, NextFunction, Request, Response} from 'express';
import {IValueRepo} from 'infra/value/valueRepo';
import jwt, {Algorithm} from 'jsonwebtoken';
import ms from 'ms';
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IStandardValue} from '_types/value';
import AuthenticationError from '../../errors/AuthenticationError';
import {ACCESS_TOKEN_COOKIE_NAME} from '../../_types/auth';
import {AttributeCondition, IRecord} from '../../_types/record';
import useragent from 'express-useragent';

export interface IAuthApp {
    getGraphQLSchema(): IAppGraphQLSchema;
    validateRequestToken(authorization: string, cookies?: []): Promise<jwt.JwtPayload>;
    registerRoute(app: Express): void;
}

interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.infra.value'?: IValueRepo;
    'core.domain.record'?: IRecordDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.user'?: IUserDomain;
    config?: IConfig;
}

export default function({
    'core.domain.value': valueDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.user': userDomain = null,
    config = null
}: IDeps = {}): IAuthApp {
    return {
        getGraphQLSchema(): IAppGraphQLSchema {
            return {
                typeDefs: `
                    extend type Query {
                        me: User
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
            app.post(
                '/auth/authenticate',
                async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
                    try {
                        const {login, password} = req.body as any;

                        if (typeof login === 'undefined' || typeof password === 'undefined') {
                            return res.status(401).send('Missing credentials');
                        }

                        // Get user id
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

                        // Check password
                        const user = users.list[0];
                        const userPwd: IStandardValue[] = await valueDomain.getValues({
                            library: 'users',
                            recordId: user.id,
                            attribute: 'password',
                            ctx
                        });

                        const isValidPwd = await bcrypt.compare(password, userPwd[0].raw_value);
                        if (!isValidPwd) {
                            return res.status(401).send('Invalid credentials');
                        }

                        // get groups node id
                        const groupsId = (
                            await valueDomain.getValues({
                                library: 'users',
                                recordId: user.id,
                                attribute: 'user_groups',
                                ctx
                            })
                        ).map(g => g.value.id);

                        const tokenExpiration = String(config.auth.tokenExpiration);

                        // Generate token
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                login: user.login,
                                role: 'admin',
                                groupsId
                            },
                            config.auth.key,
                            {
                                algorithm: config.auth.algorithm as Algorithm,
                                expiresIn: tokenExpiration
                            }
                        );

                        // We need the milliseconds value to set cookie expiration
                        // ms is the package used by jsonwebtoken under the hood, hence we're sure the value is same
                        const cookieExpires = ms(tokenExpiration);
                        res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
                            httpOnly: true,
                            sameSite: config.auth.cookie.sameSite,
                            secure: config.auth.cookie.secure,
                            domain: req.headers.host,
                            expires: new Date(Date.now() + cookieExpires)
                        });

                        return res.status(200).json({
                            token
                        });
                    } catch (err) {
                        next(err);
                    }
                }
            );

            app.post(
                '/auth/logout',
                (req: Request, res: Response): Response => {
                    res.cookie(ACCESS_TOKEN_COOKIE_NAME, '', {
                        expires: new Date(0),
                        httpOnly: true,
                        sameSite: config.auth.cookie.sameSite,
                        secure: config.auth.cookie.secure,
                        domain: req.headers.host
                    });

                    return res.status(200).end();
                }
            );

            app.post(
                '/auth/password-forgotten',
                async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
                    try {
                        const {mail} = req.body as any;
                        const ua = useragent.parse(req.headers['user-agent']);

                        if (typeof mail === 'undefined') {
                            return res.status(401).send('Missing mail');
                        }

                        // TODO: add lang to context
                        // Get user id
                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'password-forgotten'
                        };

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'email', condition: AttributeCondition.EQUAL, value: mail}]
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
                                mail: user.email
                            },
                            config.auth.key,
                            {
                                algorithm: config.auth.algorithm as Algorithm,
                                expiresIn: String(config.auth.resetPasswordExpiration)
                            }
                        );

                        await userDomain.sendResetPasswordEmail(user.email, token, user.login, ua.browser, ua.os);

                        return res.sendStatus(200);
                    } catch (err) {
                        next(err);
                    }
                }
            );
        },
        async validateRequestToken(authorization: string, cookies?: {}): Promise<jwt.JwtPayload> {
            let token = cookies?.[ACCESS_TOKEN_COOKIE_NAME];

            // In development, we allow token to be passed in the header instead of the cookie
            // (for easier testing and tooling)
            if (!token && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
                token = authorization;
            }

            if (!token) {
                throw new AuthenticationError('No token provided');
            }

            // Token validation checking
            const payload = jwt.verify(token, config.auth.key) as jwt.JwtPayload;

            if (typeof payload.userId === 'undefined') {
                throw new AuthenticationError('Invalid token');
            }

            const ctx: IQueryInfos = {
                userId: '0',
                queryId: 'validateToken'
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

            return payload;
        }
    };
}
