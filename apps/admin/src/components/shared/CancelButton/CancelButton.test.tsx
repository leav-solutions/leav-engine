// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {shallow} from 'enzyme';
import React from 'react';
import CancelButton from './CancelButton';
import {act, render, screen} from '_tests/testUtils';

describe('CancelButton', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<CancelButton disabled={false} />);
        });

        expect(screen.getAllByRole('button').length).toBe(1);
    });

    test('Disable button', async () => {
        await act(async () => {
            render(<CancelButton disabled />);
        });

        expect(screen.getByRole('button')).toHaveProperty('disabled');
    });
});
