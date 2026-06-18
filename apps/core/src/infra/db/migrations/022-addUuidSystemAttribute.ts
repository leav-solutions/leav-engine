import {SystemLibraries} from '../../../_constants/systemLibraries';
import {CommonAttributes} from '../../../_constants/systemAttributes';
import {aql} from 'arangojs/aql';
import {type IAttributeRepo} from '../../attribute/attributeRepo';
import {type ILibraryRepo, LIB_COLLECTION_NAME} from '../../library/libraryRepo';
import {type IMigration} from '../../../_types/migration';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {type IDbService} from '../dbService';

interface IDeps {
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.db.dbService'?: IDbService;
}

export default function ({
    'core.infra.attribute': attributeRepo = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.db.dbService': dbService = null,
}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const uuidAttribute = {
                id: CommonAttributes.UUID,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                system: true,
                readonly: true,
                required: false,
                multiple_values: false,
                versions_conf: {versionable: false},
                label: {fr: 'UUID', en: 'UUID'},
                description: {
                    fr: 'Identifiant universel cross-application',
                    en: 'Cross-application universal identifier',
                },
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

            // 1. Create or update the uuid attribute
            const existingAttribute = await attributeRepo.getAttributes({
                params: {filters: {id: CommonAttributes.UUID}},
                ctx,
            });

            if (!existingAttribute.list.length) {
                await attributeRepo.createAttribute({attrData: uuidAttribute, ctx});
            } else {
                await attributeRepo.updateAttribute({attrData: uuidAttribute, ctx});
            }

            // 2. Fetch all existing libraries
            const libsCollection = dbService.db.collection(LIB_COLLECTION_NAME);
            const libIds: string[] = await dbService.execute({
                query: aql`FOR library IN ${libsCollection} RETURN library._key`,
                ctx,
            });

            // 3. For each library: link the uuid attribute, backfill records, ensure index.
            // SystemLibrary.USERS is linked but its existing records are not backfilled.
            for (const libId of libIds) {
                await libraryRepo.saveLibraryAttributes({
                    libId,
                    attributes: [CommonAttributes.UUID],
                    insertOnly: true,
                    ctx,
                });

                if (!(await dbService.collectionExists(libId))) {
                    continue;
                }

                const collection = dbService.db.collection(libId);

                if (libId !== SystemLibraries.USERS) {
                    // Backfill uuid for all records missing it. UUID() is an AQL built-in (UUID v4).
                    await dbService.execute({
                        query: aql`
                            FOR r IN ${collection}
                                FILTER r.uuid == null
                                UPDATE r WITH {uuid: UUID()} IN ${collection}
                        `,
                        ctx,
                    });
                }

                await collection.ensureIndex({
                    type: 'persistent',
                    fields: ['uuid'],
                    unique: true,
                    sparse: true,
                    name: 'idx_uuid',
                });
            }
        },
    };
}
