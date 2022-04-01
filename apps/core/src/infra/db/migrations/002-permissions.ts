// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import moment from 'moment';
import {IMigration} from '_types/migration';
import {AttributeTypes} from '../../../_types/attribute';
import {collectionTypes, IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists('core_permissions'))) {
                await dbService.createCollection('core_permissions');
            }
            const userGroupsLibKey = 'users_groups';
            const userGroupsTreeKey = 'users_groups';
            const userGroupsAttrKey = 'user_groups';

            // Create user groups library, required for permissions
            const checkLibExists = await dbService.execute({
                query: aql`
                    FOR t IN core_libraries
                        FILTER t._key == ${userGroupsLibKey}
                    RETURN t._key
                `,
                ctx
            });
            if (!checkLibExists.length) {
                const libAttributes = [
                    {id: 'id'},
                    {id: 'created_at'},
                    {id: 'created_by'},
                    {id: 'modified_at'},
                    {id: 'modified_by'}
                ];

                const userGroupsLibParams = {
                    _key: userGroupsLibKey,
                    system: true,
                    label: {fr: "Groupes d'utilisateurs", en: 'Users groups'}
                };

                if (!(await dbService.collectionExists(userGroupsLibKey))) {
                    await dbService.createCollection(userGroupsLibKey);
                }

                const libCollec = dbService.db.collection('core_libraries');
                const libRes = await dbService.execute({
                    query: aql`INSERT ${userGroupsLibParams} IN ${libCollec} RETURN NEW`,
                    ctx
                });

                const query = aql`
                    FOR attr IN ${libAttributes.map(attr => attr.id)}
                        LET attrToInsert = {
                            _from: ${'core_libraries/' + userGroupsLibKey},
                            _to: CONCAT('core_attributes/', attr)
                        }
                        UPSERT {
                            _from: ${'core_libraries/' + userGroupsLibKey},
                            _to: CONCAT('core_attributes/', attr)
                        }
                        INSERT attrToInsert
                        UPDATE attrToInsert
                        IN 'core_edge_libraries_attributes'
                        RETURN NEW
                `;

                const libAttribRes = await dbService.execute({query, ctx});
            }

            // Create user categories tree, required for permissions
            const checkTreeExists = await dbService.execute({
                query: aql`
                    FOR t IN core_trees
                        FILTER t._key == ${userGroupsTreeKey}
                    RETURN t._key
                `,
                ctx
            });

            if (!checkTreeExists.length) {
                await dbService.execute({
                    query: aql`INSERT {
                            _key: ${userGroupsTreeKey},
                            label: {
                            fr: "Groupes d'utilisateurs",
                            en: 'Users groups'
                            },
                            libraries: [
                                ${userGroupsLibKey}
                            ],
                            'system': true
                        } IN core_trees`,
                    ctx
                });

                const edgeCollecName = `core_edge_tree_${userGroupsTreeKey}`;
                if (!(await dbService.collectionExists(edgeCollecName))) {
                    await dbService.createCollection(edgeCollecName, collectionTypes.EDGE);
                }

                // Add root element "all users"
                const usersGroupsLibCollec = dbService.db.collection(userGroupsLibKey);
                const rootElem = await dbService.execute({
                    query: aql`
                        INSERT {
                            created_at: ${moment().unix()},
                            modified_at: ${moment().unix()},
                            created_by: '1',
                            modified_by: '1'
                        } IN ${usersGroupsLibCollec}
                        RETURN NEW
                    `,
                    ctx
                });

                const usersGroupsEdgeCollec = dbService.db.collection(edgeCollecName);
                await dbService.execute({
                    query: aql`INSERT {
                            _from: ${'core_trees/' + userGroupsTreeKey},
                            _to: ${'users_groups/' + rootElem[0]._key}
                        } IN ${usersGroupsEdgeCollec}`,
                    ctx
                });
            }

            // Create "users group" tree attribute and add it to users library
            const checkAttributexists = await dbService.execute({
                query: aql`
                    FOR t IN core_attributes
                        FILTER t._key == ${userGroupsAttrKey}
                    RETURN t._key
                `,
                ctx
            });
            if (!checkAttributexists.length) {
                const attrParams = {
                    _key: userGroupsAttrKey,
                    system: true,
                    label: {fr: "Groupes de l'utilisateur", en: 'User groups'},
                    type: AttributeTypes.TREE,
                    linked_tree: userGroupsTreeKey
                };

                // Insert in libraries collection
                const col = dbService.db.collection('core_attributes');
                const res = await dbService.execute({query: aql`INSERT ${attrParams} IN ${col} RETURN NEW`, ctx});

                await dbService.execute({
                    query: aql`
                        LET attrToInsert = {
                            _from: 'core_libraries/users',
                            _to: ${'core_attributes/' + userGroupsAttrKey}
                        }
                        UPSERT {
                            _from: 'core_libraries/users',
                            _to: ${'core_attributes/' + userGroupsAttrKey}
                        }
                        INSERT attrToInsert
                        UPDATE attrToInsert
                        IN 'core_edge_libraries_attributes'
                        RETURN NEW
                    `,
                    ctx
                });
            }
        }
    };
}
