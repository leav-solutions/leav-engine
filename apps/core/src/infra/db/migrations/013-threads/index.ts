// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IMigration} from '_types/migration';
import {type IDbService} from '../../dbService';
import {type ILibraryRepo} from '../../../library/libraryRepo';
import {type IAttributeRepo} from '../../../attribute/attributeRepo';
import {
    commonAttributeData,
    createAttributes,
    createLibraries,
    createTrees,
    linkLibraryAttributes,
} from 'infra/db/helpers/libraryUtils';
import {commentAttributes, commentLibrary} from './comments';
import {threadLibrary, threadsAttributes} from './threads';
import {statusesAttributes, statusesLibrary, threadStatusTree} from './statuses';
import {aql} from 'arangojs';
import {COMMENTS_LIBRARY_ID, THREADS_LIBRARY_ID} from './constants';
import {AttributeTypes} from '_types/attribute';
import {DISCUSSION_THREADS_ATTRIBUTE_ID} from '_constants/attributes';

interface IDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.library': ILibraryRepo;
    'core.infra.attribute': IAttributeRepo;
}

export default function ({
    'core.infra.db.dbService': dbService,
    'core.infra.library': libraryRepo,
    'core.infra.attribute': attributeRepo,
}: IDeps): IMigration {
    return {
        async run(ctx) {
            await createAttributes(threadsAttributes, attributeRepo, ctx);
            await createAttributes(commentAttributes, attributeRepo, ctx);
            await createAttributes(statusesAttributes, attributeRepo, ctx);

            await createLibraries([threadLibrary, commentLibrary, statusesLibrary], dbService, libraryRepo, ctx);

            await createTrees([threadStatusTree], dbService, ctx);

            // Création d'un lien vers threads sur toutes les libs
            const sharedThreadAttribute = {
                ...commonAttributeData,
                id: DISCUSSION_THREADS_ATTRIBUTE_ID,
                type: AttributeTypes.ADVANCED_LINK,
                multiple_values: true,
                linked_library: THREADS_LIBRARY_ID,
                label: {fr: 'Fils de discussion associés', en: 'Related discussion threads'},
            };
            await createAttributes([sharedThreadAttribute], attributeRepo, ctx);

            const librariesKeys: string[] = await dbService.execute({
                query: aql`
                    FOR library IN core_libraries
                        FILTER library._key != ${THREADS_LIBRARY_ID}
                        FILTER library._key != ${COMMENTS_LIBRARY_ID}
                        RETURN library._key
                `,
                ctx,
            });

            for (const key of librariesKeys) {
                await linkLibraryAttributes(attributeRepo, libraryRepo, key, [sharedThreadAttribute], ctx);
            }
        },
    };
}
