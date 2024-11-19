// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, within} from '_ui/_tests/testUtils';
import {Explorer} from '_ui/index';
import * as gqlTypes from '_ui/_gqlTypes';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import {Fa500Px, FaAccessibleIcon, FaBeer, FaJs, FaXbox} from 'react-icons/fa';
import {mockRecord} from '_ui/__mocks__/common/record';
import {IItemAction, IPrimaryAction} from './_types';

jest.mock('_ui/components/RecordEdition/EditRecordModal', () => ({
    EditRecordModal: () => <div>EditRecordModal</div>
}));

describe('Explorer', () => {
    const mockExplorerQueryResult: Mockify<typeof gqlTypes.useExplorerQuery> = {
        loading: false,
        called: true,
        data: {
            records: {
                list: [
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
                                attributeId: 'id',
                                values: [
                                    {
                                        attribute: {
                                            type: 'simple'
                                        },
                                        valuePayload: '613982168'
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
                                attributeId: 'id',
                                values: [
                                    {
                                        attribute: {
                                            type: 'simple'
                                        },
                                        valuePayload: '612694174'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    };

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
                            fr: 'Campagnes'
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

    beforeAll(() => {
        jest.spyOn(gqlTypes, 'useExplorerQuery').mockImplementation(
            () => mockExplorerQueryResult as gqlTypes.ExplorerQueryResult
        );

        jest.spyOn(gqlTypes, 'useExplorerLibraryDataQuery').mockImplementation(
            () => mockLibraryDataQueryResult as gqlTypes.ExplorerLibraryDataQueryResult
        );
    });

    let user;
    beforeEach(() => {
        user = userEvent.setup();
    });

    test('Should display library label as title', () => {
        render(<Explorer library="campaigns" />);

        expect(screen.getByText('Campagnes')).toBeInTheDocument();
    });

    test('Should display custom title', () => {
        render(<Explorer library="campaigns" title="Here's my explorer!" />);

        expect(screen.getByText("Here's my explorer!")).toBeInTheDocument();
    });

    test('Should display the list of records in a table', async () => {
        render(<Explorer library="campaigns" />);

        expect(screen.getByRole('table')).toBeVisible();
        expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header row + 2 records
        expect(screen.getByText('Halloween 2025')).toBeInTheDocument();
        expect(screen.getByText('Foire aux vins 2024 - semaine 1')).toBeInTheDocument();
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

        const firstRecordRow = screen.getAllByRole('row')[1];
        await user.click(within(firstRecordRow).getByRole('button', {name: /deactivate/}));

        expect(await screen.findByText('records_deactivation.confirm_one')).toBeVisible();
        await user.click(screen.getByText(/submit/));

        expect(mockDeactivateMutation).toHaveBeenCalled();
    });

    test('Should be able to edit a record with default actions', async () => {
        render(<Explorer library="campaigns" />);

        const firstRecordRow = screen.getAllByRole('row')[1];
        user.click(within(firstRecordRow).getByRole('button', {name: /edit-item/}));
        expect(await screen.findByText('EditRecordModal')).toBeVisible();
    });

    test('Should display the list of records with custom actions', async () => {
        const customActionCb = jest.fn();
        const customActions: IItemAction[] = [
            {
                icon: <Fa500Px />,
                label: 'Custom action',
                callback: customActionCb
            }
        ];
        render(<Explorer library="campaigns" itemActions={customActions} />);

        const firstRecordRow = screen.getAllByRole('row')[1];

        await user.click(within(firstRecordRow).queryByRole('button', {name: /Custom action/}));

        expect(customActionCb).toHaveBeenCalled();
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

        const firstRecordRow = screen.getAllByRole('row')[1];
        await user.hover(within(firstRecordRow).getByRole('button', {name: /more-actions/}));

        expect(await screen.findByRole('menuitem', {name: /Test 1/})).toBeVisible();
        expect(await screen.findByRole('menuitem', {name: /Test 2/})).toBeVisible();
        expect(await screen.findByRole('menuitem', {name: /Test 3/})).toBeVisible();
        expect(await screen.findByRole('menuitem', {name: /Test 4/})).toBeVisible();

        await user.click(screen.getByRole('menuitem', {name: /Test 1/}));

        expect(customActions[0].callback).toHaveBeenCalled();
    });

    test('Should display the list of records with no actions', () => {
        render(<Explorer library="campaigns" defaultActionsForItem={[]} />);

        const firstRecordRow = screen.getAllByRole('row')[1];
        expect(within(firstRecordRow).queryByRole('button')).not.toBeInTheDocument();
    });

    test('Should be able to create a new record', async () => {
        render(<Explorer library="campaigns" />);

        user.click(screen.getByRole('button', {name: /create/}));

        expect(await screen.findByText('EditRecordModal')).toBeVisible();
    });

    test('Should be able to display custom primary actions', async () => {
        render(<Explorer library="campaigns" primaryActions={customPrimaryActions} />);

        const createButton = screen.getByRole('button', {name: /create/});
        const dropdownButton = createButton.nextElementSibling; // Not nice, but no way to get the dropdown button directly

        expect(screen.queryByText(/Additional action 1/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Additional action 2/)).not.toBeInTheDocument();

        await user.click(dropdownButton);

        expect(await screen.findByRole('menuitem', {name: /Additional action 1/})).toBeVisible();
        expect(await screen.findByRole('menuitem', {name: /Additional action 2/})).toBeVisible();

        await user.click(screen.getByRole('menuitem', {name: /Additional action 1/}));
        expect(customPrimaryActions[0].callback).toHaveBeenCalled();
    });

    test('Should be able to display custom primary actions without create button', async () => {
        render(<Explorer library="campaigns" primaryActions={customPrimaryActions} defaultPrimaryActions={[]} />);

        expect(screen.queryByRole('button', {name: /create/})).not.toBeInTheDocument();
        const firstActionButton = screen.getByRole('button', {name: /Additional action 1/});
        expect(firstActionButton).toBeVisible();

        await user.click(firstActionButton);
        expect(customPrimaryActions[0].callback).toHaveBeenCalled();

        const dropdownButton = firstActionButton.nextElementSibling; // Not nice, but no way to get the dropdown button directly
        expect(screen.queryByText(/Additional action 2/)).not.toBeInTheDocument();

        await user.click(dropdownButton);

        expect(await screen.findByRole('menuitem', {name: /Additional action 2/})).toBeVisible();

        await user.click(screen.getByRole('menuitem', {name: /Additional action 2/}));
        expect(customPrimaryActions[1].callback).toHaveBeenCalled();
    });
});
