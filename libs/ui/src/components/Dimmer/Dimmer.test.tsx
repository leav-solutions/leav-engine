// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import Dimmer from './Dimmer';

describe('Dimmer', () => {
    test('Render dimmer, handle onclick', async () => {
        const _handleClick = jest.fn();

        render(<Dimmer onClick={_handleClick} />);

        const dimmerElem = screen.getByTestId('dimmer');
        expect(dimmerElem).toBeInTheDocument();

        userEvent.click(dimmerElem);

        await waitFor(() => expect(_handleClick).toBeCalled());
    });
});
