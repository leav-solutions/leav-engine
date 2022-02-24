// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IAppGraphQLSchema} from '_types/graphql';
import {IAppModule} from '_types/shared';
import {
    ILabeledPermissionsAction,
    IPermission,
    ITreePermissionsConf,
    PermissionsRelations,
    PermissionTypes
} from '../../../_types/permissions';
import {IInheritedPermissionsQueryParams} from './_types';

export interface IPluginPermission {
    name: string;
    type: PermissionTypes;
    applyOn?: string[];
}

export interface ICorePermissionApp extends IAppModule {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.attribute'?: IAttributeDomain;
}

export default function ({
    'core.domain.permission': permissionDomain = null,
    'core.domain.attribute': attributeDomain = null
}: IDeps = {}): ICorePermissionApp {
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

    /**
     * Return all possibles permissions actions, deduplicated, including plugins actions
     */
    const _graphqlActionsList = (): string => {
        const actions = Object.values(PermissionTypes).reduce((acc, type): string[] => {
            return [...acc, ...permissionDomain.getActionsByType({type, skipApplyOn: true}).map(a => a.name)];
        }, []);

        return [...new Set(actions)].join(' ');
    };

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

                    enum PermissionsActions{
                        ${_graphqlActionsList()}
                    }

                    type LabeledPermissionsActions {
                        name: PermissionsActions!,
                        label: SystemTranslation
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

                    type Treepermissions_conf {
                        permissionTreeAttributes: [Attribute!]!,
                        relation: PermissionsRelation!
                    }

                    input Treepermissions_confInput {
                        permissionTreeAttributes: [ID!]!,
                        relation: PermissionsRelation!
                    }

                    # If id and library are not specified, permission will apply to tree root
                    type PermissionsTreeTarget {
                        tree: ID!,
                        nodeId: ID
                    }

                    # If id and library are not specified, permission will apply to tree root
                    input PermissionsTreeTargetInput {
                        tree: ID!,
                        nodeId: ID
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

                    # Element on which we want to retrieve record or attribute permission. Record ID is mandatory,
                    # attributeId is only required for attribute permission
                    # libraryId and recordId are mandatory for tree node permission
                    input PermissionTarget {
                        attributeId: ID,
                        recordId: ID,
                        libraryId: ID,
                        nodeId: ID
                    }

                    extend type Query {
                        # Return permissions (applying heritage) for current user
                        isAllowed(
                            type: PermissionTypes!,
                            applyTo: ID,
                            actions: [PermissionsActions!]!,
                            target: PermissionTarget
                        ): [PermissionAction!],

                        # Return saved permissions (no heritage) for given user group
                        permissions(
                            type: PermissionTypes!,
                            applyTo: ID,
                            actions: [PermissionsActions!]!,
                            usersGroup: ID,
                            permissionTreeTarget: PermissionsTreeTargetInput
                        ): [PermissionAction!],

                        # Return inherited permissions only for given user group
                        inheritedPermissions(
                            type: PermissionTypes!,
                            applyTo: ID,
                            actions: [PermissionsActions!]!,
                            userGroupNodeId: ID,
                            permissionTreeTarget: PermissionsTreeTargetInput
                        ): [HeritedPermissionAction!]

                        permissionsActionsByType(type: PermissionTypes!, applyOn: String): [LabeledPermissionsActions!]!
                    }

                    extend type Mutation {
                        savePermission(permission: PermissionInput): Permission!
                    }
                `,
                resolvers: {
                    Query: {
                        async isAllowed(_, {type, applyTo, actions, target}, ctx) {
                            const {userId} = ctx;

                            return Promise.all(
                                actions.map(async action => {
                                    const perm = await permissionDomain.isAllowed({
                                        type,
                                        action,
                                        userId,
                                        applyTo,
                                        target,
                                        ctx
                                    });

                                    return {name: action, allowed: perm};
                                })
                            );
                        },
                        async permissions(_, {type, applyTo, actions, usersGroup, permissionTreeTarget}, ctx) {
                            const perms = await permissionDomain.getPermissionsByActions({
                                type,
                                applyTo,
                                actions,
                                usersGroupNodeId: usersGroup,
                                permissionTreeTarget,
                                ctx
                            });

                            return Object.keys(perms).reduce((permByActions, action) => {
                                permByActions.push({name: action, allowed: perms[action]});
                                return permByActions;
                            }, []);
                        },
                        async inheritedPermissions(
                            _,
                            {
                                type,
                                applyTo,
                                actions,
                                userGroupNodeId,
                                permissionTreeTarget
                            }: IInheritedPermissionsQueryParams,
                            ctx
                        ) {
                            return Promise.all(
                                actions.map(async action => {
                                    const perm = await permissionDomain.getInheritedPermissions({
                                        type,
                                        applyTo,
                                        action,
                                        userGroupId: userGroupNodeId,
                                        permissionTreeTarget,
                                        ctx
                                    });

                                    return {name: action, allowed: perm};
                                })
                            );
                        },
                        permissionsActionsByType(
                            _,
                            {type, applyOn}: {type: PermissionTypes; applyOn?: string}
                        ): ILabeledPermissionsAction[] {
                            return permissionDomain.getActionsByType({type, applyOn});
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

                            const savedPerm = await permissionDomain.savePermission(formattedPerm, ctx);

                            return _formatPerm(savedPerm);
                        }
                    },
                    PermissionsActions: {
                        __resolveType(obj: IPermission) {
                            const typesMapping = {
                                [PermissionTypes.RECORD]: 'RecordPermisisons',
                                [PermissionTypes.RECORD_ATTRIBUTE]: 'AttributePermissions'
                            };

                            return typesMapping[obj.type];
                        }
                    },
                    Treepermissions_conf: {
                        permissionTreeAttributes(parent: ITreePermissionsConf, _, ctx) {
                            return parent.permissionTreeAttributes
                                ? Promise.all(
                                      parent.permissionTreeAttributes.map(attrId =>
                                          attributeDomain.getAttributeProperties({id: attrId, ctx})
                                      )
                                  )
                                : [];
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        extensionPoints: {
            registerPermissionActions(type: PermissionTypes, actions: string[], applyOn?: string[]) {
                permissionDomain.registerActions(type, actions, applyOn);
            }
        }
    };
}
