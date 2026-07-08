import {SdoAttributes} from '../../../_constants/systemAttributes';
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
            // Both attributes are plain TEXT: sdo_application_ids holds a JSON string (schema unknown),
            // sdo_creator_client_id holds the creator application clientId.
            const commonProps = {
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                system: true,
                readonly: true,
                required: false,
                multiple_values: false,
                versions_conf: {versionable: false},
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

            const sdoAttributes = [
                {
                    ...commonProps,
                    id: SdoAttributes.APPLICATION_IDS,
                    label: {fr: 'IDs applicatifs SDO', en: 'SDO application IDs'},
                    description: {
                        fr: 'IDs internes par application (JSON)',
                        en: 'Internal ids per application (JSON)',
                    },
                },
                {
                    ...commonProps,
                    id: SdoAttributes.CREATOR_CLIENT_ID,
                    label: {fr: 'ClientId créateur SDO', en: 'SDO creator clientId'},
                    description: {
                        fr: "Identifiant de l'application créatrice de l'élément",
                        en: 'ClientId of the application that created the record',
                    },
                },
            ];

            // 1. Create or update each attribute
            for (const attrData of sdoAttributes) {
                const existingAttribute = await attributeRepo.getAttributes({
                    params: {filters: {id: attrData.id}},
                    ctx,
                });

                if (!existingAttribute.list.length) {
                    await attributeRepo.createAttribute({attrData, ctx});
                } else {
                    await attributeRepo.updateAttribute({attrData, ctx});
                }
            }

            // 2. Link both attributes to every existing library. No value backfill, no index.
            const libsCollection = dbService.db.collection(LIB_COLLECTION_NAME);
            const libIds: string[] = await dbService.execute({
                query: aql`FOR library IN ${libsCollection} RETURN library._key`,
                ctx,
            });

            for (const libId of libIds) {
                await libraryRepo.saveLibraryAttributes({
                    libId,
                    attributes: [SdoAttributes.APPLICATION_IDS, SdoAttributes.CREATOR_CLIENT_ID],
                    insertOnly: true,
                    ctx,
                });
            }
        },
    };
}
