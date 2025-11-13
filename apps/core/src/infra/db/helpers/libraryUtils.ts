// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LIB_COLLECTION_NAME, type ILibraryRepo} from 'infra/library/libraryRepo';
import {type IDbService} from '../dbService';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAttributeForRepo, type IAttributeRepo} from 'infra/attribute/attributeRepo';
import {aql} from 'arangojs';
import {CollectionType} from 'arangojs/collection';
import {type ITree} from '_types/tree';
import {type Override} from '@leav/utils';
import {type ILibraryDbEvent} from '_types/library';
import {getNodesCollectionName} from 'infra/tree/helpers/utils';
import {ActionsListEvents} from '_types/actionsList';

export type MigrationLibraryToCreate = Override<
    ILibraryDbEvent,
    {
        attributes: string[];
        fullTextAttributes: string[];
    }
> & {_key: string};

export const commonAttributeData = {
    system: true,
    required: false,
    multiple_values: false,
    versions_conf: {versionable: false},
    readonly: false,
    actions_list: {
        [ActionsListEvents.GET_VALUE]: [],
        [ActionsListEvents.SAVE_VALUE]: [
            {
                id: 'validateFormat',
                name: 'Validate Format',
                is_system: true,
            },
        ],
        [ActionsListEvents.DELETE_VALUE]: [],
    },
};

export const createLibraries = async (
    libraries: MigrationLibraryToCreate[],
    dbService: IDbService,
    libraryRepo: ILibraryRepo,
    ctx: IQueryInfos,
) => {
    for (const lib of libraries) {
        // Check if library already exists
        const libsCollec = await dbService.db.collection(LIB_COLLECTION_NAME);
        const existingLib = await dbService.execute({
            query: aql`
                        FOR lib IN ${libsCollec}
                            FILTER lib._key == ${lib._key}
                            RETURN lib
                    `,
            ctx,
        });

        // If not, create it
        if (!existingLib.length) {
            const {attributes, fullTextAttributes, ...libData} = lib;
            // Insert in libraries collection
            await dbService.execute({
                query: aql`INSERT ${libData} INTO ${libsCollec} RETURN NEW`,
                ctx,
            });

            // Save its attributes
            await libraryRepo.saveLibraryAttributes({
                libId: lib._key,
                attributes,
                ctx,
            });

            await libraryRepo.saveLibraryFullTextAttributes({
                libId: lib._key,
                fullTextAttributes,
                ctx,
            });
        }

        // Ensure collection exists for this library
        if (!(await dbService.collectionExists(lib._key))) {
            await dbService.createCollection(lib._key);
        }
    }
};

export const createAttributes = async (
    attributes: IAttributeForRepo[],
    attributeRepo: IAttributeRepo,
    ctx: IQueryInfos,
) => {
    for (const attribute of attributes) {
        // Check if attribute already exists
        const attributeFromDb = await attributeRepo.getAttributes({
            params: {
                filters: {
                    id: attribute.id,
                },
                strictFilters: true,
                withCount: false,
            },
            ctx,
        });

        // It already exists, move on
        if (attributeFromDb.list.length) {
            continue;
        }

        // Let's create it
        await attributeRepo.createAttribute({
            attrData: {...attribute},
            ctx,
        });
    }
};

export const linkLibraryAttributes = async (
    attributeRepo: IAttributeRepo,
    libraryRepo: ILibraryRepo,
    libraryId: string,
    attributes: IAttributeForRepo[],
    ctx: IQueryInfos,
) => {
    const previousAttributes = await attributeRepo.getLibraryAttributes({
        libraryId,
        ctx,
    });

    const newAttributes = [...previousAttributes.map(({id}) => id), ...attributes.map(({id}) => id)];

    await libraryRepo.saveLibraryAttributes({
        libId: libraryId,
        attributes: removeDuplicates(newAttributes as string[]),
        ctx,
    });
};

const removeDuplicates = (strings: string[]): string[] => {
    const uniqueStrings: string[] = [];

    for (const str of strings) {
        if (!uniqueStrings.includes(str)) {
            uniqueStrings.push(str);
        }
    }

    return uniqueStrings;
};

export type MigrationTreeToCreate = ITree & {_key: string};

export const createTrees = async (trees: MigrationTreeToCreate[], dbService: IDbService, ctx: IQueryInfos) => {
    for (const tree of trees) {
        const treeFromDb = await dbService.execute({
            query: aql`
                    FOR t IN core_trees
                        FILTER t._key == ${tree._key}
                    RETURN t._key
                `,
            ctx,
        });

        if (!treeFromDb.length) {
            await dbService.execute({
                query: aql`INSERT ${tree} INTO core_trees RETURN NEW`,
                ctx,
            });
        }

        const edgeCollecName = `core_edge_tree_${tree._key}`;
        if (!(await dbService.collectionExists(edgeCollecName))) {
            await dbService.createCollection(edgeCollecName, CollectionType.EDGE_COLLECTION);
        }

        const nodesCollectionName = getNodesCollectionName(tree._key);
        if (!(await dbService.collectionExists(nodesCollectionName))) {
            await dbService.createCollection(nodesCollectionName);
        }
    }
};
