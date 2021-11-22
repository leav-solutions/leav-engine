// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockFilter} from '__mocks__/common/filter';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import Filter from './Filter';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';

jest.mock('../../../../hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [mockActiveLibrary, jest.fn()]
}));

describe('Filter', () => {
    test('should contain filter', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Filter filter={mockFilter} handleProps={{} as any} />
                </MockSearchContextProvider>
            );
        });

        const element = await screen.findByTestId('filter');

        expect(element).toBeInTheDocument();
    });
});
