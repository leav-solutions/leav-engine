// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import {AttributeConditionFilter, IFilterAttribute} from '_types/types';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';
import {mockAttribute} from '__mocks__/common/attribute';
import {mockFilterAttribute} from '__mocks__/common/filter';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import Filter from './Filter';

jest.mock('../../../../hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [mockActiveLibrary, jest.fn()]
}));

describe('Filter', () => {
    test('Should contain filter', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Filter filter={mockFilterAttribute} handleProps={{} as any} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByTestId('filter')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'filter-condition'})).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('If attribute is boolean, just display switch', async () => {
        const mockFilterBoolean: IFilterAttribute = {
            ...mockFilterAttribute,
            attribute: {
                ...mockAttribute,
                format: AttributeFormat.boolean
            },
            condition: AttributeConditionFilter.EQUAL,
            value: {value: true}
        };

        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Filter filter={mockFilterBoolean} handleProps={{} as any} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByTestId('filter')).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: 'filter-condition'})).not.toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    test('If condition is "is empty", hide value input', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Filter
                        filter={{
                            ...mockFilterAttribute,
                            condition: AttributeConditionFilter.IS_EMPTY,
                            value: null
                        }}
                        handleProps={{} as any}
                    />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByTestId('filter')).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
});
