import {badData, unauthorized} from '@hapi/boom';
import {Server} from '@hapi/hapi';
import * as bcrypt from 'bcryptjs';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import * as jwt from 'jsonwebtoken';
import * as winston from 'winston';
import {IRecord} from '_types/record';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {IQueryInfos} from '_types/queryInfos';

export interface IAuthApp {
    registerRoute(server: Server): void;
    validateToken(tokenPayload: any): Promise<boolean>;
    getGraphQLSchema(): IAppGraphQLSchema;
}

interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.domain.record'?: IRecordDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.utils.logger'?: winston.Winston;
    config?: any;
}

export default function({
    'core.domain.value': valueDomain = null,
    'core.domain.record': recordDomain = null,
    'core.app.graphql': graphqlApp = null,
    'core.utils.logger': logger = null,
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
                            const queryFields = graphqlApp.getQueryFields(info);

                            const users = await recordDomain.find({
                                params: {
                                    library: 'users',
                                    filters: [{field: 'id', value: ctx.userId}],
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
        registerRoute(server): void {
            server.route({
                method: 'POST',
                path: '/auth/authenticate',
                async handler(req) {
                    const {login, password} = req.payload as any;
                    if (typeof login === 'undefined' || typeof password === 'undefined') {
                        return badData('Missing credentials');
                    }
                    // Get user id
                    const ctx: IQueryInfos = {
                        userId: 0,
                        queryId: 'authenticate'
                    };
                    try {
                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'login', value: login}]
                            },
                            ctx
                        });

                        if (!users.list.length) {
                            return unauthorized('Invalid credentials');
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
                            return unauthorized('Invalid credentials');
                        }

                        // Generate token
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                login: user.login,
                                role: 'admin'
                            },
                            config.auth.key,
                            {
                                algorithm: config.auth.algorithm,
                                expiresIn: config.auth.tokenExpiration
                            }
                        );
                        return {
                            token
                        };
                    } catch (e) {
                        logger.error(e);
                        throw e;
                    }
                },
                options: {
                    auth: false,
                    cors: true
                }
            });
            server.route({
                method: 'GET',
                path: '/auth/test-token',
                handler: () => {
                    return {statusCode: 200, message: 'Valid token'};
                },
                options: {
                    cors: true
                }
            });
        },
        async validateToken(tokenPayload: any): Promise<boolean> {
            // Get user by id
            if (!tokenPayload.userId) {
                return false;
            }
            const ctx: IQueryInfos = {
                userId: 0,
                queryId: 'validateToken'
            };
            const users = await recordDomain.find({
                params: {
                    library: 'users',
                    filters: [{field: 'id', value: tokenPayload.userId}]
                },
                ctx
            });
            return !!users.list.length;
        }
    };
}
