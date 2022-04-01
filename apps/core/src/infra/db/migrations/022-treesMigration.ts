// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IMigration} from '_types/migration';
import {VALUES_LINKS_COLLECTION} from '../../../infra/record/recordRepo';
import {
    getEdgesCollectionName,
    getFullNodeId,
    getNodesCollectionName,
    getRootId
} from '../../../infra/tree/helpers/utils';
import {ITreeRepo, MAX_TREE_DEPTH, TO_RECORD_PROP_NAME} from '../../../infra/tree/treeRepo';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {IDbService} from '../dbService';
import {IDbDocument, IDbEdge} from '../_types';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.tree'?: ITreeRepo;
}

export default function ({
    'core.infra.tree': treeRepo = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.db.dbService': dbService = null
}: IDeps): IMigration {
    return {
        async run(ctx) {
            /** Migrate trees */
            // Get all trees
            const trees = await treeRepo.getTrees({ctx});

            await Promise.all(
                trees.list.map(async tree => {
                    const nodesCollection = getNodesCollectionName(tree.id);
                    const edgesCollection = getEdgesCollectionName(tree.id);

                    if (!(await dbService.collectionExists(nodesCollection))) {
                        await dbService.createCollection(nodesCollection);
                    }

                    if (!(await dbService.collectionExists(edgesCollection))) {
                        await dbService.createCollection(edgesCollection);
                    }

                    // Get all elements
                    const rootId = getRootId(tree.id);
                    const nodeCollecName = getNodesCollectionName(tree.id);
                    const nodeCollec = dbService.db.collection(nodeCollecName);
                    const edgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(tree.id));
                    const edges: IDbEdge[] = await dbService.execute({
                        query: aql`
                            FOR v, e, p IN 1..${MAX_TREE_DEPTH} OUTBOUND ${rootId}
                            ${edgeCollec}
                            OPTIONS {bfs: true}
                            RETURN e
                        `,
                        ctx
                    });

                    const processedEdges = [];
                    const nodesMapping: {[oldNodeId: string]: string} = {};
                    for (const edge of edges) {
                        const [fromCollection] = edge._from.split('/');
                        const [toCollection] = edge._to.split('/');

                        if (
                            processedEdges.includes(edge._key) ||
                            fromCollection === nodeCollecName ||
                            (edge._from === rootId && toCollection === nodeCollecName)
                        ) {
                            continue;
                        }

                        let nodeEntity: IDbDocument;

                        // Create a node entity
                        if (tree.id === 'users_groups') {
                            nodeEntity = (
                                await dbService.execute({
                                    query: aql`INSERT {_key: '1'} IN ${nodeCollec} RETURN NEW`,
                                    ctx
                                })
                            )[0];
                        } else {
                            nodeEntity = (
                                await dbService.execute({
                                    query: aql`INSERT {} IN ${nodeCollec} RETURN NEW`,
                                    ctx
                                })
                            )[0];
                        }

                        nodesMapping[edge._to] = nodesMapping[edge._to] ?? nodeEntity._id;

                        // Link this entity to the record
                        const toRecordEdgeData = {
                            _from: nodeEntity._id,
                            _to: edge._to,
                            [TO_RECORD_PROP_NAME]: true
                        };
                        await dbService.execute({
                            query: aql`INSERT ${toRecordEdgeData} IN ${edgeCollec} RETURN NEW`,
                            ctx
                        });

                        // Add this entity to the tree instead
                        const newTreeEdgeData: IDbEdge = {
                            ...edge,
                            _from: edge._from === rootId ? rootId : nodesMapping[edge._from],
                            _to: nodeEntity._id,
                            [TO_RECORD_PROP_NAME]: false
                        };
                        await dbService.execute({
                            query: aql`UPDATE {_key: ${edge._key}} WITH ${newTreeEdgeData} IN ${edgeCollec}`,
                            ctx
                        });

                        processedEdges.push(edge._key);
                    }
                })
            );

            /** Migrate permissions */

            // Get all permissions
            const permissionsCollec = dbService.db.collection('core_permissions');
            const permissions = await dbService.execute({
                query: aql`FOR p in ${permissionsCollec} RETURN p`,
                ctx
            });

            const newPermissions = await Promise.all(
                permissions.map(async p => {
                    const newPerm = {...p};

                    if (p.usersGroup) {
                        const [userGroupLibrary, userGroupId] = p.usersGroup.split('/');

                        if (userGroupLibrary && userGroupId) {
                            newPerm.usersGroup = p.usersGroup
                                ? (
                                      await treeRepo.getNodesByRecord({
                                          treeId: 'users_groups',
                                          record: {library: userGroupLibrary, id: userGroupId},
                                          ctx
                                      })
                                  )?.[0] ?? null
                                : null;
                        }
                    }

                    if (p.permissionTreeTarget?.id && p.permissionTreeTarget?.tree) {
                        const [permTreeTargetLibrary, permTreeTargetId] = p.permissionTreeTarget.id.split('/');

                        if (permTreeTargetLibrary && permTreeTargetId) {
                            newPerm.permissionTreeTarget = {
                                ...p.permissionTreeTarget,
                                id:
                                    (
                                        await treeRepo.getNodesByRecord({
                                            treeId: p.permissionTreeTarget.tree,
                                            record: {library: permTreeTargetLibrary, id: permTreeTargetId},
                                            ctx
                                        })
                                    )?.[0] ?? null
                            };
                        }
                    }

                    return newPerm;
                })
            );

            await Promise.all(
                newPermissions.map(async perm => {
                    await dbService.execute({
                        query: aql`UPDATE {_key: ${perm._key}} WITH ${perm} IN ${permissionsCollec}`,
                        ctx
                    });
                })
            );

            /** Migrate tree attributes values */
            const valuesLinksCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);
            const treeAttributes = await attributeRepo.getAttributes({
                params: {filters: {type: [AttributeTypes.TREE]}},
                ctx
            });
            const treeAttributesHashmap: {[id: string]: IAttribute} = treeAttributes.list.reduce((acc, cur) => {
                acc[cur.id] = cur;
                return acc;
            }, {});

            await Promise.all(
                treeAttributes.list.map(async attribute => {
                    const values = await dbService.execute({
                        query: aql`FOR v in ${valuesLinksCollec} FILTER v.attribute == ${attribute.id} RETURN v`,
                        ctx
                    });

                    await Promise.all(
                        values.map(async val => {
                            const [library, id] = val._to.split('/');
                            const nodes = await treeRepo.getNodesByRecord({
                                treeId: attribute.linked_tree,
                                record: {
                                    library,
                                    id
                                },
                                ctx
                            });

                            if (nodes.length) {
                                const newVal = {
                                    ...val,
                                    _to: getFullNodeId(nodes[0], attribute.linked_tree)
                                };

                                await dbService.execute({
                                    query: aql`UPDATE {_key: ${val._key}} WITH ${newVal} IN ${valuesLinksCollec} RETURN NEW`,
                                    ctx
                                });
                            }
                        })
                    );
                })
            );

            /** Migrate values versions */
            const values = await dbService.execute({
                query: aql`FOR v in ${valuesLinksCollec} FILTER v.version != null RETURN v`,
                ctx
            });

            await Promise.all(
                values.map(async val => {
                    const newValVersion = await Object.keys(val.version).reduce(async (newVersionsProm, treeId) => {
                        const newVersions = await newVersionsProm;

                        const [library, id] = val.version[treeId].split('/');
                        const nodes = await treeRepo.getNodesByRecord({treeId, record: {library, id}, ctx});

                        if (!nodes.length) {
                            return newVersions;
                        }

                        newVersions[treeId] = nodes[0];

                        return newVersions;
                    }, Promise.resolve({}));

                    const newVal = {
                        ...val,
                        version: newValVersion
                    };

                    await dbService.execute({
                        query: aql`UPDATE {_key: ${val._key}} WITH ${newVal} IN ${valuesLinksCollec} RETURN NEW`,
                        ctx
                    });
                })
            );
        }
    };
}
