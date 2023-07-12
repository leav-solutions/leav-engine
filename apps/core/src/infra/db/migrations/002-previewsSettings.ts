// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IUtils} from 'utils/utils';
import {IMigration} from '_types/migration';
import {systemPreviewsSettings} from '../../../domain/filesManager/_constants';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {IDbService} from '../dbService';
import {IDbUtils} from '../dbUtils';
import {IDbDocument} from '../_types';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.utils'?: IUtils;
}

export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.utils': utils = null
}: IDeps = {}): IMigration {
    const _processLibrary = async (library: IDbDocument, ctx) => {
        // Save previews settings
        const coreLibsCollec = dbService.db.collection('core_libraries');
        const savedLib = await dbService.execute({
            query: aql`
                UPDATE ${library}
                    WITH {
                        previewsSettings: ${systemPreviewsSettings}
                    } IN ${coreLibsCollec}
                    RETURN NEW`,
            ctx
        });

        // Create and bind previews attributes to library
        const savedLibraryObj: ILibrary = dbUtils.cleanup(savedLib[0]);
        const libAttributes = await attributeRepo.getLibraryAttributes({libraryId: savedLibraryObj.id, ctx});

        const previewsAttributeId = utils.getPreviewsAttributeName(savedLibraryObj.id);
        const previewsStatus = utils.getPreviewsStatusAttributeName(savedLibraryObj.id);
        const attributesSettings = utils.getPreviewAttributesSettings(savedLibraryObj);

        const attributesToCheck = [previewsAttributeId, previewsStatus];
        const attributeLabel = {
            [previewsAttributeId]: {fr: 'Aperçus', en: 'Previews'},
            [previewsStatus]: {fr: 'Statut des aperçus', en: 'Previews status'}
        };

        const attributesToBind = [];
        for (const attributeToCheck of attributesToCheck) {
            // Check if attribute already exists
            const attributeFromDb = await attributeRepo.getAttributes({
                params: {
                    filters: {
                        id: attributeToCheck
                    },
                    strictFilters: true,
                    withCount: false
                },
                ctx
            });

            const isAttributeBoundToLibrary = libAttributes.find(attr => attr.id === attributeToCheck);
            const doesAttributeExist = attributeFromDb.list.length;
            if (doesAttributeExist && isAttributeBoundToLibrary) {
                continue;
            }

            if (!doesAttributeExist) {
                const previewsAttributeSettings = attributesSettings[attributeToCheck];
                const previewsAttributeData = {
                    id: attributeToCheck,
                    label: attributeLabel[attributeToCheck],
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED,
                    multiple_values: false,
                    system: true,
                    readonly: false,
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                is_system: true,
                                id: 'toJSON',
                                name: 'To JSON'
                            }
                        ],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                is_system: true,
                                id: 'parseJSON',
                                name: 'Parse JSON'
                            },
                            {
                                is_system: true,
                                id: 'validateFormat',
                                name: 'Validate Format'
                            }
                        ]
                    },
                    embedded_fields: previewsAttributeSettings
                };

                // Let's create it
                await attributeRepo.createAttribute({
                    attrData: previewsAttributeData,
                    ctx
                });
            }

            if (!isAttributeBoundToLibrary) {
                attributesToBind.push(attributeToCheck);
            }
        }

        await libraryRepo.saveLibraryAttributes({
            libId: library._key,
            attributes: attributesToBind,
            insertOnly: true,
            ctx
        });

        // Move previews values to the new attributes
        const libCollec = dbService.db.collection(library._key);
        await dbService.execute({
            query: aql`
                FOR r IN ${libCollec}
                    FILTER r.previews != null AND r.previews_status != null
                    UPDATE r WITH {
                        ${previewsAttributeId}: r.previews,
                        ${previewsStatus}: r.previews_status
                    } IN ${libCollec}
            `,
            ctx
        });
    };
    return {
        async run(ctx) {
            // Get files libraries
            const coreLibsCollec = dbService.db.collection('core_libraries');
            const filesLibraries = await dbService.execute({
                query: aql`
                    FOR l IN ${coreLibsCollec}
                        FILTER l.behavior == ${LibraryBehavior.FILES}
                        RETURN l
                `,
                ctx
            });

            await Promise.all(filesLibraries.map(async library => _processLibrary(library, ctx)));

            // Delete old previews attributes
            await attributeRepo.deleteAttribute({
                attrData: {
                    id: 'previews',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED
                },
                ctx
            });

            await attributeRepo.deleteAttribute({
                attrData: {
                    id: 'previews_status',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED
                },
                ctx
            });
        }
    };
}
