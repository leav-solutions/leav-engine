// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, within} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {waitFor} from '@testing-library/react';
import {Mockify} from '@leav/utils';
import {Fa500Px, FaAccessibleIcon, FaBeer, FaJs, FaXbox} from 'react-icons/fa';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockRecord} from '_ui/__mocks__/common/record';
import {Explorer} from '_ui/index';
import {IEntrypointLibrary, IEntrypointLink, IItemAction, IPrimaryAction} from './_types';
import * as useExecuteSaveValueBatchMutation from '../RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import * as useExplorerData from './_queries/useExplorerData';

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

const multivalBooleanMockAttribute = {
    id: 'boolean_attribute',
    label: {
        fr: 'Mon attribut booléen',
        en: 'My boolean attribute'
    },
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.boolean,
    multiple_values: true
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
    const colorRecord1 = '35c441';
    const recordId2 = '612694174';
    const enrichTextRecord2 = '<h1>This is a test enrich text</h1>';
    const colorRecord2 = '5510d1';
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
                    values: [{valuePayload: '00FF00'}, {valuePayload: 'FF0000'}, {valuePayload: '0000FF'}]
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
                    attributeId: multivalBooleanMockAttribute.id,
                    attributeProperties: multivalBooleanMockAttribute,
                    values: [
                        {
                            valuePayload: true
                        },
                        {
                            valuePayload: false
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
                    attributeId: multivalBooleanMockAttribute.id,
                    attributeProperties: multivalBooleanMockAttribute,
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
                        format: simpleMockAttribute.format
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
                        id: '42',
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
            __typename: 'Library'
        },
        __typename: 'LinkAttribute'
    };

    const ExplorerLinkAttributeQueryMock = {
        request: {
            query: gqlTypes.ExplorerLinkAttributeDocument,
            variables: {
                id: linkEntrypoint.linkAttributeId
            }
        },
        result: {
            data: {
                attributes: {
                    list: [explorerLinkAttribute],
                    __typename: 'AttributesList'
                }
            }
        }
    };

    const ExplorerLinkAttributeMonoValueQueryMock = {
        request: {
            query: gqlTypes.ExplorerLinkAttributeDocument,
            variables: {
                id: linkEntrypoint.linkAttributeId
            }
        },
        result: {
            data: {
                attributes: {
                    list: [explorerLinkAttribute],
                    __typename: 'AttributesList'
                }
            }
        }
    };

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
    });

    let user: ReturnType<typeof userEvent.setup>;
    beforeEach(() => {
        jest.clearAllMocks();
        user = userEvent.setup();
    });

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    describe('props title', () => {
        test('Should display library label as title', () => {
            render(<Explorer entrypoint={libraryEntrypoint} />);

            expect(screen.getByText(campaignName)).toBeInTheDocument();
        });

        test('Should display custom title', () => {
            render(<Explorer entrypoint={libraryEntrypoint} title="Here's my explorer!" />);

            expect(screen.getByText("Here's my explorer!")).toBeInTheDocument();
        });
    });

    test('Should display the list of records in a table', async () => {
        render(<Explorer entrypoint={libraryEntrypoint} />);

        expect(screen.getByRole('table')).toBeVisible();
        expect(screen.getAllByRole('row')).toHaveLength(mockRecords.length); // 2 records
        const [record1, record2] = mockRecords;
        expect(screen.getByText(record1.whoAmI.label)).toBeInTheDocument();
        expect(screen.getByText(record2.whoAmI.label)).toBeInTheDocument();
    });

    test('Should display message on empty data', async () => {
        spyUseExplorerLibraryDataQuery.mockReturnValue(mockEmptyExplorerQueryResult);
        render(<Explorer entrypoint={libraryEntrypoint} />);

        expect(screen.getByText(/empty-data/)).toBeVisible();
    });

    test('Should display the list of records in a table with attributes values', async () => {
        render(
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
                        multivalBooleanMockAttribute.id,
                        simpleDateRangeMockAttribute.id,
                        multivalDateRangeMockAttribute.id
                    ]
                }}
            />
        );

        const tableRows = screen.getAllByRole('row');
        expect(screen.getByRole('table')).toBeVisible();
        expect(tableRows).toHaveLength(mockRecords.length); // 2 records
        const [firstRecordRow] = tableRows;
        const [record1] = mockRecords;
        const [
            whoAmICell,
            simpleAttributeCell,
            linkCell,
            multivalLinkCell,
            simpleRichTextCell,
            simpleColorCell,
            multivalColorCell,
            boolCell,
            multivalBoolCell,
            simpleDateRangeCell,
            multivalDateRangeCell
        ] = within(firstRecordRow).getAllByRole('cell');

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

        expect(simpleColorCell).toHaveTextContent(`#${colorRecord1}`);

        expect(within(multivalColorCell).getByText('#00FF00')).toBeVisible();
        expect(within(multivalColorCell).getByText('#FF0000')).toBeVisible();
        expect(within(multivalColorCell).getByText('#0000FF')).toBeVisible();

        expect(within(boolCell).getByText(/yes/)).toBeVisible();

        expect(within(multivalBoolCell).getByText(/yes/)).toBeVisible();
        expect(within(multivalBoolCell).getByText(/no/)).toBeVisible();

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

        render(<Explorer entrypoint={libraryEntrypoint} />);

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

        render(<Explorer entrypoint={linkEntrypoint} />, {
            mocks: [ExplorerLinkAttributeQueryMock]
        });

        const [_columnNameRow, firstRecordRow] = await screen.findAllByRole('row');
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.delete-item'}));

        expect(screen.getByText('record_edition.delete_link_confirm')).toBeVisible();
        await user.click(screen.getByText('global.submit'));

        expect(mockDeleteValueMutation).toHaveBeenCalled();
    });

    test('Should be able to edit a record with default actions', async () => {
        render(<Explorer entrypoint={libraryEntrypoint} />);

        const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.edit-item'}));
        expect(screen.getByText(EditRecordModalMock)).toBeVisible();
    });

    describe('Item actions', () => {
        test('Should display the list of records with custom actions', async () => {
            const customAction: IItemAction = {
                icon: <Fa500Px />,
                label: 'Custom action',
                callback: jest.fn()
            };
            render(<Explorer entrypoint={libraryEntrypoint} itemActions={[customAction]} />);

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
            render(<Explorer entrypoint={libraryEntrypoint} itemActions={customActions} />);

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
            render(<Explorer entrypoint={libraryEntrypoint} defaultActionsForItem={[]} />);

            const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
            expect(within(firstRecordRow).queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('Primary Action', () => {
        test('Should be able to create a new record', async () => {
            render(<Explorer entrypoint={libraryEntrypoint} />);

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();
        });

        test('should not try to link created record if entrypoint is not a link', async () => {
            const saveValues = jest.fn();
            jest.spyOn(useExecuteSaveValueBatchMutation, 'default').mockReturnValue({
                loading: false,
                saveValues
            });

            jest.spyOn(useExplorerData, 'useExplorerData').mockReturnValue({
                refetch: jest.fn(),
                loading: false,
                data: null
            });

            render(<Explorer entrypoint={libraryEntrypoint} />);

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

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

            const spiedModule = jest.spyOn(useExplorerData, 'useExplorerData').mockReturnValue({
                refetch: jest.fn(),
                loading: false,
                data: null
            });

            render(<Explorer entrypoint={linkEntrypoint} />, {
                mocks: [ExplorerLinkAttributeQueryMock]
            });

            await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

            expect(screen.getByText(EditRecordModalMock)).toBeVisible();

            const createButton = screen.getByRole('button', {name: 'create-record'});
            await user.click(createButton);

            expect(saveValues).toHaveBeenCalled();
        });

        test('Should be able to display custom primary actions', async () => {
            render(<Explorer entrypoint={libraryEntrypoint} primaryActions={customPrimaryActions} />);

            const dropdownButton = screen.getByTestId('actions-dropdown');
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
                <Explorer
                    entrypoint={libraryEntrypoint}
                    primaryActions={customPrimaryActions}
                    defaultPrimaryActions={[]}
                />
            );

            expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
            const firstActionButton = screen.getByRole('button', {name: customPrimaryAction1.label});
            expect(firstActionButton).toBeVisible();

            await user.click(firstActionButton);
            expect(customPrimaryActions[0].callback).toHaveBeenCalled();

            const dropdownButton = screen.getByTestId('actions-dropdown');
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
            <Explorer entrypoint={libraryEntrypoint} primaryActions={customPrimaryActions} defaultPrimaryActions={[]} />
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
                <Explorer
                    entrypoint={{type: 'library', libraryId: 'campaigns'}}
                    defaultViewSettings={{
                        filters: [
                            {
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
            );

            const toolbar = screen.getByRole('list', {name: /toolbar/});
            expect(toolbar).toBeVisible();
            expect(within(toolbar).getByText(simpleMockAttribute.label.fr)).toBeVisible();
            expect(within(toolbar).getByRole('button', {name: /reset-view/})).toBeVisible();
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
                />,
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
                <Explorer
                    entrypoint={linkEntrypoint}
                    primaryActions={customPrimaryActions}
                    defaultPrimaryActions={[]}
                />,
                {
                    mocks: [ExplorerLinkAttributeQueryMock]
                }
            );

            expect(await screen.findByText(explorerLinkAttribute.label.fr)).toBeInTheDocument();
        });
    });
});
