import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {
    CommonAttributes,
    FilesAttributes,
    SdoAttributes,
    UsersAttributes,
} from '../../../../_constants/systemAttributes';
import {type IAttributeForRepo} from '../../../attribute/attributeRepo';
import {ActionsListEvents} from '../../../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {commonAttributeData} from '../../helpers/libraryUtils';

const previewStatusSubFields = [
    {
        id: 'status',
        format: AttributeFormats.NUMERIC,
    },
    {
        id: 'message',
        format: AttributeFormats.TEXT,
    },
];

export const systemAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: CommonAttributes.ID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Identifiant', en: 'Identifier'},
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: CommonAttributes.UUID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'UUID', en: 'UUID'},
        description: {
            fr: 'Identifiant universel cross-application',
            en: 'Cross-application universal identifier',
        },
        readonly: true,
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    is_system: true,
                },
                {
                    id: 'validateRegex',
                    name: 'Validate Regex',
                    params: [
                        {
                            name: 'regex',
                            value: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                        },
                    ],
                },
            ],
        },
    },
    {
        ...commonAttributeData,
        id: CommonAttributes.CREATED_BY,
        linked_library: SystemLibraries.USERS,
        type: AttributeTypes.SIMPLE_LINK,
        label: {fr: 'Créé par', en: 'Created by'},
        readonly: true,
        actions_list: {
            ...commonAttributeData.actions_list,
            saveValue: [],
        },
    },
    {
        ...commonAttributeData,
        id: CommonAttributes.CREATED_AT,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.DATE,
        label: {fr: 'Date de création', en: 'Creation date'},
        readonly: true,
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'toNumber',
                    name: 'To Number',
                    is_system: true,
                },
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    is_system: true,
                },
            ],
            [ActionsListEvents.GET_VALUE]: [
                {
                    id: 'formatDate',
                    name: 'Format Date',
                    is_system: false,
                    params: [
                        {
                            name: 'format',
                            value: 'DD/MM/YYYY HH:mm:ss',
                        },
                    ],
                },
            ],
        },
    },
    {
        ...commonAttributeData,
        id: CommonAttributes.MODIFIED_BY,
        linked_library: SystemLibraries.USERS,
        type: AttributeTypes.SIMPLE_LINK,
        label: {fr: 'Modifié par', en: 'Modified by'},
        readonly: true,
        actions_list: {
            ...commonAttributeData.actions_list,
            saveValue: [],
        },
    },
    {
        ...commonAttributeData,
        id: CommonAttributes.MODIFIED_AT,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.DATE,
        label: {fr: 'Date de modification', en: 'Modification date'},
        readonly: true,
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'toNumber',
                    name: 'To Number',
                    is_system: true,
                },
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    is_system: true,
                },
            ],
            [ActionsListEvents.GET_VALUE]: [
                {
                    id: 'formatDate',
                    name: 'Format Date',
                    is_system: false,
                    params: [
                        {
                            name: 'format',
                            value: 'DD/MM/YYYY HH:mm:ss',
                        },
                    ],
                },
            ],
        },
    },
    {
        ...commonAttributeData,
        system: false,
        required: false,
        id: CommonAttributes.LABEL,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Libellé', en: 'Label'},
    },
    /** Users attributes */
    {
        ...commonAttributeData,
        id: UsersAttributes.LOGIN,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Login', en: 'Login'},
        unique: true,
    },
    {
        ...commonAttributeData,
        id: UsersAttributes.EMAIL,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Email', en: 'Email'},
        readonly: false,
        unique: true,
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    is_system: true,
                },
                {
                    id: 'validateEmail',
                    name: 'Validate Email',
                    is_system: true,
                },
            ],
        },
    },
    {
        ...commonAttributeData,
        id: UsersAttributes.PASSWORD,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.ENCRYPTED,
        label: {fr: 'Mot de passe', en: 'Password'},
        actions_list: {
            ...commonAttributeData.actions_list,
            saveValue: [
                {
                    id: 'validateFormat',
                    name: 'validateFormat',
                    is_system: true,
                },
                {
                    id: 'validateRegex',
                    name: 'Validate Regex',
                    is_system: true,
                    params: [
                        {
                            name: 'regex',
                            // prettier-ignore
                            // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
                            value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
                        },
                    ],
                },
                {
                    id: 'encrypt',
                    name: 'encrypt',
                    is_system: true,
                },
            ],
            getValue: [
                {
                    id: 'maskValue',
                    name: 'Mask Value',
                    is_system: true,
                },
            ],
        },
    },
    {
        ...commonAttributeData,
        id: UsersAttributes.USER_GROUPS,
        type: AttributeTypes.TREE,
        label: {
            fr: "Groupes de l'utilisateur",
            en: 'User groups',
        },
        linked_tree: SystemTrees.USERS_GROUPS,
        multiple_values: true,
        actions_list: {
            ...commonAttributeData.actions_list,
            saveValue: [],
        },
    },
    /** Files attributes */
    {
        ...commonAttributeData,
        id: FilesAttributes.ROOT_KEY,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Clé racine', en: 'Root key'},
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: FilesAttributes.HASH,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Hash', en: 'Hash'},
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: FilesAttributes.FILE_PATH,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Chemin du fichier', en: 'File path'},
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: FilesAttributes.FILE_NAME,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Nom du fichier', en: 'File name'},
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: FilesAttributes.INODE,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.NUMERIC,
        label: {fr: 'Inode', en: 'Inode'},
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    is_system: true,
                },
                {
                    id: 'toNumber',
                    name: 'To Number',
                    is_system: true,
                },
            ],
        },
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: 'previews',
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.EXTENDED,
        embedded_fields: [
            {
                id: 'tiny',
                format: AttributeFormats.TEXT,
            },
            {
                id: 'small',
                format: AttributeFormats.TEXT,
            },
            {
                id: 'medium',
                format: AttributeFormats.TEXT,
            },
            {
                id: 'big',
                format: AttributeFormats.TEXT,
            },
            {
                id: 'huge',
                format: AttributeFormats.TEXT,
            },
            {
                id: 'pdf',
                format: AttributeFormats.TEXT,
            },
        ],
        label: {fr: 'Aperçus', en: 'Previews'},
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.GET_VALUE]: [
                {
                    is_system: true,
                    id: 'toJSON',
                    name: 'To JSON',
                },
            ],
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    is_system: true,
                    id: 'parseJSON',
                    name: 'Parse JSON',
                },
                {
                    is_system: true,
                    id: 'validateFormat',
                    name: 'Validate Format',
                },
            ],
        },
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: 'previews_status',
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.EXTENDED,
        label: {fr: 'Statut des aperçus', en: 'Previews status'},
        embedded_fields: [
            {
                id: 'tiny',
                format: AttributeFormats.EXTENDED,
                embedded_fields: previewStatusSubFields,
            },
            {
                id: 'small',
                format: AttributeFormats.EXTENDED,
                embedded_fields: previewStatusSubFields,
            },
            {
                id: 'medium',
                format: AttributeFormats.EXTENDED,
                embedded_fields: previewStatusSubFields,
            },
            {
                id: 'big',
                format: AttributeFormats.EXTENDED,
                embedded_fields: previewStatusSubFields,
            },
            {
                id: 'huge',
                format: AttributeFormats.EXTENDED,
                embedded_fields: previewStatusSubFields,
            },
            {
                id: 'pdf',
                format: AttributeFormats.EXTENDED,
                embedded_fields: previewStatusSubFields,
            },
        ],
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.GET_VALUE]: [
                {
                    is_system: true,
                    id: 'toJSON',
                    name: 'To JSON',
                },
            ],
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    is_system: true,
                    id: 'parseJSON',
                    name: 'Parse JSON',
                },
                {
                    is_system: true,
                    id: 'validateFormat',
                    name: 'Validate Format',
                },
            ],
        },
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: CommonAttributes.ACTIVE,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.BOOLEAN,
        label: {fr: 'Actif', en: 'Active'},
        actions_list: {
            ...commonAttributeData.actions_list,
            [ActionsListEvents.GET_VALUE]: [
                {
                    id: 'toBoolean',
                    name: 'To Boolean',
                    is_system: true,
                },
            ],
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    is_system: true,
                },
                {
                    id: 'toBoolean',
                    name: 'To Boolean',
                    is_system: true,
                },
            ],
        },
        readonly: false,
    },
    /** SDO application-traceability attributes */
    {
        ...commonAttributeData,
        id: SdoAttributes.APPLICATION_IDS,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'IDs applicatifs SDO', en: 'SDO application IDs'},
        description: {
            fr: 'IDs internes par application (JSON)',
            en: 'Internal ids per application (JSON)',
        },
        readonly: true,
    },
    {
        ...commonAttributeData,
        id: SdoAttributes.CREATOR_CLIENT_ID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'ClientId créateur SDO', en: 'SDO creator clientId'},
        description: {
            fr: "Identifiant de l'application créatrice de l'élément",
            en: 'ClientId of the application that created the record',
        },
        readonly: true,
    },
];
