// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IAttributeForRepo, IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IMigration} from '_types/migration';
import {AttributeFormats} from '../../../_types/attribute';
import {FilesAttributes} from '../../../_types/filesManager';
import {IDbService} from '../dbService';

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.attribute'?: IAttributeRepo;
}

export default function ({
    'core.domain.attribute': attributeDomain = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.db.dbService': dbService = null
}: IDeps): IMigration {
    return {
        async run(ctx) {
            const previewsAttribute = (
                await attributeDomain.getAttributes({
                    params: {
                        filters: {
                            id: FilesAttributes.PREVIEWS
                        }
                    },
                    ctx
                })
            ).list[0];

            const previewsStatusAttribute = (
                await attributeDomain.getAttributes({
                    params: {
                        filters: {
                            id: FilesAttributes.PREVIEWS_STATUS
                        }
                    },
                    ctx
                })
            ).list[0];

            // Add more sizes to previews and previews_status attributes
            await attributeRepo.updateAttribute({
                attrData: {
                    ...(previewsAttribute as IAttributeForRepo),
                    embedded_fields: [
                        {
                            id: 'tiny',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'small',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'medium',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'big',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'huge',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'pdf',
                            format: AttributeFormats.TEXT
                        }
                    ]
                },
                ctx
            });

            const previewStatusSubFields = [
                {
                    id: 'status',
                    format: AttributeFormats.NUMERIC
                },
                {
                    id: 'message',
                    format: AttributeFormats.TEXT
                }
            ];

            await attributeRepo.updateAttribute({
                attrData: {
                    ...(previewsStatusAttribute as IAttributeForRepo),
                    embedded_fields: [
                        {
                            id: 'tiny',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'small',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'medium',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'big',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'huge',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'pdf',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        }
                    ]
                },
                ctx
            });

            // Clear "pages" fields on existing records
            // Get all files libraries
            const librariesIds = await dbService.execute<string[]>({
                query: aql`
                    FOR lib IN core_libraries
                        FILTER lib.behavior == 'files'
                        RETURN lib._key
                `,
                ctx
            });

            for (const libraryId of librariesIds) {
                // For each records, clear "pages" fields on "previews" and "previews_status" attributes
                const collection = dbService.db.collection(libraryId);
                await dbService.execute({
                    query: aql`
                        FOR file IN ${collection}
                            FILTER file.previews.pages != null
                            UPDATE file WITH {
                                previews: MERGE(file.previews, {pages: null}),
                                previews_status: MERGE(file.previews_status, {pages: null})
                            } IN ${collection} OPTIONS {keepNull: false}
                    `,
                    ctx
                });
            }
        }
    };
}
