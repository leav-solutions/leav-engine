import {IRecord} from '_types/record';
import * as bcrypt from 'bcrypt';
import {badData, unauthorized} from '@hapi/boom';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {Server} from '@hapi/hapi';
import * as jwt from 'jsonwebtoken';
import * as winston from 'winston';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface IAuthApp {
    registerRoute(server: Server): void;
    validateToken(tokenPayload: any): Promise<boolean>;
    getGraphQLSchema(): IAppGraphQLSchema;
}

export default function(
    valueDomain: IValueDomain,
    recordDomain: IRecordDomain,
    graphqlApp: IGraphqlApp,
    logger: winston.Winston,
    config: any
): IAuthApp {
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
                        async me(parent, args, {auth}, info): Promise<IRecord> {
                            const queryFields = graphqlApp.getQueryFields(info);

                            const users = await recordDomain.find('users', {id: auth.userId}, queryFields);

                            return users[0];
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
                    try {
                        const users = await recordDomain.find('users', {login});

                        if (!users.length) {
                            return unauthorized('Invalid credentials');
                        }

                        // Check password
                        const user = users[0];
                        const userPwd = await valueDomain.getValues('users', user.id, 'password');
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
                    return 'OK';
                }
            });
        },
        async validateToken(tokenPayload: any): Promise<boolean> {
            // Get user by id
            if (!tokenPayload.userId) {
                return false;
            }
            const users = await recordDomain.find('users', {id: tokenPayload.userId});
            return !!users.length;
        }
    };
}
