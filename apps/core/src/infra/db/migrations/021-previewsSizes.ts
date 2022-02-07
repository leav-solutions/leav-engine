// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IAttributeForRepo, IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IMigration} from '_types/migration';
import {AttributeFormats} from '../../../_types/attribute';
import {FilesAttributes} from '../../../_types/filesManager';
import {IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.tree'?: ITreeRepo;
}

export default function ({
    'core.infra.attribute': attributeRepo = null,
    'core.domain.attribute': attributeDomain = null,
    config
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
                            id: 'pages',
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
                            id: 'pages',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        }
                    ]
                },
                ctx
            });
        }
    };
}
