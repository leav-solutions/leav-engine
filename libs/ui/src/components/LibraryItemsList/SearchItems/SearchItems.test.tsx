// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import SearchItems from './SearchItems';

describe('SearchItems', () => {
    test('should display text field and submit button', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <SearchItems />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
});
