// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NoValue from './NoValue';

describe('NoValue', () => {
    const _handleAddValue = jest.fn();

    test('Display add value button', async () => {
        render(<NoValue canAddValue onAddValue={_handleAddValue} />);

        const addBtn = screen.getByRole('button', {name: /add/});
        expect(addBtn).toBeInTheDocument();

        userEvent.click(addBtn);
        expect(_handleAddValue).toBeCalled();
    });

    test('Display no value', async () => {
        render(<NoValue canAddValue={false} onAddValue={_handleAddValue} />);

        expect(screen.getByText(/no_value/)).toBeInTheDocument();

        const addBtn = screen.queryByRole('button', {name: /add/});
        expect(addBtn).not.toBeInTheDocument();
    });
});
