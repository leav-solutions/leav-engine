import React from 'react';
import {act, render, screen} from '../../../_tests/testUtils';
import CustomIcon from './CustomIcon';

describe('CustomIcon', () => {
    test('Render image', async () => {
        await act(async () => {
            render(<CustomIcon svg="" />);
        });

        expect(screen.getByRole('img')).toBeInTheDocument();
    });
});
