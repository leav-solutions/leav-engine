// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import Dimmer from './Dimmer';

describe('Dimmer', () => {
    test('Render dimmer, handle onclick', async () => {
        const _handleClick = jest.fn();

        await act(async () => {
            render(<Dimmer onClick={_handleClick} />);
        });

        const dimmerElem = screen.getByTestId('dimmer');
        expect(dimmerElem).toBeInTheDocument();

        await act(async () => {
            userEvent.click(dimmerElem);
        });

        expect(_handleClick).toBeCalled();
    });
});
