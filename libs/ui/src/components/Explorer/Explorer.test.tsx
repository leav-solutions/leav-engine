// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// ************* NOTE ******************
//
// Prefer using spyOn method for Mocking hooks except for hooks using onCompleted callback.
// In this case, the spyOn is too complex to implement, prefer using the mocks parameter of render method.
//
import {render, screen, within} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {waitFor} from '@testing-library/react';
import {toast} from 'react-hot-toast';
import {Mockify} from '@leav/utils';
import {Fa500Px, FaAccessibleIcon, FaBeer, FaJs, FaXbox} from 'react-icons/fa';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockRecord} from '_ui/__mocks__/common/record';
import {Explorer} from '_ui/index';
import {IEntrypointLibrary, IEntrypointLink, IItemAction, IPrimaryAction} from './_types';
import * as useGetRecordUpdatesSubscription from '_ui/hooks/useGetRecordUpdatesSubscription';
import * as useExecuteSaveValueBatchMutation from '../RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import * as useColumnWidth from './useColumnWidth';
import {SNACKBAR_MASS_ID} from './actions-mass/useMassActions';

const EditRecordModalMock = 'EditRecordModal';

jest.mock('_ui/components/RecordEdition/EditRecordModal', () => ({
    EditRecordModal: ({onCreate}) => (
        <div>
            {EditRecordModalMock}
            <button onClick={() => onCreate({})}>create-record</button>
        </div>
    )
}));

jest.mock('@uidotdev/usehooks', () => ({
    useMeasure: () => [jest.fn(), {height: 100, width: 100}]
}));

const simpleMockAttribute = {
    id: 'simple_attribute',
    label: {
        fr: 'Mon attribut simple',
        en: 'My simple attribute'
    },
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.text,
    multiple_values: false
} satisfies gqlTypes.AttributePropertiesFragment;

const booleanMockAttribute = {
    id: 'boolean_attribute',
    label: {
        fr: 'Mon attribut booléen',
        en: 'My boolean attribute'
    },
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.boolean,
    multiple_values: false
} satisfies gqlTypes.AttributePropertiesFragment;

const linkMockAttribute = {
    ...simpleMockAttribute,
    id: 'link_attribute',
    label: {
        fr: 'Mon attribut liaison',
        en: 'My link attribute'
    },
    type: gqlTypes.AttributeType.advanced_link
} satisfies gqlTypes.AttributePropertiesFragment;

const multivalLinkMockAttribute = {
    ...linkMockAttribute,
    id: 'link_attribute_multival',
    label: {
        fr: 'Mon attribut liaison multival',
        en: 'My link attribute multi-valued'
    },
    multiple_values: true
} satisfies gqlTypes.AttributePropertiesFragment;

const simpleRichTextMockAttribute = {
    id: 'simple_rich_text',
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.rich_text,
    multiple_values: false,
    label: {
        fr: 'Mon simple texte enrichi',
        en: 'My simple rich text'
    }
} satisfies gqlTypes.AttributePropertiesFragment;

const simpleColorMockAttribute = {
    id: 'simple_color',
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.color,
    multiple_values: false,
    label: {
        fr: 'Ma simple couleur',
        en: 'My simple color'
    }
} satisfies gqlTypes.AttributePropertiesFragment;

const multivalColorMockAttribute = {
    ...simpleColorMockAttribute,
    id: 'color_multival',
    multiple_values: true,
    label: {
        fr: 'Mon attribut couleur multiple',
        en: 'My color attribute multi-valued'
    }
} satisfies gqlTypes.AttributePropertiesFragment;

const simpleDateRangeMockAttribute = {
    id: 'simple_date_range',
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.date_range,
    multiple_values: false,
    label: {
        fr: 'Ma simple période',
        en: 'My simple date range'
    }
} satisfies gqlTypes.AttributePropertiesFragment;

const multivalDateRangeMockAttribute = {
    ...simpleDateRangeMockAttribute,
    id: 'multival_date_range',
    type: gqlTypes.AttributeType.advanced,
    multiple_values: true,
    label: {
        fr: 'Ma période multival',
        en: 'My multivalued date range'
    }
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
            whoAmI: {
                id: '613982168',
                label: 'Halloween 2025',
                subLabel: 'Du mercredi 6 novembre 2024 au lundi 9 décembre 2024',
                color: null,
                library: {
                    id: 'campaigns',
                    label: {
                        en: 'Campaigns',
                        fr: 'Campagnes'
                    }
                },
                preview: null
            },
            properties: [
                {
                    attributeId: simpleMockAttribute.id,
                    attributeProperties: simpleMockAttribute,
                    values: [
                        {
                            valuePayload: recordId1
                        }
                    ]
                },
                {
                    attributeId: linkMockAttribute.id,
                    attributeProperties: linkMockAttribute,
                    values: [
                        {
                            linkPayload: {id: mockRecord.id, whoAmI: mockRecord}
                        }
                    ]
                },
                {
                    attributeId: multivalLinkMockAttribute.id,
                    attributeProperties: multivalLinkMockAttribute,
                    values: [
                        {
                            linkPayload: {
                                id: 'multivalRecord1',
                                whoAmI: {...mockRecord, preview: null, label: 'Record A'}
                            }
                        },
                        {
                            linkPayload: {
                                id: 'multivalRecord2',
                                whoAmI: {...mockRecord, preview: null, label: 'Record B'}
                            }
                        },
                        {
                            linkPayload: {
                                id: 'multivalRecord3',
                                whoAmI: {...mockRecord, preview: null, label: 'Record C'}
                            }
                        },
                        {
                            linkPayload: {
                                id: 'multivalRecord4',
                                whoAmI: {...mockRecord, preview: null, label: 'Record D'}
                            }
                        },
                        {
                            linkPayload: {id: 'multivalRecord5', whoAmI: {...mockRecord, label: 'Record E'}}
                        },
                        {
                            linkPayload: {id: 'multivalRecord6', whoAmI: {...mockRecord, label: 'Record F'}}
                        },
                        {
                            linkPayload: {id: 'multivalRecord7', whoAmI: {...mockRecord, label: 'Record G'}}
                        }
                    ]
                },
                {
                    attributeId: simpleRichTextMockAttribute.id,
                    attributeProperties: simpleRichTextMockAttribute,
                    values: [
                        {
                            valuePayload: enrichTextRecord1
                        }
                    ]
                },
                {
                    attributeId: simpleColorMockAttribute.id,
                    attributeProperties: simpleColorMockAttribute,
                    values: [
                        {
                            valuePayload: colorRecord1
                        }
                    ]
                },
                {
                    attributeId: multivalColorMockAttribute.id,
                    attributeProperties: multivalColorMockAttribute,
                    values: [{valuePayload: '#00FF00'}, {valuePayload: '#FF0000'}, {valuePayload: '#0000FF'}]
                },
                {
                    attributeId: booleanMockAttribute.id,
                    attributeProperties: booleanMockAttribute,
                    values: [
                        {
                            valuePayload: true
                        }
                    ]
                },
                {
                    attributeId: simpleDateRangeMockAttribute.id,
                    attributeProperties: simpleDateRangeMockAttribute,
                    values: [
                        {
                            valuePayload: dateRangeRecord1
                        }
                    ]
                },
                {
                    attributeId: multivalDateRangeMockAttribute.id,
                    attributeProperties: multivalDateRangeMockAttribute,
                    values: [
                        {
                            valuePayload: dateRangeRecord1
                        },
                        {
                            valuePayload: dateRangeRecord2
                        }
                    ]
                }
            ]
        },
        {
            id: '612694174',
            whoAmI: {
                id: '612694174',
                label: 'Foire aux vins 2024 - semaine 1',
                subLabel: 'Du mercredi 30 octobre 2024 au lundi 25 novembre 2024',
                color: null,
                library: {
                    id: 'campaigns',
                    label: {
                        en: 'Campaigns',
                        fr: 'Campagnes'
                    }
                },
                preview: null
            },
            properties: [
                {
                    attributeId: simpleMockAttribute.id,
                    attributeProperties: simpleMockAttribute,
                    values: [
                        {
                            valuePayload: recordId2
                        }
                    ]
                },
                {
                    attributeId: linkMockAttribute.id,
                    attributeProperties: linkMockAttribute,
                    values: [
                        {
                            linkPayload: {id: mockRecord.id, whoAmI: mockRecord}
                        }
                    ]
                },
                {
                    attributeId: multivalLinkMockAttribute.id,
                    attributeProperties: multivalLinkMockAttribute,
                    values: []
                },
                {
                    attributeId: simpleRichTextMockAttribute.id,
                    attributeProperties: simpleRichTextMockAttribute,
                    values: [
                        {
                            valuePayload: enrichTextRecord2
                        }
                    ]
                },
                {
                    attributeId: simpleColorMockAttribute.id,
                    attributeProperties: simpleColorMockAttribute,
                    values: [
                        {
                            valuePayload: colorRecord2
                        }
                    ]
                },
                {
                    attributeId: multivalColorMockAttribute.id,
                    attributeProperties: multivalColorMockAttribute,
                    values: []
                },
                {
                    attributeId: booleanMockAttribute.id,
                    attributeProperties: booleanMockAttribute,
                    values: []
                },
                {
                    attributeId: simpleDateRangeMockAttribute.id,
                    attributeProperties: simpleDateRangeMockAttribute,
                    values: []
                },
                {
                    attributeId: multivalDateRangeMockAttribute.id,
                    attributeProperties: multivalDateRangeMockAttribute,
                    values: []
                }
            ]
        }
    ] satisfies gqlTypes.ExplorerLibraryDataQuery['records']['list'];

    const mockEmptyExplorerQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDataQuery> = {
        loading: false,
        called: true,
        data: {
            records: {
                totalCount: 0,
                list: []
            }
        }
    };

    const mockExplorerLibraryDataQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDataQuery> = {
        loading: false,
        called: true,
        refetch: jest.fn(),
        data: {
            records: {
                totalCount: mockRecords.length,
                list: mockRecords
            }
        }
    };

    const mockExplorerLinkDataQueryResultProperty = [
        {
            id_value: '0',
            payload: mockRecords[0]
        },
        {
            id_value: '1',
            payload: mockRecords[1]
        }
    ];

    const mockExplorerLinkDataQueryResult: Mockify<typeof gqlTypes.useExplorerLinkDataQuery> = {
        loading: false,
        called: true,
        refetch: jest.fn(),
        data: {
            records: {
                list: [
                    {
                        id: '612694174',
                        whoAmI: {
                            id: '612694174',
                            library: {
                                id: 'campaigns'
                            }
                        },
                        property: mockExplorerLinkDataQueryResultProperty
                    }
                ]
            }
        }
    };

    const campaignName = 'Campagnes';
    const mockLibraryDetailsQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDetailsQuery> = {
        loading: false,
        called: true,
        data: {
            libraries: {
                list: [
                    {
                        id: 'campaigns',
                        label: {
                            en: 'Campaigns',
                            fr: campaignName
                        }
                    }
                ]
            }
        }
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
                        type: simpleMockAttribute.type,
                        format: simpleMockAttribute.format,
                        multiple_values: true
                    }
                ]
            }
        }
    };

    const customPrimaryActions: IPrimaryAction[] = [
        {
            label: 'Additional action 1',
            icon: <FaBeer />,
            callback: jest.fn()
        },
        {
            label: 'Additional action 2',
            icon: <FaAccessibleIcon />,
            callback: jest.fn()
        }
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
                            type: gqlTypes.ViewTypes.list
                        },
                        created_by: {
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'Admin',
                                library: {
                                    id: 'users'
                                }
                            }
                        },
                        label: {en: 'Second view'},
                        filters: [],
                        sort: []
                    },
                    {
                        id: '42',
                        shared: false,
                        display: {
                            type: gqlTypes.ViewTypes.list
                        },
                        created_by: {
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'Admin',
                                library: {
                                    id: 'users'
                                }
                            }
                        },
                        label: {en: 'My view'},
                        filters: [],
                        sort: []
                    }
                ]
            }
        },
        loading: false,
        called: true
    };

    const attributesList = [
        {...simpleMockAttribute, id: 'simple_attribute', label: {fr: 'Attribut simple'}},
        {...linkMockAttribute, id: 'link_attribute', label: {fr: 'Attribut lien'}}
    ];

    const mockAttributesByLibResult: Mockify<typeof gqlTypes.useGetAttributesByLibQuery> = {
        data: {attributes: {list: attributesList}},
        loading: false,
        called: true
    };

    let spyUseExplorerLibraryDataQuery: jest.SpyInstance;

    const libraryEntrypoint: IEntrypointLibrary = {
        type: 'library',
        libraryId: 'campaigns'
    };

    const linkEntrypoint: IEntrypointLink = {
        type: 'link',
        parentLibraryId: 'campaigns',
        parentRecordId: '42',
        linkAttributeId: 'link_attribute'
    };

    const explorerLinkAttribute = {
        id: 'link_attribute',
        multiple_values: true,
        label: {
            en: 'Delivery Platforms',
            fr: 'Plateformes de diffusion'
        },
        linked_library: {
            id: 'delivery_platforms',
            label: {
                fr: 'Plateformes de diffusion'
            },
            __typename: 'Library'
        },
        __typename: 'LinkAttribute'
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

    const ExplorerLinkAttributeQueryMock: IExplorerLinkAttributeQueryMockType = {
        request: {
            query: gqlTypes.ExplorerLinkAttributeDocument,
            variables: {
                id: linkEntrypoint.linkAttributeId
            }
        },
        result: {
            data: {
                attributes: {
                    list: [explorerLinkAttribute]
                }
            }
        }
    };

    const useGetRecordUpdatesSubscriptionMock = jest.spyOn(
        useGetRecordUpdatesSubscription,
        'useGetRecordUpdatesSubscription'
    );

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        spyUseExplorerLibraryDataQuery = jest
            .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
            .mockImplementation(() => mockExplorerLibraryDataQueryResult as gqlTypes.ExplorerLibraryDataQueryResult);

        jest.spyOn(gqlTypes, 'useExplorerLinkDataQuery').mockImplementation(
            () => mockExplorerLinkDataQueryResult as gqlTypes.ExplorerLinkDataQueryResult
        );

        jest.spyOn(gqlTypes, 'useExplorerLibraryDetailsQuery').mockImplementation(
            () => mockLibraryDetailsQueryResult as gqlTypes.ExplorerLibraryDetailsQueryResult
        );

        jest.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockImplementation(
            () => mockExplorerAttributesQueryResult as gqlTypes.ExplorerAttributesQueryResult
        );

        jest.spyOn(gqlTypes, 'useGetViewsListQuery').mockReturnValue(
            mockViewsResult as gqlTypes.GetViewsListQueryResult
        );

        jest.spyOn(gqlTypes, 'useGetAttributesByLibQuery').mockReturnValue(
            mockAttributesByLibResult as gqlTypes.GetAttributesByLibQueryResult
        );

        // TODO: useless except for remove logs warning `No more mocked`
        useGetRecordUpdatesSubscriptionMock.mockReturnValue({
            loading: false
        });

        jest.clearAllMocks();
        user = userEvent.setup();
    });

    describe('element visibility props', () => {
        test('should not display primary actions', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} defaultPrimaryActions={[]} />
                </Explorer.EditSettingsContextProvider>
            );

            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
        });

        test('should not display filters in the toolbar', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={libraryEntrypoint}
                        defaultViewSettings={{
                            filters: [
                                {
                                    id: '',
                                    attribute: {
                                        format: simpleMockAttribute.format,
                                        label: simpleMockAttribute.label.fr,
                                        type: simpleMockAttribute.type
                                    },
                                    field: simpleMockAttribute.id,
                                    condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                    value: 'Christmas'
                                }
                            ]
                        }}
                    />
                </Explorer.EditSettingsContextProvider>
            );
            expect(screen.queryByText(simpleMockAttribute.label.fr)).not.toBeInTheDocument();
        });

        test('should display filters in the toolbar', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={libraryEntrypoint}
                        showFiltersAndSorts
                        defaultViewSettings={{
                            filters: [
                                {
                                    id: '',
                                    attribute: {
                                        format: simpleMockAttribute.format,
                                        label: simpleMockAttribute.label.fr,
                                        type: simpleMockAttribute.type
                                    },
                                    field: simpleMockAttribute.id,
                                    condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                    value: 'Christmas'
                                }
                            ]
                        }}
                    />
                </Explorer.EditSettingsContextProvider>
            );
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();
        });

        test('should not display the settings button', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} />
                </Explorer.EditSettingsContextProvider>
            );

            expect(screen.queryByRole('button', {name: /settings/})).not.toBeInTheDocument();
        });

        test('should display the settings button', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} enableConfigureView />
                </Explorer.EditSettingsContextProvider>
            );

            expect(screen.getByTitle(/settings/)).toBeInTheDocument();
        });
    });

    describe('props title', () => {
        test('Should display library label as title', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} />
                </Explorer.EditSettingsContextProvider>
            );

            expect(screen.getByText(campaignName)).toBeInTheDocument();
        });

        test('Should display custom title', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} title="Here's my explorer!" />
                </Explorer.EditSettingsContextProvider>
            );

            expect(screen.getByText("Here's my explorer!")).toBeInTheDocument();
        });
    });

    test('Should display the list of records in a table', async () => {
        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer entrypoint={libraryEntrypoint} />
            </Explorer.EditSettingsContextProvider>
        );

        expect(screen.getByRole('table')).toBeVisible();
        expect(screen.getAllByRole('row')).toHaveLength(mockRecords.length); // 2 records
        const [record1, record2] = mockRecords;
        expect(screen.getByText(record1.whoAmI.label)).toBeInTheDocument();
        expect(screen.getByText(record2.whoAmI.label)).toBeInTheDocument();
    });

    test('Should display message on empty data (default)', async () => {
        spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer entrypoint={libraryEntrypoint} />
            </Explorer.EditSettingsContextProvider>
        );

        expect(screen.getByText(/empty-data/)).toBeVisible();
    });

    test('Should display message on empty data (custom)', async () => {
        spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);

        const emptyCustomMessage = 'EmptyCustomMessage';

        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer entrypoint={libraryEntrypoint} emptyPlaceholder={emptyCustomMessage} />
            </Explorer.EditSettingsContextProvider>
        );

        expect(screen.getByText(emptyCustomMessage)).toBeVisible();
    });

    test('Should display the list of records in a table with attributes values', async () => {
        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer
                    entrypoint={libraryEntrypoint}
                    defaultViewSettings={{
                        attributesIds: [
                            simpleMockAttribute.id,
                            linkMockAttribute.id,
                            multivalLinkMockAttribute.id,
                            simpleRichTextMockAttribute.id,
                            simpleColorMockAttribute.id,
                            multivalColorMockAttribute.id,
                            booleanMockAttribute.id,
                            simpleDateRangeMockAttribute.id,
                            multivalDateRangeMockAttribute.id
                        ]
                    }}
                />
            </Explorer.EditSettingsContextProvider>
        );

        const tableRows = screen.getAllByRole('row');
        expect(screen.getByRole('table')).toBeVisible();
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
            multivalDateRangeCell
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
        const mockDeactivateMutation = jest.fn().mockReturnValue({
            data: {
                deactivateRecords: [
                    {
                        id: 42,
                        whoAmI: mockRecord
                    }
                ]
            }
        });

        jest.spyOn(gqlTypes, 'useDeactivateRecordsMutation').mockImplementation(() => [
            mockDeactivateMutation,
            {loading: false, called: false, client: {} as any, reset: jest.fn()}
        ]);

        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer entrypoint={libraryEntrypoint} />
            </Explorer.EditSettingsContextProvider>
        );

        const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.deactivate-item'}));

        expect(screen.getByText('records_deactivation.confirm_one')).toBeVisible();
        await user.click(screen.getByText('global.submit'));

        expect(mockDeactivateMutation).toHaveBeenCalled();
    });

    test('Should be able to delete a linked record with default actions', async () => {
        const mockDeleteValueMutation = jest.fn().mockReturnValue({
            data: {
                deleteValue: [
                    {
                        id_value: 0,
                        linkValue: mockRecords[0]
                    }
                ]
            }
        });

        jest.spyOn(gqlTypes, 'useDeleteValueMutation').mockImplementation(() => [
            mockDeleteValueMutation,
            {loading: false, called: false, client: {} as any, reset: jest.fn()}
        ]);

        jest.spyOn(useColumnWidth, 'useColumnWidth').mockReturnValueOnce({
            ref: {current: null},
            getFieldColumnWidth: () => 500,
            columnWidth: 500,
            actionsColumnHeaderWidth: 464
        });

        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer entrypoint={linkEntrypoint} />
            </Explorer.EditSettingsContextProvider>,
            {
                mocks: [ExplorerLinkAttributeQueryMock]
            }
        );

        const [_columnNameRow, firstRecordRow] = await screen.findAllByRole('row');
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.delete-item'}));

        expect(screen.getByText('record_edition.delete_link_confirm')).toBeVisible();
        await user.click(screen.getByText('global.submit'));

        expect(mockDeleteValueMutation).toHaveBeenCalled();
    });

    test('Should be able to edit a record with default actions', async () => {
        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer entrypoint={libraryEntrypoint} />
            </Explorer.EditSettingsContextProvider>
        );

        const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.edit-item'}));
        expect(screen.getByText(EditRecordModalMock)).toBeVisible();
    });

    test('Should call the useGetRecordUpdatesSubscription', async () => {
        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer entrypoint={libraryEntrypoint} />
            </Explorer.EditSettingsContextProvider>
        );
        expect(useGetRecordUpdatesSubscriptionMock).toHaveBeenCalledTimes(6);
        expect(useGetRecordUpdatesSubscriptionMock.mock.calls[0]).toEqual([
            {
                libraries: [''],
                records: expect.any(Array)
            },
            true
        ]);
        expect(useGetRecordUpdatesSubscriptionMock.mock.calls[3]).toEqual([
            {
                libraries: [libraryEntrypoint.libraryId],
                records: [recordId1, recordId2]
            },
            false
        ]);
    });

    describe('Item actions', () => {
        test('Should display the list of records with custom actions', async () => {
            const customAction: IItemAction = {
                icon: <Fa500Px />,
                label: 'Custom action',
                callback: jest.fn()
            };
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} itemActions={[customAction]} />
                </Explorer.EditSettingsContextProvider>
            );

            const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
            await user.click(within(firstRecordRow).getByRole('button', {name: customAction.label}));

            expect(customAction.callback).toHaveBeenCalled();
        });

        test('Should display the list of records with a lot of custom actions', async () => {
            const customActions: IItemAction[] = [
                {
                    label: 'Test 1',
                    icon: <FaBeer />,
                    callback: jest.fn()
                },
                {
                    label: 'Test 2',
                    icon: <FaAccessibleIcon />,
                    callback: jest.fn()
                },
                {
                    label: 'Test 3',
                    icon: <FaXbox />,
                    callback: jest.fn()
                },
                {
                    label: 'Test 4',
                    icon: <FaJs />,
                    callback: jest.fn()
                }
            ];
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} itemActions={customActions} />
                </Explorer.EditSettingsContextProvider>
            );

            const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
            await user.hover(within(firstRecordRow).getByRole('button', {name: 'explorer.more-actions'}));

            await waitFor(() => {
                expect(screen.getByRole('menuitem', {name: /Test 1/})).toBeVisible();
                expect(screen.getByRole('menuitem', {name: /Test 2/})).toBeVisible();
                expect(screen.getByRole('menuitem', {name: /Test 3/})).toBeVisible();
                expect(screen.getByRole('menuitem', {name: /Test 4/})).toBeVisible();
            });

            await user.click(screen.getByRole('menuitem', {name: customActions[0].label}));

            expect(customActions[0].callback).toHaveBeenCalled();
        });

        test('Should display the list of records with no actions', () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} defaultActionsForItem={[]} />
                </Explorer.EditSettingsContextProvider>
            );

            const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
            expect(within(firstRecordRow).queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('Primary Action', () => {
        test('Should be able to create a new record', async () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} />
                </Explorer.EditSettingsContextProvider>
            );

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();
        });

        test('should not try to link created record if entrypoint is not a link', async () => {
            const saveValues = jest.fn();
            jest.spyOn(useExecuteSaveValueBatchMutation, 'default').mockReturnValue({
                loading: false,
                saveValues
            });

            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} />
                </Explorer.EditSettingsContextProvider>
            );

            const creatButton = await screen.findByRole('button', {name: 'explorer.create-one'});
            await user.click(creatButton);

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();
            const createButtonLibrary = screen.getByRole('button', {name: 'create-record'});
            await user.click(createButtonLibrary);

            expect(saveValues).not.toHaveBeenCalled();
        });

        test('Should be able to link a new record', async () => {
            const saveValues = jest.fn();
            jest.spyOn(useExecuteSaveValueBatchMutation, 'default').mockReturnValue({
                loading: false,
                saveValues
            });

            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={linkEntrypoint} />
                </Explorer.EditSettingsContextProvider>,
                {
                    mocks: [ExplorerLinkAttributeQueryMock, ExplorerLinkAttributeQueryMock]
                }
            );

            const createOneButton = await screen.findByRole('button', {name: 'explorer.create-one'});
            await user.click(createOneButton);

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();

            const createRecordButton = screen.getByRole('button', {name: 'create-record'});
            await user.click(createRecordButton);

            expect(saveValues).toHaveBeenCalled();
        });

        test('Should be able to display custom primary actions', async () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} primaryActions={customPrimaryActions} />
                </Explorer.EditSettingsContextProvider>
            );

            const firstActionButton = screen.queryByRole('button', {name: 'explorer.create-one'});
            const dropdownButton = firstActionButton?.nextElementSibling;
            expect(screen.queryByText(customPrimaryAction1.label)).not.toBeInTheDocument();
            expect(screen.queryByText(customPrimaryAction2.label)).not.toBeInTheDocument();

            await user.click(dropdownButton!);

            expect(screen.getByRole('menuitem', {name: customPrimaryAction1.label})).toBeVisible();
            expect(screen.getByRole('menuitem', {name: customPrimaryAction2.label})).toBeVisible();

            await user.click(screen.getByRole('menuitem', {name: customPrimaryAction1.label}));
            expect(customPrimaryActions[0].callback).toHaveBeenCalled();
        });

        test('Should be able to display custom primary actions without create button', async () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={libraryEntrypoint}
                        primaryActions={customPrimaryActions}
                        defaultPrimaryActions={[]}
                    />
                </Explorer.EditSettingsContextProvider>
            );

            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            const firstActionButton = screen.getByRole('button', {name: customPrimaryAction1.label});
            expect(firstActionButton).toBeVisible();

            await user.click(firstActionButton);
            expect(customPrimaryActions[0].callback).toHaveBeenCalled();

            const dropdownButton = firstActionButton?.nextElementSibling;
            expect(screen.queryByText(customPrimaryAction2.label)).not.toBeInTheDocument();

            await user.click(dropdownButton!);

            expect(screen.getByRole('menuitem', {name: customPrimaryAction2.label})).toBeVisible();

            await user.click(screen.getByRole('menuitem', {name: customPrimaryAction2.label}));
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
                            whoAmI: {
                                id: '613982168',
                                label: 'Christmas 2024',
                                subLabel: 'Du 20 décembre 2024 au 31 décembre 2024',
                                color: null,
                                library: {
                                    id: 'campaigns',
                                    label: {
                                        en: 'Campaigns',
                                        fr: 'Campagnes'
                                    }
                                },
                                preview: null
                            },
                            properties: []
                        }
                    ]
                }
            }
        };
        jest.spyOn(gqlTypes, 'useExplorerLibraryDataQuery').mockImplementation(
            ({variables}) =>
                (variables?.searchQuery
                    ? mockExplorerLibraryDataQueryResultWithSearch
                    : mockExplorerLibraryDataQueryResult) as gqlTypes.ExplorerLibraryDataQueryResult
        );

        render(
            <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                <Explorer
                    entrypoint={libraryEntrypoint}
                    primaryActions={customPrimaryActions}
                    defaultPrimaryActions={[]}
                />
            </Explorer.EditSettingsContextProvider>
        );

        const searchInput = screen.getByRole('textbox', {name: /search/});
        await userEvent.type(searchInput, 'Christ{Enter}');

        expect(screen.getByText('Christmas 2024')).toBeVisible();

        const clearButton = screen.getByLabelText('clear');
        await user.click(clearButton);

        expect(screen.getByText('Halloween 2025')).toBeVisible();
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
                            whoAmI: {
                                id: '613982168',
                                label: 'Christmas 2024',
                                subLabel: 'Du 20 décembre 2024 au 31 décembre 2024',
                                color: null,
                                library: {
                                    id: 'campaigns',
                                    label: {
                                        en: 'Campaigns',
                                        fr: 'Campagnes'
                                    }
                                },
                                preview: null
                            },
                            properties: []
                        }
                    ]
                }
            }
        };

        test('should handle filters for the request and for the display', async () => {
            const spy = jest
                .spyOn(gqlTypes, 'useExplorerLibraryDataQuery')
                .mockImplementation(
                    ({variables}) =>
                        (Array.isArray(variables?.filters) && variables.filters.length
                            ? mockExplorerLibraryDataQueryResultWithFilters
                            : mockExplorerLibraryDataQueryResult) as gqlTypes.ExplorerLibraryDataQueryResult
                );

            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={{type: 'library', libraryId: 'campaigns'}}
                        showFiltersAndSorts
                        enableConfigureView
                        defaultViewSettings={{
                            filters: [
                                {
                                    id: '',
                                    attribute: {
                                        format: simpleMockAttribute.format,
                                        label: simpleMockAttribute.label.fr,
                                        type: simpleMockAttribute.type
                                    },
                                    field: simpleMockAttribute.id,
                                    condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                    value: 'Christmas'
                                }
                            ],
                            sort: [
                                {
                                    field: simpleMockAttribute.id,
                                    order: gqlTypes.SortOrder.asc
                                }
                            ]
                        }}
                    />
                </Explorer.EditSettingsContextProvider>
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();
            expect(within(toolbar).getByRole('button', {name: /sort-items/})).toBeVisible();

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        filters: [
                            {
                                field: simpleMockAttribute.id,
                                condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                value: 'Christmas'
                            }
                        ]
                    })
                })
            );
        });
    });

    describe('Entrypoint type link', () => {
        test('Should display the list of linked records', async () => {
            const actionCallback = jest.fn();
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={linkEntrypoint}
                        primaryActions={customPrimaryActions}
                        defaultPrimaryActions={[]}
                        itemActions={[
                            {
                                label: 'Test 1',
                                icon: <FaBeer />,
                                callback: actionCallback
                            }
                        ]}
                    />
                </Explorer.EditSettingsContextProvider>,
                {
                    mocks: [ExplorerLinkAttributeQueryMock]
                }
            );

            const rows = await screen.findAllByRole('row');
            expect(rows).toHaveLength(2); // 2 linked records
            expect(rows[0]).toHaveTextContent(mockRecords[0].whoAmI.label);
            await user.click(screen.getAllByRole('button', {name: 'Test 1'})[0]);
            expect(actionCallback).toBeCalledWith(
                expect.objectContaining({
                    id_value: mockExplorerLinkDataQueryResultProperty[0].id_value
                })
            );
        });

        test('Should display attribute label as title', async () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={linkEntrypoint}
                        primaryActions={customPrimaryActions}
                        defaultPrimaryActions={[]}
                    />
                </Explorer.EditSettingsContextProvider>,
                {
                    // Query called twice : in run time, the cache is effective, but not in tests, so we use the mock twice
                    mocks: [ExplorerLinkAttributeQueryMock, ExplorerLinkAttributeQueryMock]
                }
            );

            expect(await screen.findByText(explorerLinkAttribute.label.fr)).toBeVisible();
        });
    });

    describe.skip('massActions', () => {
        beforeEach(() => {
            toast.remove(SNACKBAR_MASS_ID); // TODO: check issue https://github.com/timolins/react-hot-toast/issues/101
        });

        it('should inform about selection (manual)', async () => {
            // GIVEN a simple mass action
            const testMassAction = {
                label: 'test mass action',
                icon: <FaBeer />,
                callback: jest.fn()
            };
            // WHEN the component is rendered
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} defaultMassActions={[]} massActions={[testMassAction]} />
                </Explorer.EditSettingsContextProvider>
            );

            // THEN the toolbar should be present
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // GIVEN there is a checkbox on the first record
            const tableRows = screen.getAllByRole('row');
            expect(screen.getByRole('table')).toBeVisible();
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
            const [, secondRecordRow] = screen.getAllByRole('row');
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
            expect(testMassAction.callback).toHaveBeenCalledWith([
                {
                    condition: 'EQUAL',
                    field: 'id',
                    value: '613982168'
                },
                {
                    operator: 'OR'
                },
                {
                    condition: 'EQUAL',
                    field: 'id',
                    value: '612694174'
                }
            ]);

            // AND the selection is cleared (see beforeEach)
        });

        it('should inform about selection all without pagination', async () => {
            // GIVEN a simple mass action
            const testMassAction = {
                label: 'test mass action',
                icon: <FaBeer />,
                callback: jest.fn()
            };
            // WHEN the component is rendered without pagination (20 items default page size > 2 mock records)
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} defaultMassActions={[]} massActions={[testMassAction]} />
                </Explorer.EditSettingsContextProvider>
            );

            // THEN the toolbar should be ready
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
            // AND there is 2 records on screen
            const tableRows = screen.getAllByRole('row');
            expect(screen.getByRole('table')).toBeVisible();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records

            // WHEN the user clicks select all
            await user.click(within(toolbar).getByRole('checkbox'));

            // THEN the checkbox is totally checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();

            // AND the first record is selected
            const [firstRecordRow] = screen.getAllByRole('row');
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();

            // AND the second record is selected too
            const [, secondRecordRow] = screen.getAllByRole('row');
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeChecked();

            // AND the snackbar is updated with the cunt of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2');

            // WHEN the user clicks on the test mass action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: testMassAction.label}));

            // THEN the test callback is call with all ids of the selection
            expect(testMassAction.callback).toHaveBeenCalled();
            expect(testMassAction.callback).toHaveBeenCalledWith([
                {
                    condition: 'EQUAL',
                    field: 'id',
                    value: '613982168'
                },
                {
                    operator: 'OR'
                },
                {
                    condition: 'EQUAL',
                    field: 'id',
                    value: '612694174'
                }
            ]);

            // AND the selection is cleared (see beforeEach)
        });

        it('should inform about selection all with pagination (page only)', async () => {
            // GIVEN a fake response data with only the first record
            const [firstRecord, secondRecord] = mockRecords;
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: mockRecords.length,
                        list: [firstRecord]
                    }
                }
            } as gqlTypes.ExplorerLibraryDataQueryResult);

            // AND a simple mass test action
            const testMassAction = {
                label: 'test mass action',
                icon: <FaBeer />,
                callback: jest.fn()
            };
            // WHEN the component is rendered with some filter and sort and pagination (1 item on 2 pages)
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={libraryEntrypoint}
                        showFiltersAndSorts
                        enableConfigureView
                        defaultMassActions={[]}
                        massActions={[testMassAction]}
                        defaultViewSettings={{
                            pageSize: 1, // configuration to be in multi-pages (2 pages of 1 record)
                            filters: [
                                {
                                    id: '',
                                    attribute: {
                                        format: simpleMockAttribute.format,
                                        label: simpleMockAttribute.label.fr,
                                        type: simpleColorMockAttribute.type
                                    },
                                    field: simpleMockAttribute.id,
                                    condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                    value: 'Christmas'
                                }
                            ],
                            sort: [
                                {
                                    field: simpleMockAttribute.id,
                                    order: gqlTypes.SortOrder.asc
                                }
                            ]
                        }}
                    />
                </Explorer.EditSettingsContextProvider>
            );

            // THEN the toolbar is ready and clean
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // AND there is only the first record in the table
            const tableRows = screen.getAllByRole('row');
            expect(screen.getByRole('table')).toBeVisible();
            expect(tableRows).toHaveLength(1);

            // WHEN the user clicks on selection all page only
            await user.click(within(toolbar).getByLabelText(/massAction.itemsTotal\|2/));
            await user.click(
                within(screen.getByRole('menu')).getByRole('menuitem', {name: /toggle_selection.select_page/})
            );

            // THEN the checkbox in the toolbar should be partially checked because there is 2 items
            expect(within(toolbar).getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');

            // AND the checkbox of the first record is checked
            const [firstRecordRow] = screen.getAllByRole('row');
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();

            // GIVEN the second call to data on second page return the second record
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: mockRecords.length,
                        list: [secondRecord]
                    }
                }
            } as gqlTypes.ExplorerLibraryDataQueryResult);
            // WHEN the user goes on the second page
            const nextPageElement = screen.getByTitle<HTMLLIElement>('Next Page');
            await user.click(within(nextPageElement).getByRole<HTMLButtonElement>('button'));

            // THEN the second record is not selected
            const [secondRecordRow] = screen.getAllByRole('row');
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondSelectRowCell).getByRole('checkbox')).not.toBeChecked();

            // AND the snackbar continues to say 1 selected item (first record)
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|1');

            // WHEN the user clicks on the test mass action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: testMassAction.label}));

            // THEN the callback is called with id of the first record only
            expect(testMassAction.callback).toHaveBeenCalled();
            expect(testMassAction.callback).toHaveBeenCalledWith([
                {
                    condition: 'EQUAL',
                    field: 'id',
                    value: firstRecord.id
                }
            ]);

            // AND the selection is cleared (see beforeEach)
        });

        it('should inform about selection with pagination (all in once)', async () => {
            // GIVEN the first call to data return only the first record
            const [firstRecord, secondRecord] = mockRecords;
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: mockRecords.length,
                        list: [firstRecord]
                    }
                }
            } as gqlTypes.ExplorerLibraryDataQueryResult);

            // AND a simple mass test action is set
            const testMassAction = {
                label: 'test mass action',
                icon: <FaBeer />,
                callback: jest.fn()
            };
            // WHEN the component renders with 2 pages of one record, with filter and sort
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        entrypoint={libraryEntrypoint}
                        enableConfigureView
                        showFiltersAndSorts
                        defaultMassActions={[]}
                        massActions={[testMassAction]}
                        defaultViewSettings={{
                            pageSize: 1, // configuration to be in multi-pages (2 pages of 1 record)
                            filters: [
                                {
                                    id: '',
                                    attribute: {
                                        format: simpleMockAttribute.format,
                                        label: simpleMockAttribute.label.fr,
                                        type: simpleMockAttribute.type
                                    },
                                    field: simpleMockAttribute.id,
                                    condition: gqlTypes.RecordFilterCondition.CONTAINS,
                                    value: 'Christmas'
                                }
                            ],
                            sort: [
                                {
                                    field: simpleMockAttribute.id,
                                    order: gqlTypes.SortOrder.asc
                                }
                            ]
                        }}
                    />
                </Explorer.EditSettingsContextProvider>
            );

            // THEN the select all checkbox is clear
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
            // AND every feature is available
            expect(screen.getByRole('button', {name: /create-one/})).toBeVisible();
            expect(screen.getByRole('textbox', {name: /search/})).toBeVisible();
            expect(screen.getByRole('button', {name: /settings/})).toBeVisible(); // TODO: restore to default view
            expect(
                within(toolbar).getByRole('button', {name: new RegExp(simpleMockAttribute.label.fr)})
            ).not.toHaveClass('kit-filter-disabled');
            expect(within(toolbar).getByRole('button', {name: /sort-items/})).not.toHaveClass('kit-filter-disabled');

            // AND only the first record is displayed
            const tableRows = screen.getAllByRole('row');
            expect(screen.getByRole('table')).toBeVisible();
            expect(tableRows).toHaveLength(1);

            // WHEN the user clicks on the select all checkbox (all pages)
            await user.click(within(toolbar).getByLabelText(/massAction.itemsTotal\|2/));
            await user.click(
                within(screen.getByRole('menu')).getByRole('menuitem', {name: /toggle_selection.select_all/})
            );

            // THEN the select all checkbox is totally checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();
            // AND some features are hidden (creation, search, view setting)
            expect(screen.queryByRole('button', {name: /create-one/})).not.toBeInTheDocument();
            expect(screen.queryByRole('textbox', {name: /search/})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /settings/})).not.toBeInTheDocument();
            // AND the rest of toolbar: sort and filter are disabled only
            expect(within(toolbar).getByRole('button', {name: new RegExp(simpleMockAttribute.label.fr)})).toHaveClass(
                'kit-filter-disabled'
            );
            expect(within(toolbar).getByRole('button', {name: /sort-items/})).toHaveClass('kit-filter-disabled');

            // AND the first record is selected
            const [firstRecordRow] = screen.getAllByRole('row');
            const [firstSelectRowCell, firstWhoAmICell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstWhoAmICell).getByText(firstRecord.whoAmI.label)).toBeVisible();
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();
            // AND the first record is locked (cannot be de-selected manually, cannot be deactivated or edited)
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeDisabled();
            expect(within(firstRecordRow).getByRole('button', {name: /deactivate-item/})).toBeDisabled();
            expect(within(firstRecordRow).getByRole('button', {name: /edit-item/})).toBeDisabled();

            // GIVEN the second call about data is mocked to return the second record
            spyUseExplorerLibraryDataQuery.mockReturnValue({
                ...mockExplorerLibraryDataQueryResult,
                data: {
                    records: {
                        totalCount: mockRecords.length,
                        list: [secondRecord]
                    }
                }
            } as gqlTypes.ExplorerLibraryDataQueryResult);
            // WHEN the user clicks on the next page to get the second record
            const nextPageElement = screen.getByTitle<HTMLLIElement>('Next Page');
            await user.click(within(nextPageElement).getByRole<HTMLButtonElement>('button'));

            // THEN the second record is displayed and selected
            const [secondRecordRow] = screen.getAllByRole('row');
            const [secondSelectRowCell, secondWhoAmICell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondWhoAmICell).getByText(secondRecord.whoAmI.label)).toBeVisible();
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeChecked();
            // AND the second record is locked
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeDisabled();
            expect(within(secondRecordRow).getByRole('button', {name: /deactivate-item/})).toBeDisabled();
            expect(within(secondRecordRow).getByRole('button', {name: /edit-item/})).toBeDisabled();
            // AND the toolbar: sort and filters stay disabled but displayed
            expect(within(toolbar).getByRole('button', {name: new RegExp(simpleMockAttribute.label.fr)})).toHaveClass(
                'kit-filter-disabled'
            );
            expect(within(toolbar).getByRole('button', {name: /sort-items/})).toHaveClass('kit-filter-disabled');

            // AND the snackbar is up to date with the count of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2');

            // WHEN the user clicks on the select all checkbox
            await user.click(within(toolbar).getByLabelText(/massAction.itemsTotal\|2/));
            // THEN there is a possibility to de-select all items
            expect(
                within(screen.getByRole('menu')).getByRole('menuitem', {name: /toggle_selection.deselect_all/})
            ).toBeVisible();

            // WHEN the user clicks on the simple mass test action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: testMassAction.label}));

            // THEN the callback is called with the filters
            expect(testMassAction.callback).toHaveBeenCalled();
            expect(testMassAction.callback).toHaveBeenCalledWith([
                {
                    field: 'simple_attribute',
                    condition: 'CONTAINS',
                    value: 'Christmas'
                }
            ]);

            // AND the selection is cleared (see beforeEach)
        });

        it('should deactivate massively for simple library (manual selection with only one page)', async () => {
            // GIVEN a mocked deactivate record mutation
            const mockOnUseDeactivateRecordsMutation = jest.fn();
            jest.spyOn(gqlTypes, 'useDeactivateRecordsMutation').mockImplementation(
                () => [mockOnUseDeactivateRecordsMutation, {}] as any
            );

            // WHEN the component is rendered
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer entrypoint={libraryEntrypoint} />
                </Explorer.EditSettingsContextProvider>
            );

            // WHEN the toolbar is cleared
            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(within(toolbar).getByRole('checkbox')).not.toHaveAttribute('checked');
            // AND the snackbar is hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // AND the records are displayed
            const tableRows = screen.getAllByRole('row');
            expect(screen.getByRole('table')).toBeVisible();
            expect(tableRows).toHaveLength(mockRecords.length); // 2 records

            // WHEN ths user clicks on the select all checkbox (no pagination)
            await user.click(within(toolbar).getByRole('checkbox'));

            // THEN the toolbar select all checkbox is checked
            expect(within(toolbar).getByRole('checkbox')).toBeChecked();

            // AND the first record is selected
            const [firstRecordRow] = screen.getAllByRole('row');
            const [firstSelectRowCell] = within(firstRecordRow).getAllByRole('cell');
            expect(within(firstSelectRowCell).getByRole('checkbox')).toBeChecked();
            // AND the second record is selected too
            const [, secondRecordRow] = screen.getAllByRole('row');
            const [secondSelectRowCell] = within(secondRecordRow).getAllByRole('cell');
            expect(within(secondSelectRowCell).getByRole('checkbox')).toBeChecked();

            // AND the snackbar is up to date with the count of selected items
            expect(screen.getByRole('status').textContent).toContain('massAction.selectedItems|2');

            // WHEN the user clicks on the mass deactivate action
            await user.click(within(screen.getByRole('status')).getByRole('button', {name: /massAction.deactivate/}));

            // THEN a confirmation modal is displayed
            expect(screen.getByText(/records_deactivation.confirm/)).toBeVisible();
            // WHEN the user confirms the deactivation
            await user.click(screen.getByText(/submit/));

            // THEN the mock mutation is called with the ids of selected items
            expect(mockOnUseDeactivateRecordsMutation).toHaveBeenCalledTimes(1);
            const [firstRecord, secondRecord] = mockRecords;
            expect(mockOnUseDeactivateRecordsMutation).toHaveBeenCalledWith({
                variables: {
                    libraryId: 'campaigns',
                    filters: [
                        {field: 'id', condition: 'EQUAL', value: firstRecord.id},
                        {operator: 'OR'},
                        {field: 'id', condition: 'EQUAL', value: secondRecord.id}
                    ]
                }
            });

            // AND the selection is cleared (see beforeEach)
        });
    });

    describe('Saved views', () => {
        test('should load a view', async () => {
            render(
                <Explorer.EditSettingsContextProvider panelElement={() => document.body}>
                    <Explorer
                        enableConfigureView
                        showFiltersAndSorts
                        entrypoint={libraryEntrypoint}
                        defaultPrimaryActions={[]}
                    />
                </Explorer.EditSettingsContextProvider>
            );

            const manageViewsButton = screen.getByRole('button', {name: /My view/});
            expect(manageViewsButton).toBeVisible();
            expect(manageViewsButton).toHaveTextContent('My view');

            await user.click(manageViewsButton);
            const viewItem = screen.getByRole('listitem', {name: /Second view/});
            expect(viewItem).toBeVisible();
            await user.click(viewItem);

            waitFor(() => expect(manageViewsButton).toHaveTextContent('Second view'));
        });
    });
});
