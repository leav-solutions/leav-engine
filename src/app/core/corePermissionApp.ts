import {IPermissionDomain} from 'domain/permissionDomain';
import {IUtils} from 'utils/utils';
import {IPermission} from '_types/permissions';
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
                        AND
                        OR
                    }

                    enum PermissionTypes {
                        RECORD
                    }

                    enum RecordPermisisons {
                        ACCESS
                        EDIT
                        DELETE
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
                        trees: [ID],
                        relation: PermissionsRelation
                    }

                    input TreePermissionsConfInput {
                        trees: [ID]!,
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
                        usersGroup: ID,
                        actions: [PermissionAction],
                        target: PermissionsTreeTarget
                    }

                    input PermissionInput {
                        type: PermissionTypes!,
                        usersGroup: ID!,
                        actions: [PermissionActionInput]!,
                        target: PermissionsTreeTargetInput
                    }

                    extend type Query {
                        permission(
                            type: PermissionTypes!,
                            action: RecordPermisisons!,
                            usersGroup: ID!,
                            target: PermissionsTreeTargetInput
                        ): Boolean
                    }

                    extend type Mutation {
                        savePermission(permission: PermissionInput): Permission
                    }
                `,
                resolvers: {
                    Query: {
                        async permission(_, {type, action, usersGroup, target}) {
                            return permissionDomain.getSimplePermission(type, action, usersGroup, target);
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
