import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IUtils} from 'utils/utils';
import {
    AdminPermisisonsActions,
    AttributePermissionsActions,
    IPermission,
    PermissionsRelations,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICorePermissionApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    graphqlApp: IGraphqlApp,
    utils: IUtils,
    permissionDomain: IPermissionDomain
): ICorePermissionApp {
    // Format permission data to match graphql schema, where "actions" field format is different
    // TODO: use a custom scalar type?
    function _formatPerm(permData: IPermission): any {
        return {
            ...permData,
            actions: Object.keys(permData.actions).map(actionName => ({
                name: actionName,
                allowed: permData.actions[actionName]
            }))
        };
    }

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum PermissionsRelation {
                        ${Object.values(PermissionsRelations).join(' ')}
                    }

                    enum PermissionTypes {
                        ${Object.values(PermissionTypes).join(' ')}
                    }

                    enum PermissionsActions {
                        ${Object.values(RecordPermissionsActions).join(' ')}
                        ${Object.values(AttributePermissionsActions).join(' ')}
                        ${Object.values(AdminPermisisonsActions).join(' ')}
                    }

                    type PermissionAction {
                        name: PermissionsActions!
                        allowed: Boolean
                    }

                    input PermissionActionInput {
                        name: PermissionsActions!,
                        allowed: Boolean
                    }

                    type TreePermissionsConf {
                        permissionTreeAttributes: [ID!]!,
                        relation: PermissionsRelation!
                    }

                    input TreePermissionsConfInput {
                        permissionTreeAttributes: [ID]!,
                        relation: PermissionsRelation!
                    }

                    type PermissionsTreeTarget {
                        tree: ID!,
                        library: ID!,
                        id: ID!
                    }

                    input PermissionsTreeTargetInput {
                        tree: ID!,
                        library: ID!,
                        id: ID!
                    }

                    type Permission {
                        type: PermissionTypes!,
                        applyTo: ID,
                        usersGroup: ID!,
                        actions: [PermissionAction]!,
                        permissionTreeTarget: PermissionsTreeTarget
                    }

                    input PermissionInput {
                        type: PermissionTypes!,
                        applyTo: ID,
                        usersGroup: ID!,
                        actions: [PermissionActionInput]!,
                        permissionTreeTarget: PermissionsTreeTargetInput
                    }

                    extend type Query {
                        permissions(
                            type: PermissionTypes!,
                            applyTo: ID,
                            actions: [PermissionsActions!]!,
                            usersGroup: ID!,
                            permissionTreeTarget: PermissionsTreeTargetInput
                        ): [PermissionAction]
                    }

                    extend type Mutation {
                        savePermission(permission: PermissionInput): Permission!
                    }
                `,
                resolvers: {
                    Query: {
                        async permissions(_, {type, applyTo, actions, usersGroup, permissionTreeTarget}) {
                            const perms = await permissionDomain.getPermissionsByActions(
                                type,
                                applyTo,
                                actions,
                                usersGroup,
                                permissionTreeTarget
                            );

                            return Object.keys(perms).reduce((permByActions, action) => {
                                permByActions.push({name: action, allowed: perms[action]});
                                return permByActions;
                            }, []);
                        }
                    },
                    Mutation: {
                        async savePermission(parent, {permission}, ctx): Promise<IPermission> {
                            const formattedPerm = {
                                ...permission,
                                actions: permission.actions.reduce((permActions, action) => {
                                    permActions[action.name] = action.allowed;
                                    return permActions;
                                }, {})
                            };

                            const savedPerm = await permissionDomain.savePermission(
                                formattedPerm,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );

                            return _formatPerm(savedPerm);
                        }
                    },
                    PermissionsActions: {
                        __resolveType(obj: IPermission) {
                            const typesMapping = {
                                [PermissionTypes.RECORD]: 'RecordPermisisons',
                                [PermissionTypes.ATTRIBUTE]: 'AttributePermissions'
                            };

                            return typesMapping[obj.type];
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
