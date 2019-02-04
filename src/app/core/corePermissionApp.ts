import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IHeritedPermissionDomain} from 'domain/permission/heritedPermissionDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IRecordPermissionDomain} from 'domain/permission/recordPermissionDomain';
import {ITreePermissionDomain} from 'domain/permission/treePermissionDomain';
import {IUtils} from 'utils/utils';
import {
    AdminPermissionsActions,
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
    permissionDomain: IPermissionDomain,
    treePermissionDomain: ITreePermissionDomain,
    recordPermissionDomain: IRecordPermissionDomain,
    attributeDomain: IAttributeDomain,
    heritedPermissionDomain: IHeritedPermissionDomain
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
                        ${Object.values(AdminPermissionsActions).join(' ')}
                    }

                    type HeritedPermissionAction {
                        name: PermissionsActions!
                        allowed: Boolean!
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
                        permissionTreeAttributes: [Attribute!]!,
                        relation: PermissionsRelation!
                    }

                    input TreePermissionsConfInput {
                        permissionTreeAttributes: [ID!]!,
                        relation: PermissionsRelation!
                    }

                    # If id and library are not specified, permission will apply to tree root
                    type PermissionsTreeTarget {
                        tree: ID!,
                        library: ID,
                        id: ID
                    }

                    # If id and library are not specified, permission will apply to tree root
                    input PermissionsTreeTargetInput {
                        tree: ID!,
                        library: ID,
                        id: ID
                    }

                    # A "null" users groups means this permission applies at root level. A "null" on tree target's
                    # id for tree-based permission means it applies to root level on this tree.
                    type Permission {
                        type: PermissionTypes!,
                        applyTo: ID,
                        usersGroup: ID,
                        actions: [PermissionAction!]!,
                        permissionTreeTarget: PermissionsTreeTarget
                    }

                    # If users group is not specified, permission will be saved at root level.
                    # If saving a tree-based permission (record or attribute) and tree target's id is not specified,
                    # permission will be saved at root level for any element of the tree.
                    input PermissionInput {
                        type: PermissionTypes!,
                        applyTo: ID,
                        usersGroup: ID,
                        actions: [PermissionActionInput!]!,
                        permissionTreeTarget: PermissionsTreeTargetInput
                    }

                    extend type Query {
                        permissions(
                            type: PermissionTypes!,
                            applyTo: ID,
                            actions: [PermissionsActions!]!,
                            usersGroup: ID!,
                            permissionTreeTarget: PermissionsTreeTargetInput
                        ): [PermissionAction!],
                        heritedPermissions(
                            type: PermissionTypes!,
                            applyTo: ID,
                            actions: [PermissionsActions!]!,
                            userGroupId: ID!,
                            permissionTreeTarget: PermissionsTreeTargetInput
                        ): [HeritedPermissionAction!]
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
                        },
                        async heritedPermissions(_, {type, applyTo, actions, userGroupId, permissionTreeTarget}) {
                            return Promise.all(
                                actions.map(async action => {
                                    const perm = await heritedPermissionDomain.getHeritedPermissions(
                                        type,
                                        applyTo,
                                        action,
                                        userGroupId,
                                        permissionTreeTarget
                                    );

                                    return {name: action, allowed: perm};
                                })
                            );
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
                    },
                    TreePermissionsConf: {
                        permissionTreeAttributes(parent) {
                            return parent.permissionTreeAttributes
                                ? Promise.all(
                                      parent.permissionTreeAttributes.map(attrId =>
                                          attributeDomain.getAttributeProperties(attrId)
                                      )
                                  )
                                : [];
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
