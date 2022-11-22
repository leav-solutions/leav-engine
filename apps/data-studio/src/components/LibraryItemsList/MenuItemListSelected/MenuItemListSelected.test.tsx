// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import MenuItemListSelected from './MenuItemListSelected';

jest.mock('./ActionsMenu', () => {
    return function ActionsMenu() {
        return <div>ActionsMenu</div>;
    };
});

describe('MenuItemListSelected', () => {
    test('should have quit mode selection button', async () => {
        await act(async () => {
            render(<MenuItemListSelected active />);
        });

        expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
    });
});
