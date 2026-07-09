import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {FullscreenAlert} from '../FullscreenAlert';

const KEY = 'fullscreenAlertDismissed';

describe('FullscreenAlert', () => {
    beforeEach(() => localStorage.clear());

    it('should render the fullscreen alert title', () => {
        render(<FullscreenAlert />);
        expect(screen.getByText('fullscreen.alert_title')).toBeInTheDocument();
    });

    it('should persist dismissal when the close button is clicked', async () => {
        const user = userEvent.setup();
        render(<FullscreenAlert />);

        await user.click(screen.getByRole('button', {name: /fermer/i}));

        expect(localStorage.getItem(KEY)).toBe('true');
    });

    it('should not render when already dismissed', () => {
        localStorage.setItem(KEY, 'true');
        render(<FullscreenAlert />);
        expect(screen.queryByText('fullscreen.alert_title')).toBeNull();
    });
});
