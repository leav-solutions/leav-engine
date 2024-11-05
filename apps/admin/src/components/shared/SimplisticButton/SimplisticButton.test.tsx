// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import SimplisticButton from './SimplisticButton';

describe('SimplisticButton', () => {
    test('Render test', async () => {
        const _handleClick = jest.fn();
        render(
            <SimplisticButton onClick={_handleClick}>
                <div>Some child</div>
            </SimplisticButton>
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Some child')).toBeInTheDocument();

        userEvent.click(screen.getByRole('button'));
        expect(_handleClick).toHaveBeenCalledTimes(1);
    });
});
