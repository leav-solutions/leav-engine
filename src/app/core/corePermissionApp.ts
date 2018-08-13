import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IUtils} from 'utils/utils';
import {IPermission, RecordPermissionsActions, PermissionsRelations, PermissionTypes} from '../../_types/permissions';
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
                        ${Object.keys(PermissionsRelations).join(' ')}
                    }

                    enum PermissionTypes {
                        ${Object.keys(PermissionTypes).join(' ')}
                    }

                    enum RecordPermisisons {
                        ${Object.keys(RecordPermissionsActions).join(' ')}
                    }

                    type PermissionAction {
                        name: RecordPermisisons
                        allowed: Boolean
                    }

                    input PermissionActionInput {
                        name: RecordPermisisons!,
                        allowed: Boolean!
                    }

                    type TreePermissionsConf {
                        permissionTreeAttributes: [ID],
                        relation: PermissionsRelation
                    }

                    input TreePermissionsConfInput {
                        permissionTreeAttributes: [ID]!,
                        relation: PermissionsRelation!
                    }

                    type PermissionsTreeTarget {
                        tree: ID,
                        library: ID,
                        id: ID
                    }

                    input PermissionsTreeTargetInput {
                        tree: ID!,
                        library: ID!,
                        id: ID!
                    }

                    type Permission {
                        type: PermissionTypes,
                        applyTo: ID,
                        usersGroup: ID,
                        actions: [PermissionAction],
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
                        permission(
                            type: PermissionTypes!,
                            applyTo: ID,
                            action: RecordPermisisons!,
                            usersGroup: ID!,
                            permissionTreeTarget: PermissionsTreeTargetInput
                        ): Boolean
                    }

                    extend type Mutation {
                        savePermission(permission: PermissionInput): Permission
                    }
                `,
                resolvers: {
                    Query: {
                        async permission(_, {type, applyTo, action, usersGroup, permissionTreeTarget}) {
                            return permissionDomain.getSimplePermission(
                                type,
                                applyTo,
                                action,
                                usersGroup,
                                permissionTreeTarget
                            );
                        }
                    },
                    Mutation: {
                        async savePermission(parent, {permission}): Promise<IPermission> {
                            const formattedPerm = {
                                ...permission,
                                actions: permission.actions.reduce((permActions, action) => {
                                    permActions[action.name] = action.allowed;
                                    return permActions;
                                }, {})
                            };

                            const savedPerm = await permissionDomain.savePermission(formattedPerm);

                            return _formatPerm(savedPerm);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
