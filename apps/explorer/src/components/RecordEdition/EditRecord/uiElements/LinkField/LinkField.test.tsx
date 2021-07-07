// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {IRecordPropertyLink} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockFormElementLink} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {mockModifier} from '__mocks__/common/value';
import {FormElement} from '../../_types';
import LinkField from './LinkField';

jest.mock('hooks/LangHook/LangHook');

jest.mock('components/SearchModal', () => {
    return function SearchModal() {
        return <div>SearchModal</div>;
    };
});

jest.mock('../../shared/ValueDetails', () => {
    return function ValueDetails() {
        return <div>ValueDetails</div>;
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
        created_by: mockModifier,
        modified_by: mockModifier,
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

        expect(screen.getAllByRole('table').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole('button', {name: /add/, hidden: true})).toBeInTheDocument();
    });

    test('If no value and cannot add, display a message', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={{...mockFormElementLink, attribute: {...mockFormElementLink.attribute, system: true}}}
                    record={mockRecordWhoAmI}
                    recordValues={{test_attribute: []}}
                />
            );
        });

        expect(screen.getByText('record_edition.no_value')).toBeInTheDocument();
    });

    test('Can edit and delete linked record', async () => {
        await act(async () => {
            render(<LinkField element={mockFormElementLink} record={mockRecordWhoAmI} recordValues={recordValues} />);
        });

        const recordIdentityCell = screen.getByTestId('whoami-cell');
        userEvent.hover(recordIdentityCell, null);

        expect(screen.queryByRole('button', {name: /delete/, hidden: true})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'edit-record', hidden: true})).toBeInTheDocument();
    });

    test('If multiple values, display add value button', async () => {
        const mockFormElementLinkMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: true
            }
        };
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLinkMultivalue}
                    record={mockRecordWhoAmI}
                    recordValues={recordValues}
                />
            );
        });

        expect(screen.getByRole('button', {name: /add/, hidden: true})).toBeInTheDocument();
    });

    test("If not multiple values, don't display add value button", async () => {
        const mockFormElementLinkNoMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: false
            }
        };

        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLinkNoMultivalue}
                    record={mockRecordWhoAmI}
                    recordValues={recordValues}
                />
            );
        });

        expect(screen.queryByRole('button', {name: /add/, hidden: true})).not.toBeInTheDocument();
    });

    test('Can display value details', async () => {
        await act(async () => {
            render(<LinkField element={mockFormElementLink} record={mockRecordWhoAmI} recordValues={recordValues} />);
        });

        const valueDetailsButton = screen.getByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButton).toBeInTheDocument();

        userEvent.click(valueDetailsButton);

        expect(screen.getByText('ValueDetails')).toBeInTheDocument();
    });
});
