// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import MenuItemListSelected from './MenuItemListSelected';

describe('MenuItemListSelected', () => {
    test('should have quit mode selection button', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemListSelected active />
            </MockSearchContextProvider>
        );

        expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
    });
});
