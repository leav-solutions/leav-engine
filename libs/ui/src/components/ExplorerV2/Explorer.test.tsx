// ************* NOTE ******************
//
// Prefer using spyOn method for Mocking hooks except for hooks using onCompleted callback.
// In this case, the spyOn is too complex to implement, prefer using the mocks parameter of render method.
//
import {createRef} from 'react';
import {waitFor, render, screen, within, getRecordRows} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {type Mockify} from '_ui/__mocks__/utils';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar, faCheck, faCog, faEdit, faTrash} from '@fortawesome/free-solid-svg-icons';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockRecord} from '_ui/__mocks__/common/record';
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/index';
import * as useGetRecordUpdatesSubscription from '_ui/hooks/useGetRecordUpdatesSubscription';
import {type IEntrypointLibrary, type IEntrypointLink, type IItemAction, type IPrimaryAction} from './_types';
import {ThroughConditionFilter} from '_ui/types';
import * as useExecuteSaveValueBatchMutation from '../RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import * as useColumnWidth from './useColumnWidth';
import {ExplorerV2, type IExplorerRef} from './Explorer';
import * as attributeDetailsModule from '_ui/components/ExplorerV2/manage-view-settings-v2/_shared/useAttributeDetailsData';
import {KitAlert} from 'aristid-ds';

const UploadFilesMock = 'UploadFiles';
const CreateDirectoryMock = 'CreateDirectory';
const EditRecordModalMock = 'EditRecordModal';
const LinkRecordModalMock = 'LinkRecordModalMock';

vi.mock('_ui/components/UploadFiles', () => ({
    UploadFiles: () => <div>{UploadFilesMock}</div>,
}));
vi.mock('_ui/components/CreateDirectory', () => ({
    CreateDirectory: () => <div>{CreateDirectoryMock}</div>,
}));

vi.mock('_ui/components/Filters/context/useGetTreeFilters', () => ({
    useGetTreeFilters: () => ({
        data: {},
        loading: false,
    }),
}));

const editRecordFn = vi.fn();
vi.mock('_ui/components/RecordEdition/EditRecordModal', () => ({
    EditRecordModal: ({onCreate, onClose, ...props}) => {
        editRecordFn(props);
        return (
            <div>
                {EditRecordModalMock}
                <button onClick={() => onCreate({id: 987654})}>create-record</button>
                <button onClick={() => onClose?.({})}>close-modal</button>
            </div>
        );
    },
}));

vi.mock('_ui/components/ExplorerV2/link-item/LinkModal', () => ({
    LinkModal: ({onLink}) => (
        <div>
            {LinkRecordModalMock}
            <button onClick={() => onLink([987654])}>link-record</button>
        </div>
    ),
}));

vi.mock('aristid-ds', async () => ({
    ...(await vi.importActual('aristid-ds')),
    KitAlert: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@uidotdev/usehooks', () => ({
    useMeasure: () => [vi.fn(), {height: 100, width: 100}],
}));

const simpleMockAttribute = {
    id: 'simple_attribute',
    label: {
        fr: 'Mon attribut simple',
        en: 'My simple attribute',
    },
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.text,
    multiple_values: false,
} satisfies gqlTypes.AttributePropertiesFragment;

const booleanMockAttribute = {
    id: 'boolean_attribute',
    label: {
        fr: 'Mon attribut booléen',
        en: 'My boolean attribute',
    },
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.boolean,
    multiple_values: false,
} satisfies gqlTypes.AttributePropertiesFragment;

const linkMockAttribute = {
    ...simpleMockAttribute,
    id: 'link_attribute',
    label: {
        fr: 'Mon attribut liaison',
        en: 'My link attribute',
    },
    type: gqlTypes.AttributeType.advanced_link,
} satisfies gqlTypes.AttributePropertiesFragment;

const multivalLinkMockAttribute = {
    ...linkMockAttribute,
    id: 'link_attribute_multival',
    label: {
        fr: 'Mon attribut liaison multival',
        en: 'My link attribute multi-valued',
    },
    multiple_values: true,
    // multi_link_display_option: gqlTypes.MultiLinkDisplayOption.avatar // default value
} satisfies gqlTypes.AttributePropertiesFragment;

const simpleRichTextMockAttribute = {
    id: 'simple_rich_text',
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.rich_text,
    multiple_values: false,
    label: {
        fr: 'Mon simple texte enrichi',
        en: 'My simple rich text',
    },
} satisfies gqlTypes.AttributePropertiesFragment;

const simpleColorMockAttribute = {
    id: 'simple_color',
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.color,
    multiple_values: false,
    label: {
        fr: 'Ma simple couleur',
        en: 'My simple color',
    },
} satisfies gqlTypes.AttributePropertiesFragment;

const multivalColorMockAttribute = {
    ...simpleColorMockAttribute,
    id: 'color_multival',
    multiple_values: true,
    label: {
        fr: 'Mon attribut couleur multiple',
        en: 'My color attribute multi-valued',
    },
} satisfies gqlTypes.AttributePropertiesFragment;

const simpleDateRangeMockAttribute = {
    id: 'simple_date_range',
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.date_range,
    multiple_values: false,
    label: {
        fr: 'Ma simple période',
        en: 'My simple date range',
    },
} satisfies gqlTypes.AttributePropertiesFragment;

const multivalDateRangeMockAttribute = {
    ...simpleDateRangeMockAttribute,
    id: 'multival_date_range',
    type: gqlTypes.AttributeType.advanced,
    multiple_values: true,
    label: {
        fr: 'Ma période multival',
        en: 'My multivalued date range',
    },
} satisfies gqlTypes.AttributePropertiesFragment;

describe('Explorer', () => {
    const recordId1 = '613982168';
    const enrichTextRecord1 = '<h1>This is a test enrich text<script>alert("XSS")</script></h1>';
    const colorRecord1 = '#35c441';
    const recordId2 = '612694174';
    const enrichTextRecord2 = '<h1>This is a test enrich text</h1>';
    const colorRecord2 = '#5510d1';
    const dateRangeRecord1 = {from: '2023-11-06', to: '2023-11-07'};
    const dateRangeRecord2 = {from: '2024-11-06', to: '2024-11-07'};
    const mockRecords = [
        {
            id: '613982168',
            active: true,
            whoAmI: {
                id: '613982168',
                label: 'Halloween 2025',
                subLabel: 'Du mercredi 6 novembre 2024 au lundi 9 décembre 2024',
                color: null,
                library: {
                    id: 'campaigns',
                    label: {
                        en: 'Campaigns',
                        fr: 'Campagnes',
                    },
                },
                preview: null,
            },
            permissions: {
                create_record: true,
                delete_record: true,
            },
            properties: [
                {
                    attributeId: simpleMockAttribute.id,
                    attributeProperties: simpleMockAttribute,
                    values: [
                        {
                            valuePayload: recordId1,
                        },
                    ],
                },
                {
                    attributeId: linkMockAttribute.id,
                    attributeProperties: linkMockAttribute,
                    values: [
                        {
                            linkPayload: {id: mockRecord.id, whoAmI: mockRecord},
                        },
                    ],
                },
                {
                    attributeId: multivalLinkMockAttribute.id,
                    attributeProperties: multivalLinkMockAttribute,
                    values: [
                        {
                            linkPayload: {
                                id: 'multivalRecord1',
                                whoAmI: {...mockRecord, preview: null, label: 'Record A'},
                            },
                        },
                        {
                            linkPayload: {
                                id: 'multivalRecord2',
                                whoAmI: {...mockRecord, preview: null, label: 'Record B'},
                            },
                        },
                        {
                            linkPayload: {
                                id: 'multivalRecord3',
                                whoAmI: {...mockRecord, preview: null, label: 'Record C'},
                            },
                        },
                        {
                            linkPayload: {
                                id: 'multivalRecord4',
                                whoAmI: {...mockRecord, preview: null, label: 'Record D'},
                            },
                        },
                        {
                            linkPayload: {id: 'multivalRecord5', whoAmI: {...mockRecord, label: 'Record E'}},
                        },
                        {
                            linkPayload: {id: 'multivalRecord6', whoAmI: {...mockRecord, label: 'Record F'}},
                        },
                        {
                            linkPayload: {id: 'multivalRecord7', whoAmI: {...mockRecord, label: 'Record G'}},
                        },
                    ],
                },
                {
                    attributeId: simpleRichTextMockAttribute.id,
                    attributeProperties: simpleRichTextMockAttribute,
                    values: [
                        {
                            valuePayload: enrichTextRecord1,
                        },
                    ],
                },
                {
                    attributeId: simpleColorMockAttribute.id,
                    attributeProperties: simpleColorMockAttribute,
                    values: [
                        {
                            valuePayload: colorRecord1,
                        },
                    ],
                },
                {
                    attributeId: multivalColorMockAttribute.id,
                    attributeProperties: multivalColorMockAttribute,
                    values: [{valuePayload: '#00FF00'}, {valuePayload: '#FF0000'}, {valuePayload: '#0000FF'}],
                },
                {
                    attributeId: booleanMockAttribute.id,
                    attributeProperties: booleanMockAttribute,
                    values: [
                        {
                            valuePayload: true,
                        },
                    ],
                },
                {
                    attributeId: simpleDateRangeMockAttribute.id,
                    attributeProperties: simpleDateRangeMockAttribute,
                    values: [
                        {
                            valuePayload: dateRangeRecord1,
                        },
                    ],
                },
                {
                    attributeId: multivalDateRangeMockAttribute.id,
                    attributeProperties: multivalDateRangeMockAttribute,
                    values: [
                        {
                            valuePayload: dateRangeRecord1,
                        },
                        {
                            valuePayload: dateRangeRecord2,
                        },
                    ],
                },
            ],
        },
        {
            id: '612694174',
            active: true,
            whoAmI: {
                id: '612694174',
                label: 'Foire aux vins 2024 - semaine 1',
                subLabel: 'Du mercredi 30 octobre 2024 au lundi 25 novembre 2024',
                color: null,
                library: {
                    id: 'campaigns',
                    label: {
                        en: 'Campaigns',
                        fr: 'Campagnes',
                    },
                },
                preview: null,
            },
            permissions: {
                create_record: true,
                delete_record: true,
            },
            properties: [
                {
                    attributeId: simpleMockAttribute.id,
                    attributeProperties: simpleMockAttribute,
                    values: [
                        {
                            valuePayload: recordId2,
                        },
                    ],
                },
                {
                    attributeId: linkMockAttribute.id,
                    attributeProperties: linkMockAttribute,
                    values: [
                        {
                            linkPayload: {id: mockRecord.id, whoAmI: mockRecord},
                        },
                    ],
                },
                {
                    attributeId: multivalLinkMockAttribute.id,
                    attributeProperties: multivalLinkMockAttribute,
                    values: [],
                },
                {
                    attributeId: simpleRichTextMockAttribute.id,
                    attributeProperties: simpleRichTextMockAttribute,
                    values: [
                        {
                            valuePayload: enrichTextRecord2,
                        },
                    ],
                },
                {
                    attributeId: simpleColorMockAttribute.id,
                    attributeProperties: simpleColorMockAttribute,
                    values: [
                        {
                            valuePayload: colorRecord2,
                        },
                    ],
                },
                {
                    attributeId: multivalColorMockAttribute.id,
                    attributeProperties: multivalColorMockAttribute,
                    values: [],
                },
                {
                    attributeId: booleanMockAttribute.id,
                    attributeProperties: booleanMockAttribute,
                    values: [],
                },
                {
                    attributeId: simpleDateRangeMockAttribute.id,
                    attributeProperties: simpleDateRangeMockAttribute,
                    values: [],
                },
                {
                    attributeId: multivalDateRangeMockAttribute.id,
                    attributeProperties: multivalDateRangeMockAttribute,
                    values: [],
                },
            ],
        },
    ] satisfies gqlTypes.ExplorerLibraryDataQuery['records']['list'];

    const mockEmptyExplorerQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDataQuery> = {
        loading: false,
        called: true,
        data: {
            records: {
                totalCount: 0,
                list: [],
            },
        },
    };

    const mockExplorerLibraryDataQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDataQuery> = {
        loading: false,
        called: true,
        refetch: vi.fn(),
        data: {
            records: {
                totalCount: mockRecords.length,
                list: mockRecords,
            },
        },
    };

    const mockExplorerLibraryCountDataQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryCountDataQuery> = {
        loading: false,
        called: true,
        refetch: vi.fn(),
        data: {
            records: {
                totalCount: mockRecords.length,
            },
        },
    };

    const mockExplorerLinkDataQueryResultProperty = [
        {
            id_value: '0',
            payload: mockRecords[0],
        },
        {
            id_value: '1',
            payload: mockRecords[1],
        },
    ];

    const mockExplorerLinkDataQueryResult: Mockify<typeof gqlTypes.useExplorerLinkDataQuery> = {
        loading: false,
        called: true,
        refetch: vi.fn(),
        data: {
            records: {
                list: [
                    {
                        id: '612694174',
                        whoAmI: {
                            id: '612694174',
                            library: {
                                id: 'campaigns',
                            },
                        },
                        property: mockExplorerLinkDataQueryResultProperty,
                    },
                ],
            },
        },
    };

    const campaignName = 'Campagnes';

    const mockLibraryDetailsQueryResultList = {
        id: 'campaigns',
        label: {
            en: 'Campaigns',
            fr: campaignName,
        },
        permissions: {
            create_record: true,
        },
    };

    const mockFilesLibraryDetailsQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDetailsQuery> = {
        loading: false,
        called: true,
        data: {
            libraries: {
                list: [{...mockLibraryDetailsQueryResultList, behavior: gqlTypes.LibraryBehavior.files}],
            },
        },
    };
    const mockDirectoriesLibraryDetailsQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDetailsQuery> = {
        loading: false,
        called: true,
        data: {
            libraries: {
                list: [{...mockLibraryDetailsQueryResultList, behavior: gqlTypes.LibraryBehavior.directories}],
            },
        },
    };
    const mockStandardLibraryDetailsQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDetailsQuery> = {
        loading: false,
        called: true,
        data: {
            libraries: {
                list: [{...mockLibraryDetailsQueryResultList, behavior: gqlTypes.LibraryBehavior.standard}],
            },
        },
    };
    const mockJoinLibraryDetailsQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDetailsQuery> = {
        loading: false,
        called: true,
        data: {
            libraries: {
                list: [{...mockLibraryDetailsQueryResultList, behavior: gqlTypes.LibraryBehavior.join}],
            },
        },
    };

    const mockGetLibraryByIdQueryResult: Mockify<typeof gqlTypes.useGetLibraryByIdQuery> = {
        loading: false,
        called: true,
        data: {
            libraries: {
                list: [{...mockLibraryDetailsQueryResultList, behavior: gqlTypes.LibraryBehavior.standard}],
            },
        },
    };

    const mockMassEditableAttributesQueryResult: Mockify<typeof gqlTypes.useMassEditableAttributesQuery> = {
        loading: false,
        called: true,
        data: {
            attributes: {
                list: [],
            },
        },
    };

    const mockExplorerAttributesQueryResult: Mockify<typeof gqlTypes.useExplorerAttributesQuery> = {
        loading: false,
        called: true,
        data: {
            attributes: {
                list: [
                    {
                        id: simpleMockAttribute.id,
                        label: simpleMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: simpleMockAttribute.type,
                        format: simpleMockAttribute.format,
                        multiple_values: true,
                    },
                    {
                        id: linkMockAttribute.id,
                        label: linkMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: linkMockAttribute.type,
                        format: linkMockAttribute.format,
                        multiple_values: false,
                    },
                    {
                        id: multivalLinkMockAttribute.id,
                        label: multivalLinkMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: multivalLinkMockAttribute.type,
                        format: multivalLinkMockAttribute.format,
                        multiple_values: true,
                    },
                    {
                        id: simpleRichTextMockAttribute.id,
                        label: simpleRichTextMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: simpleRichTextMockAttribute.type,
                        format: simpleRichTextMockAttribute.format,
                        multiple_values: false,
                    },
                    {
                        id: simpleColorMockAttribute.id,
                        label: simpleColorMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: simpleColorMockAttribute.type,
                        format: simpleColorMockAttribute.format,
                        multiple_values: false,
                    },
                    {
                        id: multivalColorMockAttribute.id,
                        label: multivalColorMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: multivalColorMockAttribute.type,
                        format: multivalColorMockAttribute.format,
                        multiple_values: true,
                    },
                    {
                        id: booleanMockAttribute.id,
                        label: booleanMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: booleanMockAttribute.type,
                        format: booleanMockAttribute.format,
                        multiple_values: false,
                    },
                    {
                        id: simpleDateRangeMockAttribute.id,
                        label: simpleDateRangeMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: simpleDateRangeMockAttribute.type,
                        format: simpleDateRangeMockAttribute.format,
                        multiple_values: false,
                    },
                    {
                        id: multivalDateRangeMockAttribute.id,
                        label: multivalDateRangeMockAttribute.label,
                        permissions: {
                            access_attribute: true,
                        },
                        type: multivalDateRangeMockAttribute.type,
                        format: multivalDateRangeMockAttribute.format,
                        multiple_values: true,
                    },
                ],
            },
        },
    };

    const customPrimaryActions: IPrimaryAction[] = [
        {
            label: 'Additional action 1',
            icon: <FontAwesomeIcon icon={faStar} />,
            callback: vi.fn(),
        },
        {
            label: 'Additional action 2',
            icon: <FontAwesomeIcon icon={faCheck} />,
            callback: vi.fn(),
        },
    ];
    const [customPrimaryAction1, customPrimaryAction2] = customPrimaryActions;

    const mockViewsResult: Mockify<typeof gqlTypes.useGetViewsListQuery> = {
        data: {
            views: {
                list: [
                    {
                        id: '43',
                        shared: false,
                        display: {
                            type: gqlTypes.ViewTypes.list,
                        },
                        created_by: {
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'Admin',
                                library: {
                                    id: 'users',
                                },
                            },
                        },
                        label: {en: 'Second view'},
                        filters: [],
                        sort: [],
                    },
                    {
                        id: '42',
                        shared: false,
                        display: {
                            type: gqlTypes.ViewTypes.list,
                        },
                        created_by: {
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'Admin',
                                library: {
                                    id: 'users',
                                },
                            },
                        },
                        label: {en: 'My view'},
                        filters: [],
                        sort: [],
                    },
                ],
            },
        },
        loading: false,
        called: true,
    };

    const attributesList = [
        {
            ...simpleMockAttribute,
            id: 'simple_attribute',
            label: {fr: 'Attribut simple'},
            permissions: {access_attribute: true},
        },
        {
            ...linkMockAttribute,
            id: 'link_attribute',
            label: {fr: 'Attribut lien'},
            permissions: {access_attribute: true},
        },
    ];

    const mockAttributesByLibResult: Mockify<typeof gqlTypes.useGetAttributesByLibWithPermissionsQuery> = {
        data: {attributes: {list: attributesList}},
        loading: false,
        called: true,
    };

    const mockMeResult: Mockify<typeof gqlTypes.useMeQuery> = {
        data: {
            me: {
                id: 'admin',
                whoAmI: {
                    id: 'admin',
                },
            },
        },
    };

    let spyUseExplorerLibraryDataQuery: ReturnType<typeof vi.spyOn>;

    const libraryEntrypoint: IEntrypointLibrary = {
        type: 'library',
        libraryId: 'campaigns',
    };

    const linkEntrypoint: IEntrypointLink = {
        type: 'link',
        parentLibraryId: 'campaigns',
        parentRecordId: '42',
        linkAttributeId: 'link_attribute',
    };

    const explorerLinkAttribute = {
        id: 'link_attribute',
        type: gqlTypes.AttributeType.advanced_link,
        multiple_values: true,
        permissions: {
            access_attribute: true,
            edit_value: true,
            __typename: 'AttributePermissions',
        },
        label: {
            en: 'Delivery Platforms',
            fr: 'Plateformes de diffusion',
        },
        linked_library: {
            id: 'delivery_platforms',
            label: {
                fr: 'Plateformes de diffusion',
            },
            __typename: 'Library',
        },
        valuesList: [],
        smart_filter: null,
        __typename: 'LinkAttribute',
    };

    interface IExplorerLinkAttributeQueryMockType {
        request: {
            query: typeof gqlTypes.ExplorerLinkAttributeDocument;
            variables: gqlTypes.ExplorerLinkAttributeQueryVariables;
        };
        result: {
            data: gqlTypes.ExplorerLinkAttributeQuery;
        };
    }

    const explorerLinkAttributeNoPermissions = {
        id: 'link_attribute',
        type: gqlTypes.AttributeType.advanced_link,
        multiple_values: true,
        label: {
            en: 'Delivery Platforms',
            fr: 'Plateformes de diffusion',
            __typename: 'Translation',
        },
        permissions: {
            access_attribute: true,
            edit_value: false,
            __typename: 'AttributePermissions',
        },
        linked_library: {
            id: 'delivery_platforms',
            label: {
                fr: 'Plateformes de diffusion',
            },
            __typename: 'Library',
        },
        valuesList: [],
        smart_filter: null,
        __typename: 'LinkAttribute',
    };

    const ExplorerLinkAttributeWithoutPermissionsQueryMock: IExplorerLinkAttributeQueryMockType = {
        request: {
            query: gqlTypes.ExplorerLinkAttributeDocument,
            variables: {
                id: linkEntrypoint.linkAttributeId,
            },
        },
        result: {
            data: {
                attributes: {
                    list: [explorerLinkAttributeNoPermissions],
                },
            },
        },
    };

    const ExplorerLinkAttributeQueryMock: IExplorerLinkAttributeQueryMockType = {
        request: {
            query: gqlTypes.ExplorerLinkAttributeDocument,
            variables: {
                id: linkEntrypoint.linkAttributeId,
            },
        },
        result: {
            data: {
                attributes: {
                    list: [explorerLinkAttribute],
                },
            },
        },
    };

    const useGetRecordUpdatesSubscriptionMock = vi.spyOn(
        useGetRecordUpdatesSubscription,
        'useGetRecordUpdatesSubscription',
    );

    let user: ReturnType<typeof userEvent.setup>;
    let useColumnWidthSpy: ReturnType<typeof vi.spyOn> | undefined;

    beforeEach(() => {
        const fetch = vi.fn();

        spyUseExplorerLibraryDataQuery = vi
            .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
            .mockImplementation(() => mockExplorerLibraryDataQueryResult as gqlTypes.ExplorerLibraryDataQueryResult);

        vi.spyOn(gqlTypes, 'useExplorerLibraryCountDataQuery').mockImplementation(
            () => mockExplorerLibraryCountDataQueryResult as gqlTypes.ExplorerLibraryCountDataQueryHookResult,
        );

        vi.spyOn(gqlTypes, 'useExplorerLibraryDataLazyQuery').mockImplementation(
            () => [fetch] as unknown as gqlTypes.ExplorerLibraryDataLazyQueryHookResult,
        );

        vi.spyOn(gqlTypes, 'useExplorerLinkDataQuery').mockImplementation(
            () => mockExplorerLinkDataQueryResult as gqlTypes.ExplorerLinkDataQueryResult,
        );

        vi.spyOn(gqlTypes, 'useExplorerLibraryDetailsQuery').mockImplementation(
            () => mockStandardLibraryDetailsQueryResult as gqlTypes.ExplorerLibraryDetailsQueryResult,
        );

        vi.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockImplementation(
            () => mockExplorerAttributesQueryResult as gqlTypes.ExplorerAttributesQueryResult,
        );

        vi.spyOn(gqlTypes, 'useExplorerAttributesLazyQuery').mockImplementation(
            () =>
                [() => mockExplorerAttributesQueryResult] as unknown as gqlTypes.ExplorerAttributesLazyQueryHookResult,
        );

        vi.spyOn(gqlTypes, 'useGetViewsListQuery').mockReturnValue(mockViewsResult as gqlTypes.GetViewsListQueryResult);

        vi.spyOn(gqlTypes, 'useGetAttributesByLibWithPermissionsQuery').mockReturnValue(
            mockAttributesByLibResult as gqlTypes.GetAttributesByLibWithPermissionsQueryResult,
        );

        vi.spyOn(gqlTypes, 'useMeQuery').mockReturnValue(mockMeResult as gqlTypes.MeQueryResult);

        vi.spyOn(gqlTypes, 'useGetLibraryByIdQuery').mockReturnValue(
            mockGetLibraryByIdQueryResult as gqlTypes.GetLibraryByIdQueryResult,
        );

        vi.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue(
            mockMassEditableAttributesQueryResult as gqlTypes.MassEditableAttributesQueryResult,
        );

        // TODO: useless except for remove logs warning `No more mocked`
        useGetRecordUpdatesSubscriptionMock.mockReturnValue({
            loading: false,
            restart: vi.fn(),
        });

        vi.clearAllMocks();
        user = userEvent.setup();
    });

    // useColumnWidth is mocked per-test with a hookless implementation; restore it so the static
    // mock never leaks into other tests and never mismatches the real hook count between renders.
    afterEach(() => {
        useColumnWidthSpy?.mockRestore();
        useColumnWidthSpy = undefined;
    });

    describe('element visibility props', () => {
        test('should not display primary actions', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultPrimaryActions={[]} />);

            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
        });

        test('should not display filters in the toolbar', () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    currentView={{
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                        ],
                    }}
                />,
            );
            expect(screen.queryByText(simpleMockAttribute.label.fr)).not.toBeInTheDocument();
        });

        test('should not display hidden filters in the toolbar', () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showFilters
                    currentView={{
                        filters: [
                            // Masked pre-filter: stays a FULL `hidden` filter (not lean) → never shown.
                            {
                                id: 'hidden_filter',
                                attribute: {
                                    id: simpleMockAttribute.id,
                                    format: simpleMockAttribute.format,
                                    label: simpleMockAttribute.label.fr,
                                    type: simpleMockAttribute.type,
                                },
                                hidden: true as const,
                                field: simpleMockAttribute.id,
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                value: 'Christmas',
                            },
                            // Lean user filter → shown.
                            {
                                attributes: [{id: booleanMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.EQUAL,
                                values: ['true'],
                                pinned: true,
                            },
                        ],
                    }}
                />,
            );
            expect(screen.queryByText(simpleMockAttribute.label.fr)).not.toBeInTheDocument();
            expect(screen.queryByText(booleanMockAttribute.label.fr)).toBeInTheDocument();
        });

        test('should display filters in the toolbar', () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showFilters
                    currentView={{
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                        ],
                    }}
                />,
            );
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();
        });

        test('should not display the settings button', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            expect(screen.queryByRole('button', {name: /settings/})).not.toBeInTheDocument();
        });

        test('should display the settings button', () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    currentView={{}}
                    defaultCallbacks={{viewSettings: {onViewSettingsShortcutClick: vi.fn()}}}
                />,
            );

            expect(screen.getByRole('button', {name: 'explorer.viewSettings.display'})).toBeVisible();
        });

        test('should not display the title', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            expect(screen.queryByText(campaignName)).not.toBeInTheDocument();
        });

        test('should display the title', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} showTitle />);

            expect(screen.getByText(campaignName)).toBeInTheDocument();
        });

        test('should not display the search field', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);
            expect(screen.queryByRole('textbox', {name: /search/})).not.toBeInTheDocument();
        });

        test('should display the search field', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} showSearch />);
            expect(screen.getByRole('textbox', {name: /search/})).toBeInTheDocument();
        });

        test('should display the table headers', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);
            expect(screen.getByRole('columnheader', {name: 'explorer.name'})).toBeInTheDocument();
        });

        test('should not display the table headers', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} hideTableHeader />);

            expect(screen.queryByRole('columnheader', {name: 'explorer.name'})).not.toBeInTheDocument();
            expect(screen.queryByRole('columnheader', {name: 'explorer.actions'})).not.toBeInTheDocument();
        });

        test('should display the selection checkboxes and button', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            const tableRows = getRecordRows();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records
            const [firstRecordRow] = tableRows;
            expect(within(firstRecordRow).getByRole('checkbox')).toBeInTheDocument();

            expect(screen.queryByText(/explorer.massAction.results/)).toBeInTheDocument();
        });

        test('should display the selection checkboxes when defaultCallbacks.item.select is provided', () => {
            const onSelect = vi.fn();

            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    defaultMassActions={[]}
                    massActions={[]}
                    defaultCallbacks={{item: {select: onSelect}}}
                />,
            );

            const tableRows = getRecordRows();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records
            const [firstRecordRow] = tableRows;
            expect(within(firstRecordRow).getByRole('checkbox')).toBeInTheDocument();
        });

        test('should not display the selection checkboxes and button', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} disableSelection />);

            const tableRows = getRecordRows();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records
            const [firstRecordRow] = tableRows;
            expect(within(firstRecordRow).queryByRole('checkbox')).not.toBeInTheDocument();

            expect(screen.queryByText(/explorer.massAction.results/)).not.toBeInTheDocument();
        });

        test('should display the select all action', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            expect(screen.queryByText(/explorer.massAction.results/)).toBeVisible();
        });

        test('should not display the select all action', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} hideSelectAllAction />);

            expect(screen.queryByText(/explorer.massAction.itemsTotal/)).not.toBeInTheDocument();
        });

        test('should display the pagination', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            expect(screen.getByText(/explorer.pagination-total-number/)).toBeInTheDocument();
        });

        test('should not display the pagination', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} noPagination />);

            expect(screen.queryByText(/explorer.pagination-total-number/)).not.toBeInTheDocument();
        });
    });

    describe('props title', () => {
        test('Should display library label as title', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} showTitle />);

            expect(screen.getByText(campaignName)).toBeInTheDocument();
        });

        test('Should display custom title', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} title="Here's my explorer!" showTitle />);

            expect(screen.getByText("Here's my explorer!")).toBeInTheDocument();
        });
    });

    test('Should display the list of records in a table', async () => {
        render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

        expect(screen.getAllByRole('table')[0]).toBeVisible();
        expect(getRecordRows()).toHaveLength(mockRecords.length); // 2 records
        const [record1, record2] = mockRecords;
        expect(screen.getByText(record1.whoAmI.label)).toBeInTheDocument();
        expect(screen.getByText(record2.whoAmI.label)).toBeInTheDocument();
    });

    test('Should display message on empty data (default)', async () => {
        spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
        render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

        expect(screen.getByText(/empty-data/)).toBeVisible();
    });

    test('Should display message on empty data (custom)', async () => {
        spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);

        const emptyCustomMessage = 'EmptyCustomMessage';

        render(<ExplorerV2 entrypoint={libraryEntrypoint} emptyPlaceholder={emptyCustomMessage} />);

        expect(screen.getByText(emptyCustomMessage)).toBeVisible();
    });

    test('Should display the list of records in a table with attributes values', async () => {
        render(
            <ExplorerV2
                entrypoint={libraryEntrypoint}
                currentView={{
                    attributesIds: [
                        simpleMockAttribute.id,
                        linkMockAttribute.id,
                        multivalLinkMockAttribute.id,
                        simpleRichTextMockAttribute.id,
                        simpleColorMockAttribute.id,
                        multivalColorMockAttribute.id,
                        booleanMockAttribute.id,
                        simpleDateRangeMockAttribute.id,
                        multivalDateRangeMockAttribute.id,
                    ],
                }}
            />,
        );

        const tableRows = getRecordRows();
        expect(screen.getAllByRole('table')[0]).toBeVisible();
        expect(tableRows).toHaveLength(mockRecords.length); // 2 records
        const [firstRecordRow, secondRecordRow] = tableRows;
        const [record1] = mockRecords;
        const [
            selectRowCell,
            whoAmICell,
            simpleAttributeCell,
            linkCell,
            multivalLinkCell,
            simpleRichTextCell,
            simpleColorCell,
            multivalColorCell,
            boolCell,
            simpleDateRangeCell,
            multivalDateRangeCell,
        ] = within(firstRecordRow).getAllByRole('cell');

        const secondRowCells = within(secondRecordRow).getAllByRole('cell');

        expect(within(whoAmICell).getByText(record1.whoAmI.label)).toBeInTheDocument();

        expect(await within(simpleAttributeCell).findByText(recordId1)).toBeVisible();

        expect(within(linkCell).getByText(mockRecord.label)).toBeVisible();
        expect(within(linkCell).getByText(mockRecord.subLabel)).toBeVisible();

        expect(within(multivalLinkCell).getByText('RA')).toBeVisible();
        expect(within(multivalLinkCell).getByText('RB')).toBeVisible();
        expect(within(multivalLinkCell).getByText('RC')).toBeVisible();
        expect(within(multivalLinkCell).getByText('RD')).toBeVisible();
        expect(within(multivalLinkCell).getByRole('img')).toHaveAttribute('src', mockRecord.preview?.small);
        expect(within(multivalLinkCell).getByText('+2')).toBeVisible();

        expect(simpleRichTextCell).toHaveTextContent('This is a test enrich text');

        expect(simpleColorCell).toHaveTextContent(colorRecord1);

        expect(within(multivalColorCell).getByText('#00FF00')).toBeVisible();
        expect(within(multivalColorCell).getByText('#FF0000')).toBeVisible();
        expect(within(multivalColorCell).getByText('#0000FF')).toBeVisible();

        expect(within(boolCell).getByText(/yes/)).toBeVisible();
        expect(within(secondRowCells[8]).getByText(/no/)).toBeVisible();

        expect(within(simpleDateRangeCell).getByText(new RegExp(dateRangeRecord1.from))).toBeVisible();
        expect(within(simpleDateRangeCell).getByText(new RegExp(dateRangeRecord1.to))).toBeVisible();

        expect(within(multivalDateRangeCell).getByText(new RegExp(dateRangeRecord1.from))).toBeVisible();
        expect(within(multivalDateRangeCell).getByText(new RegExp(dateRangeRecord1.to))).toBeVisible();
        expect(within(multivalDateRangeCell).getByText(new RegExp(dateRangeRecord2.from))).toBeVisible();
        expect(within(multivalDateRangeCell).getByText(new RegExp(dateRangeRecord2.to))).toBeVisible();
    });

    test('Should be able to deactivate a record with default actions', async () => {
        const mockDeactivateMutation = vi.fn().mockResolvedValue({
            data: {
                deactivateRecords: [
                    {
                        id: mockRecords[0].id,
                        whoAmI: mockRecord,
                    },
                ],
            },
        });

        vi.spyOn(gqlTypes, 'useDeactivateRecordsMutation').mockImplementation(() => [
            mockDeactivateMutation,
            {loading: false, called: false, client: {} as any, reset: vi.fn()},
        ]);

        const onRemove = vi.fn();

        render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultCallbacks={{item: {remove: onRemove}}} />);

        const [, firstRecordRow] = getRecordRows();
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.deactivate-item'}));

        expect(await screen.findByText('explorer.deactivate_item_description', {exact: false})).toBeVisible();
        expect(screen.getByText('global.are_you_sure', {exact: false})).toBeVisible();

        await user.click(screen.getByText('global.confirm'));

        expect(mockDeactivateMutation).toHaveBeenCalled();
        expect(KitAlert.success).toHaveBeenCalledWith({
            showIcon: true,
            duration: SUCCESS_NOTIFICATION_DURATION,
            closable: true,
            message: 'explorer.item_deleted_success',
            description: null,
        });
        expect(onRemove).toHaveBeenCalledWith(
            // TODO: voir Ticket => https://aristid.atlassian.net/browse/LEAVC-845
            expect.objectContaining({
                key: mockRecords[1].id,
                itemId: mockRecords[1].id,
            }),
        );
    });

    test('Should display an error when deactivation returns an error', async () => {
        const mockDeactivateMutation = vi.fn().mockResolvedValue({
            data: {
                deactivateRecords: [],
            },
        });

        vi.spyOn(gqlTypes, 'useDeactivateRecordsMutation').mockImplementation(() => [
            mockDeactivateMutation,
            {loading: false, called: false, client: {} as any, reset: vi.fn()},
        ]);

        const onRemove = vi.fn();

        render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultCallbacks={{item: {remove: onRemove}}} />);

        const [, firstRecordRow] = getRecordRows();
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.deactivate-item'}));

        expect(await screen.findByText('explorer.deactivate_item_description', {exact: false})).toBeVisible();
        expect(screen.getByText('global.are_you_sure', {exact: false})).toBeVisible();
        await user.click(screen.getByText('global.confirm'));

        expect(mockDeactivateMutation).toHaveBeenCalled();
        expect(KitAlert.error).toHaveBeenCalledWith({
            showIcon: true,
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: 'explorer.item_deleted_error',
            description: null,
        });
        expect(onRemove).not.toHaveBeenCalled();
    });

    test('Should be able to activate a record with default actions', async () => {
        spyUseExplorerLibraryDataQuery.mockReturnValue({
            ...mockExplorerLibraryDataQueryResult,
            data: {
                records: {
                    totalCount: mockRecords.length,
                    list: mockRecords.map(record => ({...record, active: false})),
                },
            },
        });

        const mockActivateMutation = vi.fn().mockResolvedValue({
            data: {
                activateRecords: [
                    {
                        id: 42,
                        whoAmI: mockRecord,
                    },
                ],
            },
        });

        vi.spyOn(gqlTypes, 'useActivateRecordsMutation').mockImplementation(() => [
            mockActivateMutation,
            {loading: false, called: false, client: {} as any, reset: vi.fn()},
        ]);

        const onRemove = vi.fn();

        render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultCallbacks={{item: {remove: onRemove}}} />);

        const [, firstRecordRow] = getRecordRows();
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.activate-item'}));

        expect(await screen.findByText('explorer.activate_item_description', {exact: false})).toBeVisible();
        expect(screen.getByText('global.are_you_sure', {exact: false})).toBeVisible();
        await user.click(screen.getByText('global.confirm'));

        expect(mockActivateMutation).toHaveBeenCalled();
        expect(onRemove).not.toHaveBeenCalled();
    });

    test('Should be able to delete a linked record with default actions', async () => {
        const mockDeleteValueMutation = vi.fn().mockReturnValue({
            data: {
                deleteValue: [
                    {
                        id_value: 0,
                        linkValue: mockRecords[0],
                    },
                ],
            },
        });

        vi.spyOn(gqlTypes, 'useDeleteValueMutation').mockImplementation(() => [
            mockDeleteValueMutation,
            {loading: false, called: false, client: {} as any, reset: vi.fn()},
        ]);

        useColumnWidthSpy = vi.spyOn(useColumnWidth, 'useColumnWidth').mockReturnValue({
            ref: {current: null},
            getFieldColumnWidth: () => 500,
            columnWidth: 500,
            actionsColumnHeaderWidth: 464,
        });

        const onRemove = vi.fn();

        render(<ExplorerV2 entrypoint={linkEntrypoint} defaultCallbacks={{item: {remove: onRemove}}} />, {
            mocks: [ExplorerLinkAttributeQueryMock],
        });

        const [, firstRecordRow] = (await screen.findAllByRole('row')).slice(1); // skip the header row
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.delete-item'}));

        expect(await screen.findByText('explorer.delete_link_one')).toBeVisible();
        await user.click(screen.getByText('global.confirm'));

        expect(mockDeleteValueMutation).toHaveBeenCalled();
        expect(onRemove).toHaveBeenCalledWith(
            expect.objectContaining({
                itemId: mockRecords[1].id,
            }),
        );
    });

    test('Should call defaultCallbacks.item.select when a checkbox is clicked', async () => {
        const onSelect = vi.fn();

        render(
            <ExplorerV2
                entrypoint={libraryEntrypoint}
                defaultMassActions={[]}
                massActions={[]}
                defaultCallbacks={{item: {select: onSelect}}}
            />,
        );

        const tableRows = getRecordRows();
        const [firstRecordRow] = tableRows;
        const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');

        await user.click(within(firstSelectRowCell).getByRole('checkbox'));

        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                itemId: mockRecords[0].id,
            }),
        );
    });

    test('Should call the useGetRecordUpdatesSubscription', async () => {
        render(<ExplorerV2 entrypoint={libraryEntrypoint} />);
        expect(useGetRecordUpdatesSubscriptionMock).toHaveBeenCalledTimes(6);
        expect(useGetRecordUpdatesSubscriptionMock.mock.calls[0]).toEqual([
            {
                libraries: [''],
                records: expect.any(Array),
            },
            true,
        ]);
        expect(useGetRecordUpdatesSubscriptionMock.mock.calls[3]).toEqual([
            {
                libraries: [libraryEntrypoint.libraryId],
                records: [recordId1, recordId2],
            },
            false,
        ]);
    });

    describe('Item actions', () => {
        test('Should display the list of records with custom actions', async () => {
            const customAction = {
                icon: <FontAwesomeIcon icon={faCog} />,
                label: 'Custom action',
                callback: vi.fn(),
            } satisfies IItemAction;

            render(<ExplorerV2 entrypoint={libraryEntrypoint} itemActions={[customAction]} />);

            const [, firstRecordRow] = getRecordRows();
            await user.click(within(firstRecordRow).getByRole('button', {name: customAction.label}));

            expect(customAction.callback).toHaveBeenCalled();
        });

        test('Should display the list of records with a lot of custom actions', async () => {
            const customActions = [
                {
                    label: 'Test 1',
                    icon: <FontAwesomeIcon icon={faStar} />,
                    callback: vi.fn(),
                },
                {
                    label: 'Test 2',
                    icon: <FontAwesomeIcon icon={faCheck} />,
                    callback: vi.fn(),
                },
                {
                    label: 'Test 3',
                    icon: <FontAwesomeIcon icon={faEdit} />,
                    callback: vi.fn(),
                },
                {
                    label: 'Test 4',
                    icon: <FontAwesomeIcon icon={faTrash} />,
                    callback: vi.fn(),
                },
            ] satisfies IItemAction[];

            render(<ExplorerV2 entrypoint={libraryEntrypoint} itemActions={customActions} />);

            const [, firstRecordRow] = getRecordRows();
            await user.hover(within(firstRecordRow).getByRole('button', {name: 'explorer.more-actions'}));

            expect(within(firstRecordRow).getByRole('button', {name: /Test 1/})).toBeVisible();
            expect(within(firstRecordRow).getByRole('button', {name: /Test 2/})).toBeVisible();

            // if there are more than 3 items, the first two are visible and the following ones are placed in a dropdown (see TableNameCell)
            await waitFor(() => {
                expect(screen.getByRole('menuitem', {name: /Test 3/})).toBeInTheDocument();
                expect(screen.getByRole('menuitem', {name: /Test 4/})).toBeInTheDocument();
            });

            await user.click(screen.getByRole('menuitem', {name: customActions[2].label}));

            expect(customActions[2].callback).toHaveBeenCalled();
        });

        test('Should display the list of records with no actions', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultActionsForItem={[]} />);

            const [, firstRecordRow] = getRecordRows();
            expect(within(firstRecordRow).queryByRole('button')).not.toBeInTheDocument();
        });

        test('Should call the action on row click if item action is flagged as useItemActionOnRowClick', async () => {
            const customAction = {
                icon: <FontAwesomeIcon icon={faCog} />,
                label: 'Custom action',
                useItemActionOnRowClick: true,
                callback: vi.fn(),
            } satisfies IItemAction;

            render(<ExplorerV2 entrypoint={libraryEntrypoint} itemActions={[customAction]} />);

            const [, firstRecordRow] = getRecordRows();
            await user.click(firstRecordRow);
            expect(customAction.callback).toHaveBeenCalled();
        });

        test('Should not call the action on row click if user click on more actions button', async () => {
            const customActions = [
                {
                    label: 'Test 1',
                    icon: <FontAwesomeIcon icon={faStar} />,
                    callback: vi.fn(),
                    useItemActionOnRowClick: true,
                },
                {
                    label: 'Test 2',
                    icon: <FontAwesomeIcon icon={faCheck} />,
                    callback: vi.fn(),
                },
                {
                    label: 'Test 3',
                    icon: <FontAwesomeIcon icon={faEdit} />,
                    callback: vi.fn(),
                },
                {
                    label: 'Test 4',
                    icon: <FontAwesomeIcon icon={faTrash} />,
                    callback: vi.fn(),
                },
            ] satisfies IItemAction[];

            render(<ExplorerV2 entrypoint={libraryEntrypoint} itemActions={customActions} />);

            const [, firstRecordRow] = getRecordRows();
            await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.more-actions'}));
            expect(customActions[0].callback).not.toHaveBeenCalled();
        });
    });

    describe('Primary Action', () => {
        test('should display the primary actions button', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);
            expect(screen.getByRole('button', {name: 'explorer.create-one'})).toBeInTheDocument();
        });

        test('should not display the primary actions button', () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} hidePrimaryActions />);
            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
        });

        describe('showCreateOnNoResultOnly property', () => {
            test('should not display the primary actions button if library data is not empty', () => {
                render(<ExplorerV2 entrypoint={libraryEntrypoint} showCreateOnNoResultOnly />);
                expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            });

            test('should not display the primary actions button if library data is empty and entrypoint is not a library', () => {
                spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
                render(<ExplorerV2 entrypoint={linkEntrypoint} showCreateOnNoResultOnly />, {
                    mocks: [ExplorerLinkAttributeWithoutPermissionsQueryMock],
                });
                expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            });

            test('multiple actions should be in a dropdown', async () => {
                spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
                render(<ExplorerV2 entrypoint={libraryEntrypoint} primaryActions={customPrimaryActions} />);

                expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
                expect(screen.queryByText(customPrimaryAction1.label)).not.toBeInTheDocument();
                expect(screen.queryByText(customPrimaryAction2.label)).not.toBeInTheDocument();

                const dropdownButton = await screen.findByRole('dropdown-trigger');
                await user.click(dropdownButton);
                await waitFor(() => {
                    expect(screen.getByRole('menuitem', {name: 'explorer.create-one'})).toBeVisible();
                    expect(screen.getByRole('menuitem', {name: customPrimaryAction1.label})).toBeVisible();
                    expect(screen.getByRole('menuitem', {name: customPrimaryAction2.label})).toBeVisible();
                });
            });

            test('should not display the primary actions button if library data is empty and entrypoint has allowFreeEntry set to false', () => {
                spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
                render(
                    <ExplorerV2 entrypoint={{...libraryEntrypoint, allowFreeEntry: false}} showCreateOnNoResultOnly />,
                );
                expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            });

            test('should not display the primary actions button if link library data is empty and user permission for create_record on linked library is set to false', () => {
                spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);

                vi.spyOn(gqlTypes, 'useExplorerLibraryDetailsQuery').mockImplementation(
                    () =>
                        ({
                            loading: false,
                            called: true,
                            data: {
                                libraries: {
                                    list: [
                                        {
                                            ...mockLibraryDetailsQueryResultList,
                                            permissions: {create_record: false},
                                            behavior: gqlTypes.LibraryBehavior.standard,
                                        },
                                    ],
                                },
                            },
                        }) as gqlTypes.ExplorerLibraryDetailsQueryResult,
                );

                render(<ExplorerV2 entrypoint={{...linkEntrypoint}} showCreateOnNoResultOnly />, {
                    mocks: [ExplorerLinkAttributeWithoutPermissionsQueryMock],
                });
                expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            });

            test('should not display the primary actions button if library data is empty and hidePrimaryActions is set to true', () => {
                spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
                render(<ExplorerV2 entrypoint={libraryEntrypoint} showCreateOnNoResultOnly hidePrimaryActions />);
                expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            });

            test('should display the primary actions button if library data is empty and entrypoint is a library and allowFreeEntry is set to true', () => {
                spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
                render(
                    <ExplorerV2 entrypoint={{...libraryEntrypoint, allowFreeEntry: true}} showCreateOnNoResultOnly />,
                );
                expect(screen.queryByRole('button', {name: 'explorer.create-one'})).toBeInTheDocument();
            });
        });

        test('Should be able to create a new file when library has files behavior', async () => {
            vi.spyOn(gqlTypes, 'useExplorerLibraryDetailsQuery').mockImplementation(
                () => mockFilesLibraryDetailsQueryResult as gqlTypes.ExplorerLibraryDetailsQueryResult,
            );
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

            expect(screen.getByText(UploadFilesMock)).toBeVisible();
        });

        test('Should be able to create a new directory when library has directories behavior', async () => {
            vi.spyOn(gqlTypes, 'useExplorerLibraryDetailsQuery').mockImplementation(
                () => mockDirectoriesLibraryDetailsQueryResult as gqlTypes.ExplorerLibraryDetailsQueryResult,
            );
            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

            expect(screen.getByText(CreateDirectoryMock)).toBeVisible();
        });

        test('Should be able to create a new record when library has standard behavior', async () => {
            const onCreate = vi.fn();
            render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultCallbacks={{primary: {create: onCreate}}} />);

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();
            const createRecordButton = screen.getByRole('button', {name: 'create-record'});
            await user.click(createRecordButton);

            expect(onCreate).toHaveBeenCalledWith({recordIdCreated: 987654});
        });

        test('Should be able to create a new record when library has join behavior', async () => {
            vi.spyOn(gqlTypes, 'useExplorerLibraryDetailsQuery').mockImplementation(
                () => mockJoinLibraryDetailsQueryResult as gqlTypes.ExplorerLibraryDetailsQueryResult,
            );
            const onCreate = vi.fn();
            render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultCallbacks={{primary: {create: onCreate}}} />);

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();
            const createRecordButton = screen.getByRole('button', {name: 'create-record'});
            await user.click(createRecordButton);

            expect(onCreate).toHaveBeenCalledWith({recordIdCreated: 987654});
        });

        test('Should be able to create a new record with custom formId when library has standard behavior', async () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} creationFormId="test-creation" />);

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));
            expect(screen.getByText(EditRecordModalMock)).toBeVisible();
            expect(editRecordFn).toHaveBeenCalledWith(expect.objectContaining({creationFormId: 'test-creation'}));
        });

        test('Should be able to create a new record from Explorer ref', async () => {
            const explorerRef = createRef<IExplorerRef>();
            render(
                <>
                    <ExplorerV2 entrypoint={libraryEntrypoint} ref={explorerRef} hidePrimaryActions />
                    <button onClick={() => explorerRef.current?.createAction?.callback()}>test button</button>
                </>,
            );
            expect(explorerRef.current?.createAction?.label).toEqual('explorer.create-one');
            expect(explorerRef.current?.linkAction).toBeNull();
            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            await user.click(screen.getByRole('button', {name: 'test button'}));
            expect(screen.getByText(EditRecordModalMock)).toBeInTheDocument();
        });

        test('Should be able to create a new record with custom formId when library has standard behavior from Explorer ref', async () => {
            const explorerRef = createRef<IExplorerRef>();
            render(
                <>
                    <ExplorerV2
                        entrypoint={libraryEntrypoint}
                        ref={explorerRef}
                        hidePrimaryActions
                        creationFormId="test-creation"
                    />
                    <button onClick={() => explorerRef.current?.createAction?.callback()}>test button</button>
                </>,
            );

            expect(explorerRef.current?.createAction?.label).toEqual('explorer.create-one');
            expect(explorerRef.current?.linkAction).toBeNull();
            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();

            await user.click(screen.getByRole('button', {name: 'test button'}));

            expect(screen.getByText(EditRecordModalMock)).toBeInTheDocument();
            expect(editRecordFn).toHaveBeenCalledWith(expect.objectContaining({creationFormId: 'test-creation'}));
        });

        test('should not try to link created record if entrypoint is not a link', async () => {
            const saveValues = vi.fn();
            vi.spyOn(useExecuteSaveValueBatchMutation, 'default').mockReturnValue({
                loading: false,
                saveValues,
            });

            render(<ExplorerV2 entrypoint={libraryEntrypoint} />);

            const creatButton = await screen.findByRole('button', {name: 'explorer.create-one'});
            await user.click(creatButton);

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();
            const createButtonLibrary = screen.getByRole('button', {name: 'create-record'});
            await user.click(createButtonLibrary);

            expect(saveValues).not.toHaveBeenCalled();
        });

        test('Should be able to link a new record', async () => {
            const saveValuesResult = 'saveValuesResult';
            const saveValues = vi.fn(async () => saveValuesResult);
            vi.spyOn(useExecuteSaveValueBatchMutation, 'default').mockImplementation(
                () =>
                    ({
                        loading: false,
                        saveValues,
                    }) as unknown as ReturnType<typeof useExecuteSaveValueBatchMutation.default>,
            );
            const onCreate = vi.fn();
            render(<ExplorerV2 entrypoint={linkEntrypoint} defaultCallbacks={{primary: {create: onCreate}}} />, {
                mocks: [ExplorerLinkAttributeQueryMock, ExplorerLinkAttributeQueryMock],
            });

            const dropdownButton = await screen.findByRole('dropdown-trigger');
            await waitFor(() => expect(dropdownButton).toBeVisible());
            await user.click(dropdownButton);

            const createOneAction = screen.getByRole('menuitem', {name: 'explorer.create-one'});
            await waitFor(() => expect(createOneAction).toBeVisible());
            await user.click(createOneAction);

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();

            const createRecordButton = screen.getByRole('button', {name: 'create-record'});
            await user.click(createRecordButton);

            expect(saveValues).toHaveBeenCalledWith(
                {id: linkEntrypoint.parentRecordId, library: {id: linkEntrypoint.parentLibraryId}},
                [{attribute: linkEntrypoint.linkAttributeId, idValue: null, value: 987654}],
            );
            expect(onCreate).toHaveBeenCalledWith({recordIdCreated: 987654, saveValuesResultOnLink: saveValuesResult});
        });

        test('Should be able to link a new record from Explorer ref', async () => {
            const onCreate = vi.fn();
            const saveValuesResult = 'saveValuesResult';
            const saveValues = vi.fn(async () => saveValuesResult);
            vi.spyOn(useExecuteSaveValueBatchMutation, 'default').mockImplementation(
                () =>
                    ({
                        loading: false,
                        saveValues,
                    }) as unknown as ReturnType<typeof useExecuteSaveValueBatchMutation.default>,
            );

            const explorerRef = createRef<IExplorerRef>();
            render(
                <>
                    <ExplorerV2
                        entrypoint={linkEntrypoint}
                        ref={explorerRef}
                        hidePrimaryActions
                        defaultCallbacks={{primary: {create: onCreate}}}
                    />
                    <button onClick={() => explorerRef.current?.createAction?.callback()}>test button</button>
                </>,
                {
                    mocks: [ExplorerLinkAttributeQueryMock, ExplorerLinkAttributeQueryMock],
                },
            );
            expect(explorerRef.current?.linkAction?.label).toEqual('record_edition.replace-by-existing-item');
            expect(explorerRef.current?.createAction?.label).toEqual('explorer.create-one');
            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            await user.click(screen.getByRole('button', {name: 'test button'}));
            expect(screen.getByText(EditRecordModalMock)).toBeVisible();

            const createRecordButton = screen.getByRole('button', {name: 'create-record'});
            await user.click(createRecordButton);

            expect(saveValues).toHaveBeenCalledWith(
                {id: linkEntrypoint.parentRecordId, library: {id: linkEntrypoint.parentLibraryId}},
                [{attribute: linkEntrypoint.linkAttributeId, idValue: null, value: 987654}],
            );
            expect(onCreate).toHaveBeenCalledWith({recordIdCreated: 987654, saveValuesResultOnLink: saveValuesResult});
        });

        test('Should be able to link existing record', async () => {
            const saveValues = vi.fn();
            const onLink = vi.fn();
            vi.spyOn(useExecuteSaveValueBatchMutation, 'default').mockReturnValue({
                loading: false,
                saveValues,
            });
            render(
                <ExplorerV2
                    entrypoint={linkEntrypoint}
                    defaultPrimaryActions={[]}
                    defaultCallbacks={{primary: {link: onLink}}}
                    currentView={{}}
                />,
                {
                    mocks: [ExplorerLinkAttributeQueryMock, ExplorerLinkAttributeQueryMock],
                },
            );

            const linkExistingButton = await screen.findByRole(
                'button',
                {name: 'explorer.add-existing-item'},
                {timeout: 5000},
            );
            await user.click(linkExistingButton);

            expect(screen.getByText(LinkRecordModalMock)).toBeVisible();

            const createRecordButton = screen.getByRole('button', {name: 'link-record'});

            await user.click(createRecordButton);
            expect(onLink).toHaveBeenCalledWith([987654]);
        });

        test('Should be able to display custom primary actions', async () => {
            render(<ExplorerV2 entrypoint={libraryEntrypoint} primaryActions={customPrimaryActions} />);

            const dropdownButton = await screen.findByRole('dropdown-trigger');

            expect(screen.queryByText(customPrimaryAction1.label)).not.toBeInTheDocument();
            expect(screen.queryByText(customPrimaryAction2.label)).not.toBeInTheDocument();

            await user.click(dropdownButton);

            await waitFor(() => expect(screen.getByRole('menuitem', {name: customPrimaryAction1.label})).toBeVisible());
            await waitFor(() => expect(screen.getByRole('menuitem', {name: customPrimaryAction2.label})).toBeVisible());

            await user.click(screen.getByRole('menuitem', {name: customPrimaryAction1.label}));
            expect(customPrimaryActions[0].callback).toHaveBeenCalled();
        });

        test('Should be able to display custom primary actions without create button', async () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    primaryActions={customPrimaryActions}
                    defaultPrimaryActions={[]}
                />,
            );

            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();

            const dropdownButton = await screen.findByRole('dropdown-trigger');
            await user.click(dropdownButton);

            const firstActionButton = screen.getByRole('menuitem', {name: customPrimaryAction1.label});
            const secondActionButton = screen.getByRole('menuitem', {name: customPrimaryAction2.label});
            await waitFor(() => expect(firstActionButton).toBeVisible());
            expect(secondActionButton).toBeVisible();

            await user.click(firstActionButton);
            expect(customPrimaryActions[0].callback).toHaveBeenCalled();

            await user.click(secondActionButton);
            expect(customPrimaryActions[1].callback).toHaveBeenCalled();
        });
    });

    test('Should be able to make a fulltext search', async () => {
        const mockExplorerLibraryDataQueryResultWithSearch: Mockify<typeof gqlTypes.useExplorerLibraryDataQuery> = {
            loading: false,
            called: true,
            data: {
                records: {
                    totalCount: 1,
                    list: [
                        {
                            id: '613982168',
                            permissions: {
                                delete_record: true,
                            },
                            whoAmI: {
                                id: '613982168',
                                label: 'Christmas 2024',
                                subLabel: 'Du 20 décembre 2024 au 31 décembre 2024',
                                color: null,
                                library: {
                                    id: 'campaigns',
                                    label: {
                                        en: 'Campaigns',
                                        fr: 'Campagnes',
                                    },
                                },
                                preview: null,
                            },
                            properties: [],
                        },
                    ],
                },
            },
        };
        // ExplorerV2 no longer accepts a view-level pageSize (it is ephemeral; options [20, 50]).
        // Report a totalCount above the default page size so the data spans more than one page.
        const mockExplorerLibraryDataQueryResultMultiplePages = {
            ...mockExplorerLibraryDataQueryResult,
            data: {records: {totalCount: 40, list: mockRecords}},
        };
        const spy = vi
            .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
            .mockImplementation(
                ({variables}) =>
                    (variables?.searchQuery
                        ? mockExplorerLibraryDataQueryResultWithSearch
                        : mockExplorerLibraryDataQueryResultMultiplePages) as gqlTypes.ExplorerLibraryDataQueryResult,
            );

        render(
            <ExplorerV2
                entrypoint={libraryEntrypoint}
                primaryActions={customPrimaryActions}
                defaultPrimaryActions={[]}
                currentView={{}}
                showSearch
            />,
        );

        const searchInput = screen.getByRole('textbox', {name: /search/});
        await userEvent.type(searchInput, 'Christ{Enter}');

        expect(screen.getByText('Christmas 2024')).toBeVisible();

        const clearButton = screen.getByLabelText('clear');
        await user.click(clearButton);

        expect(screen.getByText('Halloween 2025')).toBeVisible();

        // GO TO PAge 2, then perform search and check we call useExplorerData with page 1
        const pagination = screen.getByRole('list', {name: /pagination/});
        const secondPageButton = within(pagination).getByRole('listitem', {name: '2'});
        await userEvent.click(secondPageButton);

        expect(secondPageButton).toHaveClass('ant-pagination-item-active');

        await userEvent.type(searchInput, 'Christ{Enter}');
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                variables: expect.objectContaining({
                    pagination: expect.objectContaining({
                        offset: 0,
                    }),
                }),
            }),
        );
    });

    describe('With filters', () => {
        const mockExplorerLibraryDataQueryResultWithFilters: Mockify<typeof gqlTypes.useExplorerLibraryDataQuery> = {
            loading: false,
            called: true,
            data: {
                records: {
                    list: [
                        {
                            id: '613982168',
                            permissions: {
                                delete_record: true,
                            },
                            whoAmI: {
                                id: '613982168',
                                label: 'Christmas 2024',
                                subLabel: 'Du 20 décembre 2024 au 31 décembre 2024',
                                color: null,
                                library: {
                                    id: 'campaigns',
                                    label: {
                                        en: 'Campaigns',
                                        fr: 'Campagnes',
                                    },
                                },
                                preview: null,
                            },
                            properties: [],
                        },
                    ],
                },
            },
        };

        test('should handle filters for the request and for the display', async () => {
            const spy = vi
                .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
                .mockImplementation(
                    ({variables}) =>
                        (Array.isArray(variables?.filters) && variables.filters.length
                            ? mockExplorerLibraryDataQueryResultWithFilters
                            : mockExplorerLibraryDataQueryResult) as gqlTypes.ExplorerLibraryDataQueryResult,
                );

            render(
                <ExplorerV2
                    entrypoint={{type: 'library', libraryId: 'campaigns'}}
                    showFilters
                    showSorts
                    currentView={{
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                        ],
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        filters: [
                            {
                                field: simpleMockAttribute.id,
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                value: 'Christmas',
                            },
                        ],
                    }),
                }),
            );
        });

        test('Should handle filters for the request and for the display with OR operator', async () => {
            const spy = vi
                .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
                .mockImplementation(
                    ({variables}) =>
                        (Array.isArray(variables?.filters) && variables.filters.length
                            ? mockExplorerLibraryDataQueryResultWithFilters
                            : mockExplorerLibraryDataQueryResult) as gqlTypes.ExplorerLibraryDataQueryResult,
                );

            render(
                <ExplorerV2
                    entrypoint={{type: 'library', libraryId: 'campaigns'}}
                    showFilters
                    showSorts
                    currentView={{
                        filtersOperator: 'OR',
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                            {
                                attributes: [{id: simpleRichTextMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Test'],
                                pinned: true,
                            },
                        ],
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        filters: [
                            {
                                field: simpleMockAttribute.id,
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                value: 'Christmas',
                            },
                            {operator: 'OR'},
                            {
                                field: simpleRichTextMockAttribute.id,
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                value: 'Test',
                            },
                        ],
                    }),
                }),
            );
        });

        // NOTE: the `withEmptyValues` ("Non défini") flag is LIVE-ONLY — it cannot be seeded through the
        // controlled view (the lean `SerializedFilter` carries no such flag; it is set transiently via the
        // tree/value dropdown). Its IS_EMPTY query wrapping is covered at the `prepareFiltersForRequest`
        // unit level. Here we assert the lean round-trip: a lean filter produces a plain (un-wrapped)
        // condition in the request.
        test('seeds a lean filter into the records request as a plain condition', async () => {
            const spy = vi
                .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
                .mockImplementation(
                    ({variables}) =>
                        (Array.isArray(variables?.filters) && variables.filters.length
                            ? mockExplorerLibraryDataQueryResultWithFilters
                            : mockExplorerLibraryDataQueryResult) as gqlTypes.ExplorerLibraryDataQueryResult,
                );

            render(
                <ExplorerV2
                    entrypoint={{type: 'library', libraryId: 'campaigns'}}
                    showFilters
                    currentView={{
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        filters: [
                            {
                                field: simpleMockAttribute.id,
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                value: 'Christmas',
                            },
                        ],
                    }),
                }),
            );
        });

        // (d) Seeding the controlled filters is NOT a user edit → the host must never be notified, or the
        // view would read as dirty on load. The store's echo-suppression (lastSyncedLeanRef) guarantees it.
        test('does not emit onFiltersChange when seeding the controlled filters (echo-suppressed)', async () => {
            const onFiltersChange = vi.fn();
            render(
                <ExplorerV2
                    entrypoint={{type: 'library', libraryId: 'campaigns'}}
                    showFilters
                    currentView={{
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                        ],
                    }}
                    defaultCallbacks={{viewSettings: {onFiltersChange}}}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();
            // Let any pending effects settle, then assert no spurious emission.
            await waitFor(() => expect(toolbar).toBeVisible());
            expect(onFiltersChange).not.toHaveBeenCalled();
        });

        // (f) Standalone usage (no host callback): the store still seeds and feeds the records request.
        test('seeds and queries records with no onFiltersChange callback (standalone)', () => {
            const spy = vi
                .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
                .mockImplementation(
                    ({variables}) =>
                        (Array.isArray(variables?.filters) && variables.filters.length
                            ? mockExplorerLibraryDataQueryResultWithFilters
                            : mockExplorerLibraryDataQueryResult) as gqlTypes.ExplorerLibraryDataQueryResult,
                );

            expect(() =>
                render(
                    <ExplorerV2
                        entrypoint={{type: 'library', libraryId: 'campaigns'}}
                        showFilters
                        currentView={{
                            filters: [
                                {
                                    attributes: [{id: simpleMockAttribute.id}],
                                    condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                    values: ['Christmas'],
                                    pinned: true,
                                },
                            ],
                        }}
                    />,
                ),
            ).not.toThrow();

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();
            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        filters: [
                            {
                                field: simpleMockAttribute.id,
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                value: 'Christmas',
                            },
                        ],
                    }),
                }),
            );
        });

        // Regression test for the FiltersContext.Provider fix: hidden pre-filters (e.g. a recordPanel's
        // `attributeSource` link scoping) must reach smart-filter dropdowns' `listDistinctValues` query,
        // not just the main records/count requests.
        test("includes the hidden pre-filter in the smart filter dropdown's listDistinctValues query", async () => {
            const smartFilterMockAttribute = {
                id: 'smart_filter_attribute',
                label: {fr: 'Attribut smart filter', en: 'Smart filter attribute'},
                type: gqlTypes.AttributeType.simple,
                format: gqlTypes.AttributeFormat.text,
            };
            const baseAttributesList = (mockExplorerAttributesQueryResult as gqlTypes.ExplorerAttributesQueryResult)
                .data.attributes.list;
            // Built ONCE and served via mockReturnValue: a mockImplementation building a fresh `data`
            // object per call gives `attributesDataById` (useViewFiltersConverter) a new identity every
            // render, re-firing useControlledFilterStore's SEED effect (RESET dispatch) each render —
            // an infinite render loop that hangs the whole run.
            const attributesQueryResultWithSmartFilter = {
                ...mockExplorerAttributesQueryResult,
                data: {
                    attributes: {
                        list: [
                            ...baseAttributesList,
                            {
                                id: smartFilterMockAttribute.id,
                                label: smartFilterMockAttribute.label,
                                permissions: {access_attribute: true},
                                type: smartFilterMockAttribute.type,
                                format: smartFilterMockAttribute.format,
                                multiple_values: false,
                                smart_filter: {enable: true, through: null},
                            },
                        ],
                    },
                },
            } as gqlTypes.ExplorerAttributesQueryResult;
            vi.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockReturnValue(attributesQueryResultWithSmartFilter);

            const smartFilterListValuesSpy = vi.spyOn(gqlTypes, 'useSmartFilterListValuesQuery').mockReturnValue({
                data: {listDistinctValues: []},
                loading: false,
            } as unknown as gqlTypes.SmartFilterListValuesQueryResult);

            render(
                <ExplorerV2
                    entrypoint={{type: 'library', libraryId: 'campaigns'}}
                    showFilters
                    currentView={{
                        filters: [
                            // Masked pre-filter, shaped like PanelAttributeExplorer's `linkPreFilter`
                            // (scopes a recordPanel explorer to records linked via `attributeSource`).
                            {
                                id: 'filter_to_linked_records',
                                hidden: true as const,
                                field: linkMockAttribute.id,
                                subField: 'id',
                                attribute: {
                                    id: linkMockAttribute.id,
                                    type: gqlTypes.AttributeType.simple_link,
                                    label: 'SHOULD BE HIDDEN',
                                },
                                condition: ThroughConditionFilter.THROUGH,
                                subCondition: gqlTypes.RecordFilterCondition.EQUAL,
                                value: '42',
                            },
                            // Lean, pinned user filter on the smart-filter attribute.
                            {
                                attributes: [{id: smartFilterMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.EQUAL,
                                values: [],
                                pinned: true,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = await screen.findByRole('list', {name: /toolbar/});
            await userEvent.click(
                within(toolbar).getByRole('button', {name: new RegExp(smartFilterMockAttribute.label.fr)}),
            );

            await waitFor(() => {
                expect(smartFilterListValuesSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        variables: expect.objectContaining({
                            recordFilters: expect.arrayContaining([
                                expect.objectContaining({
                                    field: `${linkMockAttribute.id}.id`,
                                    condition: gqlTypes.RecordFilterCondition.EQUAL,
                                    value: '42',
                                }),
                            ]),
                        }),
                    }),
                );
            });
        });
    });

    describe('Entrypoint type link', () => {
        test('Should display the list of linked records and call action', async () => {
            const actionCallback = vi.fn();
            render(
                <ExplorerV2
                    entrypoint={linkEntrypoint}
                    primaryActions={customPrimaryActions}
                    defaultPrimaryActions={[]}
                    defaultActionsForItem={[]}
                    itemActions={[
                        {
                            label: 'Test 1',
                            icon: <FontAwesomeIcon icon={faStar} />,
                            callback: actionCallback,
                        },
                    ]}
                />,
                {
                    mocks: [ExplorerLinkAttributeQueryMock],
                },
            );

            const rows = (await screen.findAllByRole('row')).slice(1); // skip the header row
            expect(rows).toHaveLength(2); // 2 linked records
            expect(rows[0]).toHaveTextContent(mockRecords[0].whoAmI.label);

            await user.click(screen.getAllByRole('button', {name: 'Test 1'})[0]);

            expect(actionCallback).toBeCalledWith(
                expect.objectContaining({
                    id_value: mockExplorerLinkDataQueryResultProperty[0].id_value,
                }),
            );
        });

        test('Should display attribute label as title', async () => {
            render(
                <ExplorerV2
                    entrypoint={linkEntrypoint}
                    primaryActions={customPrimaryActions}
                    defaultPrimaryActions={[]}
                    showTitle
                />,
                {
                    // Query called twice : in run time, the cache is effective, but not in tests, so we use the mock twice
                    mocks: [ExplorerLinkAttributeQueryMock, ExplorerLinkAttributeQueryMock],
                },
            );

            expect(await screen.findByText(explorerLinkAttribute.label.fr)).toBeVisible();
        });
    });

    describe('massActions', () => {
        it('should inform about selection (manual)', async () => {
            // GIVEN a simple mass action
            const testMassAction = {
                label: 'test mass action',
                deselectAll: true,
                icon: <FontAwesomeIcon icon={faStar} />,
                callback: vi.fn(),
            };
            // WHEN the component is rendered
            render(
                <ExplorerV2 entrypoint={libraryEntrypoint} defaultMassActions={[]} massActions={[testMassAction]} />,
            );

            // THEN the toolbar should be present
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // GIVEN there is a checkbox on the first record
            const tableRows = getRecordRows();
            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records
            const [firstRecordRow] = tableRows;
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');

            // WHEN the user clicks on it
            await user.click(within(firstSelectRowCell).getByRole('checkbox'));

            // THEN the toolbar is partially checked
            expect(within(toolbar).getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
            // AND the snackbar appears with the count of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|1');

            // GIVEN there is a second checkbox on the second record
            // note: The table re-render, not the same ref as before
            const [, secondRecordRow] = getRecordRows();
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            // WHEN the user clicks on it
            await user.click(within(secondSelectRowCell).getByRole('checkbox'));

            // THEN the toolbar is totally checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();
            // AND the snackbar is updated
            await waitFor(() => expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2'));

            // WHEN the user clicks on the test mass action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: testMassAction.label}));

            // THEN the test mass action is called with the ids
            expect(testMassAction.callback).toHaveBeenCalled();
            expect(testMassAction.callback).toHaveBeenCalledWith(
                [
                    {
                        condition: 'EQUAL',
                        field: 'id',
                        value: '613982168',
                    },
                    {
                        operator: 'OR',
                    },
                    {
                        condition: 'EQUAL',
                        field: 'id',
                        value: '612694174',
                    },
                ],
                ['613982168', '612694174'],
                undefined,
            );

            // AND the selection is cleared
            expect(screen.queryByRole('status')).not.toBeVisible();
        });

        it('should inform about selection all without pagination', async () => {
            // GIVEN a simple mass action
            const testMassAction = {
                label: 'test mass action',
                deselectAll: true,
                icon: <FontAwesomeIcon icon={faStar} />,
                callback: vi.fn(),
            };
            // WHEN the component is rendered without pagination (20 items default page size > 2 mock records)
            render(
                <ExplorerV2 entrypoint={libraryEntrypoint} defaultMassActions={[]} massActions={[testMassAction]} />,
            );

            // THEN the toolbar should be ready
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
            // AND there is 2 records on screen
            const tableRows = getRecordRows();
            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records

            // WHEN the user clicks select all
            await user.click(within(toolbar).getByRole('checkbox'));

            // THEN the checkbox is totally checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();

            // AND the first record is selected
            const [firstRecordRow] = getRecordRows();
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();

            // AND the second record is selected too
            const [, secondRecordRow] = getRecordRows();
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeChecked();

            // AND the snackbar is updated with the cunt of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2');

            // WHEN the user clicks on the test mass action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: testMassAction.label}));

            // THEN the test callback is call with all ids of the selection
            expect(testMassAction.callback).toHaveBeenCalled();
            expect(testMassAction.callback).toHaveBeenCalledWith(
                [
                    {
                        condition: 'EQUAL',
                        field: 'id',
                        value: '613982168',
                    },
                    {
                        operator: 'OR',
                    },
                    {
                        condition: 'EQUAL',
                        field: 'id',
                        value: '612694174',
                    },
                ],
                ['613982168', '612694174'],
                undefined,
            );

            // AND the selection is cleared
            expect(screen.queryByRole('status')).not.toBeVisible();
        });

        it('should inform about selection all with pagination (page only)', async () => {
            // GIVEN a fake response data with only the first record
            const [firstRecord, secondRecord] = mockRecords;
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: 25,
                        list: [firstRecord],
                    },
                },
            } as gqlTypes.ExplorerLibraryDataQueryResult);

            // AND a simple mass test action
            const testMassAction = {
                label: 'test mass action',
                deselectAll: true,
                icon: <FontAwesomeIcon icon={faStar} />,
                callback: vi.fn(),
            };
            // WHEN the component is rendered with some filter and sort and pagination (1 item on 2 pages)
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showFilters
                    showSorts
                    defaultMassActions={[]}
                    massActions={[testMassAction]}
                    currentView={{
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                        ],
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                        ],
                    }}
                />,
            );

            // THEN the toolbar is ready and clean
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // AND there is only the first record in the table
            const tableRows = getRecordRows();
            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(tableRows).toHaveLength(1);

            // WHEN the user clicks on selection all page only
            await user.click(within(toolbar).getByText(/massAction.results\|2/));
            await user.click(
                within(screen.getByRole('menu')).getByRole('menuitem', {name: /toggle_selection.select_page/}),
            );

            // THEN the checkbox in the toolbar should be partially checked because there is 2 items
            expect(within(toolbar).getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');

            // AND the checkbox of the first record is checked
            const [firstRecordRow] = getRecordRows();
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();

            // GIVEN the second call to data on second page return the second record
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: 25,
                        list: [secondRecord],
                    },
                },
            } as gqlTypes.ExplorerLibraryDataQueryResult);
            // WHEN the user goes on the second page
            const nextPageElement = screen.getByTitle<HTMLLIElement>('Next Page');
            await user.click(within(nextPageElement).getByRole<HTMLButtonElement>('button'));

            // THEN the second record is not selected
            const [secondRecordRow] = getRecordRows();
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondSelectRowCell).getByRole('checkbox')).not.toBeChecked();

            // AND the snackbar continues to say 1 selected item (first record)
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|1');

            // WHEN the user clicks on the test mass action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: testMassAction.label}));

            // THEN the callback is called with id of the first record only
            expect(testMassAction.callback).toHaveBeenCalled();
            expect(testMassAction.callback).toHaveBeenCalledWith(
                [
                    {
                        condition: 'EQUAL',
                        field: 'id',
                        value: firstRecord.id,
                    },
                ],
                [firstRecord.id],
                undefined,
            );

            // AND the selection is cleared
            expect(screen.queryByRole('status')).not.toBeVisible();
        });

        it('should inform about selection with pagination (all in once)', async () => {
            // GIVEN the first call to data return only the first record
            const [firstRecord, secondRecord] = mockRecords;
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: 25,
                        list: [firstRecord],
                    },
                },
            } as gqlTypes.ExplorerLibraryDataQueryResult);

            // AND a simple mass test action is set
            const testMassAction = {
                label: 'test mass action',
                deselectAll: true,
                icon: <FontAwesomeIcon icon={faStar} />,
                callback: vi.fn(),
            };
            // WHEN the component renders with 2 pages of one record, with filter and sort
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showFilters
                    showSorts
                    showSearch
                    defaultMassActions={[]}
                    massActions={[testMassAction]}
                    currentView={{
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                        ],
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                        ],
                    }}
                />,
            );

            // THEN the select all checkbox is clear
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
            expect(
                within(toolbar).getByRole('button', {name: new RegExp(simpleMockAttribute.label.fr)}),
            ).not.toHaveClass('kit-filter-disabled');

            // AND only the first record is displayed
            const tableRows = getRecordRows();
            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(tableRows).toHaveLength(1);

            // WHEN the user clicks on the select all checkbox (all pages)
            await user.click(within(toolbar).getByText(/massAction.results\|2/));
            await user.click(
                within(screen.getByRole('menu')).getByRole('menuitem', {name: /toggle_selection.select_all/}),
            );

            // THEN the select all checkbox is totally checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();
            // AND the rest of toolbar: filter is disabled only
            expect(within(toolbar).getByRole('button', {name: new RegExp(simpleMockAttribute.label.fr)})).toHaveClass(
                'kit-filter-disabled',
            );

            // AND the first record is selected
            const [firstRecordRow] = getRecordRows();
            const [firstSelectRowCell, firstWhoAmICell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstWhoAmICell).getByText(firstRecord.whoAmI.label)).toBeVisible();
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();
            // AND the first record is locked (cannot be de-selected manually, cannot be deactivated or edited)
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeDisabled();
            expect(within(firstRecordRow).getByRole('button', {name: /deactivate-item/})).toBeDisabled();

            // GIVEN the second call about data is mocked to return the second record
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: 25,
                        list: [secondRecord],
                    },
                },
            } as gqlTypes.ExplorerLibraryDataQueryResult);
            // WHEN the user clicks on the next page to get the second record
            const nextPageElement = screen.getByTitle<HTMLLIElement>('Next Page');
            await user.click(within(nextPageElement).getByRole<HTMLButtonElement>('button'));

            // THEN the second record is displayed and selected
            const [secondRecordRow] = getRecordRows();
            const [secondSelectRowCell, secondWhoAmICell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondWhoAmICell).getByText(secondRecord.whoAmI.label)).toBeVisible();
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeChecked();
            // AND the second record is locked
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeDisabled();
            expect(within(secondRecordRow).getByRole('button', {name: /deactivate-item/})).toBeDisabled();
            // AND the toolbar: filter stays disabled but displayed
            expect(within(toolbar).getByRole('button', {name: new RegExp(simpleMockAttribute.label.fr)})).toHaveClass(
                'kit-filter-disabled',
            );

            // AND the snackbar is up to date with the count of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2');

            // WHEN the user clicks on the select all checkbox
            await user.click(within(toolbar).getByText(/massAction.results\|2/));
            // THEN there is a possibility to de-select all items
            await waitFor(() => {
                expect(
                    within(screen.getByRole('menu')).getByRole('menuitem', {name: /toggle_selection.deselect_all/}),
                ).toBeVisible();
            });

            // WHEN the user clicks on the simple mass test action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: testMassAction.label}));

            // THEN the callback is called with the filters
            expect(testMassAction.callback).toHaveBeenCalled();
            expect(testMassAction.callback).toHaveBeenCalledWith(
                [
                    {
                        field: 'simple_attribute',
                        condition: 'CONTAINS',
                        value: 'Christmas',
                    },
                ],
                'all',
                undefined,
            );

            // AND the selection is cleared
            expect(screen.queryByRole('status')).not.toBeVisible();
        });

        it('should deactivate massively for simple library (manual selection with only one page)', async () => {
            // GIVEN a mocked deactivate record mutation
            const mockOnUseDeactivateRecordsMutation = vi.fn(() => ({data: {deactivateRecords: []}}));
            vi.spyOn(gqlTypes, 'useDeactivateRecordsMutation').mockImplementation(
                () => [mockOnUseDeactivateRecordsMutation, {}] as any,
            );
            const onDeactivate = vi.fn();
            // WHEN the component is rendered
            render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultCallbacks={{mass: {deactivate: onDeactivate}}} />);

            // WHEN the toolbar is cleared
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // AND the records are displayed
            const tableRows = getRecordRows();
            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records

            // WHEN ths user clicks on the select all checkbox (no pagination)
            await user.click(within(toolbar).getByRole('checkbox'));

            // THEN the toolbar select all checkbox is checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();

            // AND the first record is selected
            const [firstRecordRow] = getRecordRows();
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();
            // AND the second record is selected too
            const [, secondRecordRow] = getRecordRows();
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeChecked();

            // AND the snackbar is up to date with the count of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2');

            // WHEN the user clicks on the mass deactivate action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: /massAction.deactivate/}));
            // THEN a confirmation modal is displayed
            expect(await screen.findByText('explorer.deactivate_item_description', {exact: false})).toBeVisible();
            expect(screen.getByText('global.are_you_sure', {exact: false})).toBeVisible();
            // WHEN the user confirms the deactivation
            await user.click(screen.getByText('global.confirm'));

            // THEN the mock mutation is called with the ids of selected items
            expect(mockOnUseDeactivateRecordsMutation).toHaveBeenCalledTimes(1);
            const [firstRecord, secondRecord] = mockRecords;
            const expectedDeactivateFilters = [
                {field: 'id', condition: 'EQUAL', value: firstRecord.id},
                {operator: 'OR'},
                {field: 'id', condition: 'EQUAL', value: secondRecord.id},
            ];
            expect(mockOnUseDeactivateRecordsMutation).toHaveBeenCalledWith({
                variables: {
                    libraryId: 'campaigns',
                    filters: expectedDeactivateFilters,
                },
            });

            expect(onDeactivate).toHaveBeenCalledWith(expectedDeactivateFilters, [firstRecord.id, secondRecord.id]);

            // AND the selection is cleared
            await waitFor(() => expect(screen.queryByRole('status')).not.toBeVisible());
        });

        // For an unknown reason, the success alert from last test is still present in the next test and makes it fail
        it.skip('should unlink massively for link entrypoint (manual selection with only one page)', async () => {
            // GIVEN a mocked deactivate record mutation
            const mockOnUseDeactivateRecordsMutation = vi.fn(() => ({data: {deactivateRecords: []}}));
            vi.spyOn(gqlTypes, 'useDeactivateRecordsMutation').mockImplementation(
                () => [mockOnUseDeactivateRecordsMutation, {}] as any,
            );
            const onDeactivate = vi.fn();
            // WHEN the component is rendered
            render(<ExplorerV2 entrypoint={libraryEntrypoint} defaultCallbacks={{mass: {deactivate: onDeactivate}}} />);

            // WHEN the toolbar is cleared
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // AND the records are displayed
            const tableRows = getRecordRows();
            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records

            // WHEN ths user clicks on the select all checkbox (no pagination)
            await user.click(within(toolbar).getByRole('checkbox'));

            // THEN the toolbar select all checkbox is checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();

            // AND the first record is selected
            const [firstRecordRow] = getRecordRows();
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();
            // AND the second record is selected too
            const [, secondRecordRow] = getRecordRows();
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeChecked();

            // AND the snackbar is up to date with the count of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2');

            // WHEN the user clicks on the mass deactivate action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: /massAction.deactivate/}));

            // THEN a confirmation modal is displayed
            expect(await screen.findByText('explorer.deactivate_item_description', {exact: false})).toBeVisible();
            expect(screen.getByText('global.are_you_sure', {exact: false})).toBeVisible();
            // WHEN the user confirms the deactivation
            await user.click(screen.getByText(/submit/));

            // THEN the mock mutation is called with the ids of selected items
            expect(mockOnUseDeactivateRecordsMutation).toHaveBeenCalledTimes(1);
            const [firstRecord, secondRecord] = mockRecords;
            const expectedDeactivateFilters = [
                {field: 'id', condition: 'EQUAL', value: firstRecord.id},
                {operator: 'OR'},
                {field: 'id', condition: 'EQUAL', value: secondRecord.id},
            ];
            expect(mockOnUseDeactivateRecordsMutation).toHaveBeenCalledWith({
                variables: {
                    libraryId: 'campaigns',
                    filters: expectedDeactivateFilters,
                },
            });

            expect(onDeactivate).toHaveBeenCalledWith(expectedDeactivateFilters, [firstRecord.id, secondRecord.id]);

            // AND I click to close the success alert (otherwise there are two role status on the screen)
            await user.click(screen.getByRole('button', {name: 'Fermer'}));

            // AND the selection is cleared
            expect(screen.queryByRole('status')).not.toBeVisible();
        });
    });

    describe('Permissions', () => {
        const mockExplorerAttributesPermissionsQueryResult: Mockify<typeof gqlTypes.useExplorerAttributesQuery> = {
            loading: false,
            called: true,
            data: {
                attributes: {
                    list: [
                        {
                            id: simpleMockAttribute.id,
                            label: simpleMockAttribute.label,
                            permissions: {
                                access_attribute: true,
                            },
                            type: simpleMockAttribute.type,
                            format: simpleMockAttribute.format,
                            multiple_values: true,
                        },
                        {
                            id: simpleColorMockAttribute.id,
                            label: simpleColorMockAttribute.label,
                            permissions: {
                                access_attribute: false,
                            },
                            type: simpleColorMockAttribute.type,
                            format: simpleColorMockAttribute.format,
                            multiple_values: false,
                        },
                        {
                            id: booleanMockAttribute.id,
                            label: booleanMockAttribute.label,
                            permissions: {
                                access_attribute: false,
                            },
                            type: booleanMockAttribute.type,
                            format: booleanMockAttribute.format,
                            multiple_values: false,
                        },
                    ],
                },
            },
        };

        test('Should disable delete action on record without delete_record Permission', async () => {
            const mockExplorerLibraryDataQueryWithPermissionsResult: Mockify<
                typeof gqlTypes.useExplorerLibraryDataQuery
            > = {
                loading: false,
                called: true,
                refetch: vi.fn(),
                data: {
                    records: {
                        totalCount: mockRecords.length,
                        list: [mockRecords[0], {...mockRecords[1], permissions: {delete_record: false}}],
                    },
                },
            };
            vi.spyOn(gqlTypes, 'useExplorerLibraryDataQuery').mockImplementation(
                () => mockExplorerLibraryDataQueryWithPermissionsResult as gqlTypes.ExplorerLibraryDataQueryResult,
            );

            render(
                <ExplorerV2
                    showFilters
                    showSorts
                    currentView={{}}
                    entrypoint={libraryEntrypoint}
                    defaultPrimaryActions={[]}
                />,
            );

            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(getRecordRows()).toHaveLength(mockRecords.length); // 2 records
            const [record1, record2] = mockRecords;
            expect(screen.getByText(record1.whoAmI.label)).toBeInTheDocument();
            expect(screen.getByText(record2.whoAmI.label)).toBeInTheDocument();

            const [firstRecordRow, secondRecordRow] = getRecordRows();
            expect(within(firstRecordRow).getByRole('button', {name: 'explorer.deactivate-item'})).toBeEnabled();
            expect(within(secondRecordRow).getByRole('button', {name: 'explorer.deactivate-item'})).not.toBeEnabled();
        });

        test('Should disable activate action on record without create_record Permission', async () => {
            const mockExplorerLibraryDataQueryWithPermissionsResult: Mockify<
                typeof gqlTypes.useExplorerLibraryDataQuery
            > = {
                loading: false,
                called: true,
                refetch: vi.fn(),
                data: {
                    records: {
                        totalCount: mockRecords.length,
                        list: [
                            {...mockRecords[0], active: false},
                            {
                                ...mockRecords[1],
                                active: false,
                                permissions: {create_record: false},
                            },
                        ],
                    },
                },
            };
            vi.spyOn(gqlTypes, 'useExplorerLibraryDataQuery').mockImplementation(
                () => mockExplorerLibraryDataQueryWithPermissionsResult as gqlTypes.ExplorerLibraryDataQueryResult,
            );

            render(
                <ExplorerV2
                    showFilters
                    showSorts
                    entrypoint={libraryEntrypoint}
                    defaultPrimaryActions={[]}
                    currentView={{}}
                />,
            );

            expect(screen.getAllByRole('table')[0]).toBeVisible();
            expect(getRecordRows()).toHaveLength(mockRecords.length); // 2 records
            const [record1, record2] = mockRecords;
            expect(screen.getByText(record1.whoAmI.label)).toBeInTheDocument();
            expect(screen.getByText(record2.whoAmI.label)).toBeInTheDocument();

            const [firstRecordRow, secondRecordRow] = getRecordRows();
            expect(within(firstRecordRow).getByRole('button', {name: 'explorer.activate-item'})).toBeEnabled();
            expect(within(secondRecordRow).getByRole('button', {name: 'explorer.activate-item'})).not.toBeEnabled();
        });

        test('Should disable delete link action on record without edit_value Permission on Link Attribute', async () => {
            render(<ExplorerV2 entrypoint={linkEntrypoint} />, {
                mocks: [
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                ],
            });

            const [, firstRecordRow] = (await screen.findAllByRole('row')).slice(1); // skip the header row
            expect(within(firstRecordRow).getByRole('button', {name: 'explorer.delete-item'})).not.toBeEnabled();
        });

        test('Should disable replace link action on record without edit_value Permission on Link Attribute', async () => {
            render(<ExplorerV2 entrypoint={linkEntrypoint} />, {
                mocks: [
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                ],
            });

            const [, firstRecordRow] = (await screen.findAllByRole('row')).slice(1); // skip the header row
            expect(within(firstRecordRow).getByRole('button', {name: 'explorer.replace-item'})).not.toBeEnabled();
        });

        // ExplorerV2 is a pure consumer of `currentView` (ADR-006): attribute-level permission
        // filtering is now app-studio's responsibility when it builds the view, so the component
        // renders a column for every attribute it is given — including no-access ones.
        test('renders a column for every attribute in currentView, regardless of attribute permissions', async () => {
            vi.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockImplementation(
                () => mockExplorerAttributesPermissionsQueryResult as gqlTypes.ExplorerAttributesQueryResult,
            );

            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    currentView={{
                        attributesIds: [simpleMockAttribute.id, simpleColorMockAttribute.id, booleanMockAttribute.id],
                    }}
                />,
            );

            const tableRows = getRecordRows();
            expect(screen.getAllByRole('table')[0]).toBeVisible();

            // whoAmI + selection + the 3 requested attribute columns (no-access ones are NOT dropped).
            const [firstRecordRow] = tableRows;
            const cells = within(firstRecordRow).getAllByRole('cell');
            expect(cells.length).toEqual(5);
        });

        test('Should not display filter for attributes the user does not have access to', async () => {
            vi.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockImplementation(
                () => mockExplorerAttributesPermissionsQueryResult as gqlTypes.ExplorerAttributesQueryResult,
            );

            vi.spyOn(attributeDetailsModule, 'useAttributeDetailsData').mockReturnValue({
                // Only attributes the user has access to
                attributeDetailsById: {
                    [simpleMockAttribute.id]: {
                        id: simpleMockAttribute.id,
                        type: simpleMockAttribute.type,
                        format: simpleMockAttribute.format,
                        label: simpleMockAttribute.label.fr,
                    },
                    [simpleColorMockAttribute.id]: {
                        id: simpleColorMockAttribute.id,
                        type: simpleColorMockAttribute.type,
                        format: simpleColorMockAttribute.format,
                        label: simpleColorMockAttribute.label.fr,
                    },
                },
                isLoading: false,
            } as any);

            vi.spyOn(console, 'warn').mockImplementationOnce(() => vi.fn());

            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showFilters
                    showSorts
                    currentView={{
                        attributesIds: [simpleMockAttribute.id, simpleColorMockAttribute.id, booleanMockAttribute.id],
                        filters: [
                            {
                                attributes: [{id: simpleMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                values: ['Christmas'],
                                pinned: true,
                            },
                            // booleanMockAttribute has access_attribute:false in the permissions mock →
                            // the converter drops it (warns) → not shown in the toolbar.
                            {
                                attributes: [{id: booleanMockAttribute.id}],
                                condition: gqlTypes.RecordFilterCondition.EQUAL,
                                values: ['true'],
                                pinned: true,
                            },
                        ],
                    }}
                />,
            );

            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(booleanMockAttribute.id));

            const toolbar = await screen.findByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();
            expect(await within(toolbar).findByText(simpleMockAttribute.label.fr)).toBeVisible();

            expect(within(toolbar).queryByText(booleanMockAttribute.label.fr)).not.toBeInTheDocument();

            expect(spyUseExplorerLibraryDataQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        filters: expect.arrayContaining([
                            expect.objectContaining({
                                field: simpleMockAttribute.id,
                                value: 'Christmas',
                                condition: 'CONTAINS',
                            }),
                        ]),
                    }),
                }),
            );
        });

        // The sort chip (`sort-items`) was removed from ExplorerFiltersAndSorts (LEAVC-588): a sort
        // is surfaced only through the "sorts" view-settings shortcut button, never as a toolbar chip.
        test('never displays a sort chip in the toolbar, even when showSorts is set and currentView.sort is not empty', async () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showSorts
                    currentView={{
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();

            expect(within(toolbar).queryByRole('button', {name: /sort-items/})).not.toBeInTheDocument();
        });

        test('never displays a sort chip in the toolbar when showSorts is not set', async () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showSorts
                    defaultCallbacks={{viewSettings: {onViewSettingsShortcutClick: vi.fn()}}}
                    currentView={{
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();

            expect(within(toolbar).getByRole('button', {name: 'explorer.viewSettings.sorts'})).toBeVisible();
        });

        // Compensates for the removed chip: the "sorts" view-settings shortcut button is forced into
        // the toolbar when a sort is active, even if "sorts" is not part of currentView.shortcuts,
        // provided the host enables view settings management (onViewSettingsShortcutClick).
        test('displays the sorts shortcut button when a sort is active but "sorts" is not a configured shortcut', async () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showSorts
                    defaultCallbacks={{viewSettings: {onViewSettingsShortcutClick: vi.fn()}}}
                    currentView={{
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();

            expect(within(toolbar).getByRole('button', {name: 'explorer.viewSettings.sorts'})).toBeVisible();
        });

        // Pure consumer (ADR-006): ExplorerV2 forwards every sort declared in `currentView` to the
        // data query. Filtering out no-access attributes is handled upstream by app-studio.
        test('forwards every sort from currentView to the data query', async () => {
            vi.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockImplementation(
                () => mockExplorerAttributesPermissionsQueryResult as gqlTypes.ExplorerAttributesQueryResult,
            );

            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    showFilters
                    showSorts
                    currentView={{
                        attributesIds: [simpleMockAttribute.id, simpleColorMockAttribute.id, booleanMockAttribute.id],
                        sort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                            {
                                field: simpleColorMockAttribute.id,
                                order: gqlTypes.SortOrder.desc,
                            },
                        ],
                    }}
                />,
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();

            expect(spyUseExplorerLibraryDataQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        multipleSort: [
                            {
                                field: simpleMockAttribute.id,
                                order: gqlTypes.SortOrder.asc,
                            },
                            {
                                field: simpleColorMockAttribute.id,
                                order: gqlTypes.SortOrder.desc,
                            },
                        ],
                    }),
                }),
            );
        });

        test('Should not display linked items if entrypoint is of type link and the user does not have access to the attribute', async () => {
            const mockExplorerLinkDataQueryEmptyResult: Mockify<typeof gqlTypes.useExplorerLinkDataQuery> = {
                loading: false,
                called: true,
                refetch: vi.fn(),
                data: {
                    records: {
                        list: [
                            {
                                id: '612694174',
                                whoAmI: {
                                    id: '612694174',
                                    library: {
                                        id: 'campaigns',
                                    },
                                },
                                property: [],
                            },
                        ],
                    },
                },
            };

            vi.spyOn(gqlTypes, 'useExplorerLinkDataQuery').mockImplementation(
                () => mockExplorerLinkDataQueryEmptyResult as gqlTypes.ExplorerLinkDataQueryResult,
            );

            render(
                <ExplorerV2
                    entrypoint={linkEntrypoint}
                    primaryActions={customPrimaryActions}
                    defaultPrimaryActions={[]}
                />,
                {
                    mocks: [ExplorerLinkAttributeWithoutPermissionsQueryMock],
                },
            );

            expect(await screen.queryAllByRole('row')).toHaveLength(0);
            await waitFor(() => {
                expect(screen.getByText(/empty-data/)).toBeVisible();
            });
        });

        test('Should not be able to link a new record without permissions on linkAttribute', async () => {
            render(<ExplorerV2 entrypoint={linkEntrypoint} />, {
                mocks: [
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                ],
            });

            const dropdownButton = await screen.findByRole('dropdown-trigger');
            await user.click(dropdownButton);

            const createOneAction = await screen.findByRole('menuitem', {name: 'explorer.create-one'});
            await waitFor(() => expect(createOneAction).toBeVisible());
            expect(createOneAction).toHaveAttribute('aria-disabled', 'true');
            expect(createOneAction).toHaveClass('ant-dropdown-menu-item-disabled');
        });

        test('Should be able to link existing record', async () => {
            render(<ExplorerV2 entrypoint={linkEntrypoint} defaultPrimaryActions={[]} />, {
                mocks: [
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                    ExplorerLinkAttributeWithoutPermissionsQueryMock,
                ],
            });
            const linkExistingButton = await screen.findByRole(
                'button',
                {name: 'explorer.add-existing-item'},
                {timeout: 5000},
            );
            expect(linkExistingButton).toBeVisible();
            expect(linkExistingButton).toBeDisabled();
        });
    });

    describe('Entrypoint with values list', () => {
        const mockValuesList = [mockRecords[0].id, mockRecords[1].id];

        const expectedFiltersWithValuesList = {
            filters: [
                {
                    operator: 'OPEN_BRACKET',
                },
                {
                    condition: 'EQUAL',
                    field: 'id',
                    value: mockRecords[0].id,
                },
                {
                    operator: 'OR',
                },
                {
                    condition: 'EQUAL',
                    field: 'id',
                    value: mockRecords[1].id,
                },
                {
                    operator: 'CLOSE_BRACKET',
                },
            ],
        };

        const expectedFiltersWithValuesListAndFulltextSearch = {
            filters: [],
        };

        test('Should call the library data query with filters for values list', async () => {
            render(<ExplorerV2 entrypoint={{...libraryEntrypoint, valuesList: mockValuesList}} />);

            expect(spyUseExplorerLibraryDataQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining(expectedFiltersWithValuesList),
                }),
            );
        });

        test('Should call the library data query with filters for values list on search when allowFreeEntry is set to false', async () => {
            render(
                <ExplorerV2
                    entrypoint={{
                        ...libraryEntrypoint,
                        valuesList: mockValuesList,
                        allowFreeEntry: false,
                    }}
                    showSearch
                />,
            );

            const searchInput = screen.getByRole('textbox', {name: /search/});
            await userEvent.type(searchInput, 'Hall{Enter}');

            expect(spyUseExplorerLibraryDataQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining(expectedFiltersWithValuesList),
                }),
            );

            const clearButton = screen.getByLabelText('clear');
            await user.click(clearButton);

            expect(spyUseExplorerLibraryDataQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining(expectedFiltersWithValuesList),
                }),
            );
        });

        test('Should call the library data query without filters for values list on search when allowFreeEntry is set to true', async () => {
            render(
                <ExplorerV2
                    entrypoint={{
                        ...libraryEntrypoint,
                        valuesList: mockValuesList,
                        allowFreeEntry: true,
                    }}
                    showSearch
                />,
            );

            const searchInput = screen.getByRole('textbox', {name: /search/});
            await userEvent.type(searchInput, 'Hall{Enter}');

            expect(spyUseExplorerLibraryDataQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining(expectedFiltersWithValuesListAndFulltextSearch),
                }),
            );

            const clearButton = screen.getByLabelText('clear');
            await user.click(clearButton);

            expect(spyUseExplorerLibraryDataQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining(expectedFiltersWithValuesList),
                }),
            );
        });
    });

    describe('currentView prop', () => {
        test('applies attributesIds from currentView', async () => {
            render(
                <ExplorerV2
                    entrypoint={libraryEntrypoint}
                    defaultMassActions={[]}
                    ignoreViewByDefault
                    currentView={{attributesIds: [simpleMockAttribute.id]}}
                />,
            );

            await waitFor(() => {
                expect(screen.getByRole('columnheader', {name: simpleMockAttribute.label.fr})).toBeInTheDocument();
            });
            expect(screen.queryByRole('columnheader', {name: linkMockAttribute.label.fr})).not.toBeInTheDocument();
        });
    });
});
