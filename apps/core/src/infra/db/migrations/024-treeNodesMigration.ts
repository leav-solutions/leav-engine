// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {getEdgesCollectionName, getNodesCollectionName} from '../../tree/helpers/utils';
import {ITreeRepo} from '../../tree/treeRepo';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.tree'?: ITreeRepo;
}

export default function ({
    'core.infra.tree': treeRepo = null,
    'core.infra.db.dbService': dbService = null
}: IDeps): IMigration {
    return {
        async run(ctx) {
            /** Migrate trees */
            // Get all trees
            const trees = await treeRepo.getTrees({ctx});

            await Promise.all(
                trees.list.map(async tree => {
                    const nodesCollection = dbService.db.collection(getNodesCollectionName(tree.id));
                    const edgesCollection = dbService.db.edgeCollection(getEdgesCollectionName(tree.id));

                    // On each node, set libraryId and recordId from linked record
                    await dbService.execute({
                        query: aql`
                            FOR n in ${nodesCollection}
                                FILTER n.libraryId == null && n.recordId == null

                                LET edgeToRecord = FIRST(
                                    FOR v, e IN 1 OUTBOUND n._id
                                        ${edgesCollection}
                                        FILTER e.toRecord
                                        RETURN e
                                )

                                LET recId = PARSE_IDENTIFIER(edgeToRecord._to).key
                                LET lib = PARSE_IDENTIFIER(edgeToRecord._to).collection

                                UPDATE n WITH {
                                    libraryId: lib,
                                    recordId: recId
                                } IN ${nodesCollection} OPTIONS { mergeObjects: true }
                            `,
                        ctx
                    });

                    // Delete edges "toRecord", they're useless now
                    await dbService.execute({
                        query: aql`
                                FOR e IN ${edgesCollection}
                                FILTER e.toRecord
                                REMOVE e IN ${edgesCollection}
                            `,
                        ctx
                    });

                    // Add an index on nodes collection
                    await nodesCollection.ensureIndex({
                        fields: ['libraryId', 'recordId'],
                        sparse: true,
                        type: 'persistent'
                    });
                })
            );
        }
    };
}
