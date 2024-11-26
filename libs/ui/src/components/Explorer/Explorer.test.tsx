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
import {IItemAction, IPrimaryAction} from './_types';

const EditRecordModalMock = 'EditRecordModal';

jest.mock('_ui/components/RecordEdition/EditRecordModal', () => ({
    EditRecordModal: () => <div>{EditRecordModalMock}</div>
}));

const simpleMockAttribute: gqlTypes.AttributePropertiesFragment = {
    id: 'simple_attribute',
    label: {
        fr: 'Mon attribut simple',
        en: 'My simple attribute'
    },
    type: gqlTypes.AttributeType.simple,
    format: gqlTypes.AttributeFormat.text,
    multiple_values: false
};

const linkMockAttribute: gqlTypes.AttributePropertiesFragment = {
    ...simpleMockAttribute,
    id: 'link_attribute',
    label: {
        fr: 'Mon attribut liaison',
        en: 'My link attribute'
    },
    type: gqlTypes.AttributeType.advanced_link
};

describe('Explorer', () => {
    const recordId1 = '613982168';
    const recordId2 = '612694174';
    const mockRecords: gqlTypes.ExplorerQuery['records']['list'] = [
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
                }
            ]
        }
    ] satisfies gqlTypes.ExplorerQuery['records']['list'];

    const mockExplorerQueryResult: Mockify<typeof gqlTypes.useExplorerQuery> = {
        loading: false,
        called: true,
        data: {
            records: {
                list: mockRecords
            }
        }
    };

    const campaignName = 'Campagnes';
    const mockLibraryDataQueryResult: Mockify<typeof gqlTypes.useExplorerLibraryDataQuery> = {
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

    beforeAll(() => {
        jest.spyOn(gqlTypes, 'useExplorerQuery').mockImplementation(
            () => mockExplorerQueryResult as gqlTypes.ExplorerQueryResult
        );

        jest.spyOn(gqlTypes, 'useExplorerLibraryDataQuery').mockImplementation(
            () => mockLibraryDataQueryResult as gqlTypes.ExplorerLibraryDataQueryResult
        );
    });

    let user: ReturnType<typeof userEvent.setup>;
    beforeEach(() => {
        jest.clearAllMocks();
        user = userEvent.setup();
    });

    describe('props title', () => {
        test('Should display library label as title', () => {
            render(<Explorer library="campaigns" />);

            expect(screen.getByText(campaignName)).toBeInTheDocument();
        });

        test('Should display custom title', () => {
            render(<Explorer library="campaigns" title="Here's my explorer!" />);

            expect(screen.getByText("Here's my explorer!")).toBeInTheDocument();
        });
    });

    test('Should display the list of records in a table', async () => {
        render(<Explorer library="campaigns" />);

        expect(screen.getByRole('table')).toBeVisible();
        expect(screen.getAllByRole('row')).toHaveLength(1 + mockRecords.length); // 1 header row + 2 records
        const [record1, record2] = mockRecords;
        expect(screen.getByText(String(record1.whoAmI.label))).toBeInTheDocument();
        expect(screen.getByText(String(record2.whoAmI.label))).toBeInTheDocument();
    });

    test('Should display the list of records in a table with attributes values', async () => {
        render(
            <Explorer
                library="campaigns"
                defaultViewSettings={{fields: [simpleMockAttribute.id, linkMockAttribute.id]}}
            />
        );

        const tableRows = screen.getAllByRole('row');
        expect(screen.getByRole('table')).toBeVisible();
        expect(tableRows).toHaveLength(1 + mockRecords.length); // 1 header row + 2 records
        const [_headerRow, firstRecordRow] = tableRows;
        const [record1] = mockRecords;

        expect(within(firstRecordRow).getByText(String(record1.whoAmI.label))).toBeInTheDocument();
        expect(within(firstRecordRow).getByText(recordId1)).toBeVisible();
        expect(within(firstRecordRow).getByText(mockRecord.label)).toBeVisible();
        expect(within(firstRecordRow).getByText(mockRecord.subLabel)).toBeVisible();
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

        render(<Explorer library="campaigns" />);

        const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.deactivate-item'}));

        expect(screen.getByText('records_deactivation.confirm_one')).toBeVisible();
        await user.click(screen.getByText('global.submit'));

        expect(mockDeactivateMutation).toHaveBeenCalled();
    });

    test('Should be able to edit a record with default actions', async () => {
        render(<Explorer library="campaigns" />);

        const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
        await user.click(within(firstRecordRow).getByRole('button', {name: 'explorer.edit-item'}));
        expect(screen.getByText(EditRecordModalMock)).toBeVisible();
    });

    test('Should display the list of records with custom actions', async () => {
        const customAction: IItemAction = {
            icon: <Fa500Px />,
            label: 'Custom action',
            callback: jest.fn()
        };
        render(<Explorer library="campaigns" itemActions={[customAction]} />);

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
        render(<Explorer library="campaigns" itemActions={customActions} />);

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
        render(<Explorer library="campaigns" defaultActionsForItem={[]} />);

        const [_columnNameRow, firstRecordRow] = screen.getAllByRole('row');
        expect(within(firstRecordRow).queryByRole('button')).not.toBeInTheDocument();
    });

    test('Should be able to create a new record', async () => {
        render(<Explorer library="campaigns" />);

        await user.click(screen.getByRole('button', {name: 'explorer.create-one'}));

        expect(screen.getByText(EditRecordModalMock)).toBeVisible();
    });

    test('Should be able to display custom primary actions', async () => {
        render(<Explorer library="campaigns" primaryActions={customPrimaryActions} />);

        const createButton = screen.getByRole('button', {name: 'explorer.create-one'});
        const dropdownButton = createButton.nextElementSibling; // Not nice, but no way to get the dropdown button directly

        expect(screen.queryByText(customPrimaryAction1.label)).not.toBeInTheDocument();
        expect(screen.queryByText(customPrimaryAction2.label)).not.toBeInTheDocument();

        await user.click(dropdownButton!);

        expect(screen.getByRole('menuitem', {name: customPrimaryAction1.label})).toBeVisible();
        expect(screen.getByRole('menuitem', {name: customPrimaryAction2.label})).toBeVisible();

        await user.click(screen.getByRole('menuitem', {name: customPrimaryAction1.label}));
        expect(customPrimaryActions[0].callback).toHaveBeenCalled();
    });

    test('Should be able to display custom primary actions without create button', async () => {
        render(<Explorer library="campaigns" primaryActions={customPrimaryActions} defaultPrimaryActions={[]} />);

        expect(screen.queryByRole('button', {name: 'explorer.create-one'})).not.toBeInTheDocument();
        const firstActionButton = screen.getByRole('button', {name: customPrimaryAction1.label});
        expect(firstActionButton).toBeVisible();

        await user.click(firstActionButton);
        expect(customPrimaryActions[0].callback).toHaveBeenCalled();

        const dropdownButton = firstActionButton.nextElementSibling; // Not nice, but no way to get the dropdown button directly
        expect(screen.queryByText(customPrimaryAction2.label)).not.toBeInTheDocument();

        await user.click(dropdownButton!);

        expect(screen.getByRole('menuitem', {name: customPrimaryAction2.label})).toBeVisible();

        await user.click(screen.getByRole('menuitem', {name: customPrimaryAction2.label}));
        expect(customPrimaryActions[1].callback).toHaveBeenCalled();
    });
});
