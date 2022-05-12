// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {Express, NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {ACCESS_TOKEN_COOKIE_NAME} from '../../_types/auth';
import {AttributeCondition, IRecord} from '../../_types/record';

export interface IAuthApp {
    getGraphQLSchema(): IAppGraphQLSchema;
    validateRequestToken(req: Request): Promise<jwt.JwtPayload>;
    registerRoute(app: Express): void;
}

interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.domain.record'?: IRecordDomain;
    config?: any;
}

export default function ({
    'core.domain.value': valueDomain = null,
    'core.domain.record': recordDomain = null,
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
                            userId: '0',
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
                        const userPwd = await valueDomain.getValues({
                            library: 'users',
                            recordId: user.id,
                            attribute: 'password',
                            ctx
                        });

                        const isValidPwd = await bcrypt.compare(password, userPwd[0].value);
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
                                algorithm: config.auth.algorithm,
                                expiresIn: config.auth.tokenExpiration
                            }
                        );

                        res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
                            httpOnly: true,
                            sameSite: config.auth.cookie.sameSite,
                            secure: config.auth.cookie.secure,
                            domain: req.headers.host
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
                        sameSite: 'none',
                        domain: req.headers.host
                    });
                    return res.status(200).end();
                }
            );
        },
        async validateRequestToken(req: Request): Promise<jwt.JwtPayload> {
            let token = req.cookies[ACCESS_TOKEN_COOKIE_NAME];

            // In development, we allow token to be passed in the header instead of the cookie
            // (for easier testing and tooling)
            if (!token && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
                token = req.headers.authorization;
            }

            if (!token) {
                throw new Error('No token provided');
            }

            // Token validation checking
            const payload = jwt.verify(token, config.auth.key) as jwt.JwtPayload;

            if (typeof payload.userId === 'undefined') {
                throw new Error('invalid token');
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
                throw new Error('user not found');
            }

            return payload;
        }
    };
}
