// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IMigration} from '_types/migration';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {LibraryBehavior} from '../../../_types/library';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.db.dbService'?: IDbService;
}

export default function ({
    'core.infra.attribute': attributeRepo = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.db.dbService': dbService = null
}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const commonAttributeData = {
                system: true,
                multiple_values: false,
                versions_conf: {versionable: false},
                readonly: true,
                required: false,
                actions_list: {
                    [ActionsListEvents.GET_VALUE]: [],
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            id: 'validateFormat',
                            name: 'Validate Format',
                            is_system: true
                        }
                    ],
                    [ActionsListEvents.DELETE_VALUE]: []
                }
            };

            const attributesToCreate = [
                {
                    ...commonAttributeData,
                    id: 'file_size',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {
                        fr: 'Taille du fichier',
                        en: 'File size'
                    },
                    description: {
                        fr: 'Taille en octets',
                        en: 'Size in bytes'
                    },
                    actions_list: {
                        ...commonAttributeData.actions_list,
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'toNumber',
                                name: 'To Number',
                                is_system: true
                            },
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            ...commonAttributeData.actions_list[ActionsListEvents.GET_VALUE],
                            {
                                id: 'formatNumber',
                                is_system: false,
                                params: [
                                    {
                                        name: 'decimals',
                                        value: '0'
                                    },
                                    {
                                        name: 'thousandsSeparator',
                                        value: ' '
                                    },
                                    {
                                        name: 'decimalsSeparator',
                                        value: ','
                                    },
                                    {
                                        name: 'prefix',
                                        value: ''
                                    },
                                    {
                                        name: 'suffix',
                                        value: ''
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'mime_type1',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {
                        fr: 'Type MIME 1',
                        en: 'MIME type 1'
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'mime_type2',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {
                        fr: 'Type MIME 2',
                        en: 'MIME type 2'
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'has_clipping_path',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.BOOLEAN,
                    label: {
                        fr: 'Masque de détourage détecté',
                        en: 'Clipping path detected'
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'color_space',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {
                        fr: 'Espace colorimétrique',
                        en: 'Color space'
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'color_profile',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {
                        fr: 'Profil colorimétrique',
                        en: 'Color profile'
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'width',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {
                        fr: 'Largeur',
                        en: 'Width'
                    },
                    actions_list: {
                        ...commonAttributeData.actions_list,
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'toNumber',
                                name: 'To Number',
                                is_system: true
                            },
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            ...commonAttributeData.actions_list[ActionsListEvents.GET_VALUE],
                            {
                                id: 'formatNumber',
                                is_system: false,
                                params: [
                                    {
                                        name: 'decimals',
                                        value: '0'
                                    },
                                    {
                                        name: 'thousandsSeparator',
                                        value: ' '
                                    },
                                    {
                                        name: 'decimalsSeparator',
                                        value: ','
                                    },
                                    {
                                        name: 'prefix',
                                        value: ''
                                    },
                                    {
                                        name: 'suffix',
                                        value: ' px'
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'height',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {
                        fr: 'Hauteur',
                        en: 'Height'
                    },
                    actions_list: {
                        ...commonAttributeData.actions_list,
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'toNumber',
                                name: 'To Number',
                                is_system: true
                            },
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            ...commonAttributeData.actions_list[ActionsListEvents.GET_VALUE],
                            {
                                id: 'formatNumber',
                                is_system: false,
                                params: [
                                    {
                                        name: 'decimals',
                                        value: '0'
                                    },
                                    {
                                        name: 'thousandsSeparator',
                                        value: ' '
                                    },
                                    {
                                        name: 'decimalsSeparator',
                                        value: ','
                                    },
                                    {
                                        name: 'prefix',
                                        value: ''
                                    },
                                    {
                                        name: 'suffix',
                                        value: ' px'
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'print_width',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {
                        fr: "Largeur d'impression",
                        en: 'Print width'
                    },
                    actions_list: {
                        ...commonAttributeData.actions_list,
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'toNumber',
                                name: 'To Number',
                                is_system: true
                            },
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            ...commonAttributeData.actions_list[ActionsListEvents.GET_VALUE],
                            {
                                id: 'formatNumber',
                                is_system: false,
                                params: [
                                    {
                                        name: 'decimals',
                                        value: '0'
                                    },
                                    {
                                        name: 'thousandsSeparator',
                                        value: ' '
                                    },
                                    {
                                        name: 'decimalsSeparator',
                                        value: ','
                                    },
                                    {
                                        name: 'prefix',
                                        value: ''
                                    },
                                    {
                                        name: 'suffix',
                                        value: ' mm'
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'print_height',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {
                        fr: "Hauteur d'impression",
                        en: 'Print height'
                    },
                    actions_list: {
                        ...commonAttributeData.actions_list,
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'toNumber',
                                name: 'To Number',
                                is_system: true
                            },
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            ...commonAttributeData.actions_list[ActionsListEvents.GET_VALUE],
                            {
                                id: 'formatNumber',
                                is_system: false,
                                params: [
                                    {
                                        name: 'decimals',
                                        value: '0'
                                    },
                                    {
                                        name: 'thousandsSeparator',
                                        value: ' '
                                    },
                                    {
                                        name: 'decimalsSeparator',
                                        value: ','
                                    },
                                    {
                                        name: 'prefix',
                                        value: ''
                                    },
                                    {
                                        name: 'suffix',
                                        value: ' mm'
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    ...commonAttributeData,
                    id: 'resolution',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {
                        fr: 'Résolution',
                        en: 'Resolution'
                    },
                    actions_list: {
                        ...commonAttributeData.actions_list,
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'toNumber',
                                name: 'To Number',
                                is_system: true
                            },
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            ...commonAttributeData.actions_list[ActionsListEvents.GET_VALUE],
                            {
                                id: 'formatNumber',
                                is_system: false,
                                params: [
                                    {
                                        name: 'decimals',
                                        value: '0'
                                    },
                                    {
                                        name: 'thousandsSeparator',
                                        value: ' '
                                    },
                                    {
                                        name: 'decimalsSeparator',
                                        value: ','
                                    },
                                    {
                                        name: 'prefix',
                                        value: ''
                                    },
                                    {
                                        name: 'suffix',
                                        value: ' dpi'
                                    }
                                ]
                            }
                        ]
                    }
                }
            ];

            /** Create attributes */
            // Check if attribute already exists
            await Promise.all(
                attributesToCreate.map(async attribute => {
                    const existingAttribute = await attributeRepo.getAttributes({
                        params: {
                            filters: {id: attribute.id}
                        },
                        ctx
                    });

                    if (!existingAttribute.list.length) {
                        await attributeRepo.createAttribute({
                            attrData: attribute,
                            ctx
                        });
                    }
                })
            );

            // Add attributes to all files libraries
            const filesLibraries = await dbService.execute({
                query: aql`
                    FOR library IN core_libraries
                        FILTER library.behavior == ${LibraryBehavior.FILES}
                        RETURN library
                `,
                ctx
            });

            const attributesToAdd = attributesToCreate.map(attribute => attribute.id);
            await Promise.all(
                filesLibraries.map(async library =>
                    libraryRepo.saveLibraryAttributes({
                        attributes: attributesToAdd,
                        libId: library._key,
                        insertOnly: true,
                        ctx
                    })
                )
            );
        }
    };
}
