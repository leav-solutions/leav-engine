// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import CustomIcon from './CustomIcon';

describe('CustomIcon', () => {
    test('Render image', async () => {
        await act(async () => {
            render(<CustomIcon svg="" />);
        });

        expect(screen.getByRole('img')).toBeInTheDocument();
    });
});
