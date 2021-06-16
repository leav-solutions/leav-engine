// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {IRecordPropertyLink} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockFormElementLink} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import LinkField from './LinkField';

jest.mock('hooks/LangHook/LangHook');

jest.mock('components/SearchModal', () => {
    return function SearchModal() {
        return <div>SearchModal</div>;
    };
});

describe('LinkField', () => {
    const value: IRecordPropertyLink = {
        linkValue: {
            id: '123456',
            whoAmI: {
                id: '123456',
                label: 'Record label',
                library: {
                    id: 'linked_lib',
                    label: {en: 'Linked lib'}
                }
            }
        },
        created_at: 123456789,
        modified_at: 123456789,
        id_value: null
    };

    const recordValues = {
        test_attribute: [value]
    };

    test('Display list of values', async () => {
        await act(async () => {
            render(<LinkField element={mockFormElementLink} record={mockRecordWhoAmI} recordValues={recordValues} />);
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(2); // Header is counted here
    });

    test('Display list of values with configured columns', async () => {
        const mockFormElementLinkWithColumns = {
            ...mockFormElementLink,
            settings: {
                ...mockFormElementLink.settings,
                columns: [
                    {
                        id: 'col1',
                        label: 'First column'
                    },
                    {
                        id: 'col2',
                        label: 'Second column'
                    }
                ]
            }
        };

        const recordValuesWithColumns = {
            ...recordValues,
            test_attribute: [
                {
                    ...value,
                    linkValue: {
                        ...value.linkValue,
                        col1: 'col1 value',
                        col2: 'col2 value'
                    }
                }
            ]
        };

        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLinkWithColumns}
                    record={mockRecordWhoAmI}
                    recordValues={recordValuesWithColumns}
                />
            );
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader')).toHaveLength(3);
        expect(screen.getByText('col1 value')).toBeInTheDocument();
        expect(screen.getByText('col2 value')).toBeInTheDocument();
    });

    test('If no value, display a button to add a value', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLink}
                    record={mockRecordWhoAmI}
                    recordValues={{test_attribute: []}}
                />
            );
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('record_edition.add_value')).toBeInTheDocument();
    });

    test('Can edit and delete linked record', async () => {
        await act(async () => {
            render(<LinkField element={mockFormElementLink} record={mockRecordWhoAmI} recordValues={recordValues} />);
        });

        const recordIdentityCell = screen.getByTestId('whoami-cell');
        userEvent.hover(recordIdentityCell, null);

        expect(screen.queryByRole('button', {name: 'delete', hidden: true})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'edit-record', hidden: true})).toBeInTheDocument();
    });
});
