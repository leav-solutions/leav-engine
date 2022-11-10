// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {i18n} from 'i18next';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IConfig} from '_types/config';
import {IMigration} from '_types/migration';
import getLibraryDefaultAttributes from '../../../utils/helpers/getLibraryDefaultAttributes';
import {FilesAttributes} from '../../../_types/filesManager';
import {LibraryBehavior} from '../../../_types/library';
import {ITreeRepo, NODE_COLLEC_PREFIX} from '../../tree/treeRepo';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.library'?: ILibraryRepo;
    translator?: i18n;
    config?: IConfig;
}

export default function ({
    'core.infra.tree': treeRepo = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.db.dbService': dbService = null,
    translator = null,
    config = null
}: IDeps): IMigration {
    return {
        async run(ctx) {
            // Get all libraries
            const libraries = await dbService.execute({
                query: aql`
                    FOR l IN core_libraries
                        RETURN l
                `,
                ctx
            });

            const filesLibraries = libraries.filter(l => l.behavior === 'files');

            // For each files libraries, create a directories library, add it to matching tree, convert directories
            // and clear "is_directory" flag
            for (const library of filesLibraries) {
                // Create directories library
                const directoriesLibraryId = library._key + '_directories';

                if (libraries.find(l => l._key === directoriesLibraryId)) {
                    continue;
                }

                if (!(await dbService.collectionExists(directoriesLibraryId))) {
                    await libraryRepo.createLibrary({
                        libData: {
                            id: directoriesLibraryId,
                            behavior: LibraryBehavior.DIRECTORIES,
                            label: config.lang.available.reduce((acc, lang) => {
                                acc[lang] = translator.t('files.directories', {lng: lang});
                                return acc;
                            }, {}),
                            system: false,
                            recordIdentityConf: {
                                label: FilesAttributes.FILE_NAME
                            }
                        },
                        ctx
                    });
                }

                await libraryRepo.saveLibraryAttributes({
                    libId: directoriesLibraryId,
                    attributes: getLibraryDefaultAttributes(LibraryBehavior.DIRECTORIES, directoriesLibraryId),
                    ctx
                });

                // Add directories library to files tree
                const treeId = library._key + '_tree';
                await dbService.execute({
                    query: aql`
                        FOR t IN core_trees
                            FILTER t._key == ${treeId}
                            UPDATE t WITH {
                                libraries: {
                                    ${library._key}: {
                                        "allowMultiplePositions": false,
                                        "allowedChildren": [],
                                        "allowedAtRoot": true
                                    },
                                    ${directoriesLibraryId}: {
                                        "allowMultiplePositions": false,
                                        "allowedChildren": [${library._key}, ${directoriesLibraryId}],
                                        "allowedAtRoot": true
                                    }
                                }
                            } IN core_trees
                    `,
                    ctx
                });

                // Convert directories in the tree: for each directory, create a record in the directories library
                // and link node to this record instead of previous record.
                // Then, delete old record
                const filesLibraryCollec = dbService.db.collection(library._key);
                const directoriesLibraryCollec = dbService.db.collection(directoriesLibraryId);
                const treeNodesCollec = dbService.db.collection(NODE_COLLEC_PREFIX + treeId);
                await dbService.execute({
                    query: aql`
                        FOR r IN ${filesLibraryCollec}
                            FILTER r.is_directory
                            LET directoryRecord = FIRST(INSERT r IN ${directoriesLibraryCollec} RETURN NEW)
                            FOR n IN ${treeNodesCollec}
                                FILTER n.recordId == r._key AND n.libraryId == ${library._key}
                                UPDATE n WITH {
                                    recordId: directoryRecord._key,
                                    libraryId: ${directoriesLibraryId}
                                } IN ${treeNodesCollec}
                            REMOVE r IN ${filesLibraryCollec}
                    `,
                    ctx
                });

                // Delete "is_directory" field from records
                await dbService.execute({
                    query: aql`
                        FOR r IN ${filesLibraryCollec}
                            UPDATE r WITH {
                                is_directory: null
                            } IN ${filesLibraryCollec} OPTIONS {keepNull: false}
                    `,
                    ctx
                });
            }

            // Delete "is_directory" attribute
            await dbService.execute({
                query: aql`
                    FOR e IN core_edge_libraries_attributes
                        FILTER e._to == "core_attributes/is_directory"
                        REMOVE e IN core_edge_libraries_attributes
                `,
                ctx
            });

            await dbService.execute({
                query: aql`
                    FOR a IN core_attributes
                        FILTER a._key == "is_directory"
                        REMOVE a IN core_attributes
                `,
                ctx
            });
        }
    };
}
