// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import AddFilter from './AddFilter';

jest.mock(
    '../../../AttributesSelectionList',
    () =>
        function AttributesSelectionList() {
            return <div>AttributesSelectionList</div>;
        }
);

describe('AttributeList', () => {
    test('should have a List', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <AddFilter showAttr setShowAttr={jest.fn()} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByText('AttributesSelectionList')).toBeInTheDocument();
    });
});
