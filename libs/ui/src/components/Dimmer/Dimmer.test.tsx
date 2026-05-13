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
