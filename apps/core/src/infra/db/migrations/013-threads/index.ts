import {CommonAttributes} from '../../../../_constants/systemAttributes';
import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {type IMigration} from '../../../../_types/migration';
import {type IDbService} from '../../dbService';
import {type ILibraryRepo} from '../../../library/libraryRepo';
import {type IAttributeRepo} from '../../../attribute/attributeRepo';
import {
    commonAttributeData,
    createAttributes,
    createLibraries,
    createTrees,
    linkLibraryAttributes,
} from '../../helpers/libraryUtils';
import {commentAttributes, commentLibrary} from './comments';
import {threadLibrary, threadsAttributes} from './threads';
import {statusesAttributes, statusesLibrary, threadStatusTree} from './statuses';
import {aql} from 'arangojs';
import {AttributeTypes} from '../../../../_types/attribute';

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
                id: CommonAttributes.DISCUSSION_THREADS,
                type: AttributeTypes.ADVANCED_LINK,
                multiple_values: true,
                linked_library: SystemLibraries.DISCUSSION_THREADS,
                label: {fr: 'Fils de discussion associés', en: 'Related discussion threads'},
            };
            await createAttributes([sharedThreadAttribute], attributeRepo, ctx);

            const librariesKeys: string[] = await dbService.execute({
                query: aql`
                    FOR library IN core_libraries
                        FILTER library._key != ${SystemLibraries.DISCUSSION_THREADS}
                        FILTER library._key != ${SystemLibraries.DISCUSSION_COMMENTS}
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
