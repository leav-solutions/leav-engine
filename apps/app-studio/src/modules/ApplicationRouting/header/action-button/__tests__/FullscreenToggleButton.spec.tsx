import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import * as useFullscreenHook from '../../../../../hooks/useFullscreen';
import {FullscreenToggleButton} from '../FullscreenToggleButton';

vi.mock('../../../../../hooks/useFullscreen', () => ({
    useFullscreen: vi.fn(),
}));

describe('FullscreenToggleButton', () => {
    const spyUseFullscreen = vi.spyOn(useFullscreenHook, 'useFullscreen');
    const enterFullscreen = vi.fn();
    const exitFullscreen = vi.fn();
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        vi.clearAllMocks();
        user = userEvent.setup();
    });

    it('should enter fullscreen for its panel when not fullscreen', async () => {
        spyUseFullscreen.mockReturnValue({fullscreenPanelId: null, enterFullscreen, exitFullscreen});
        render(<FullscreenToggleButton panelId="planning" />);

        await user.click(screen.getByRole('button'));

        expect(enterFullscreen).toHaveBeenCalledTimes(1);
        expect(enterFullscreen).toHaveBeenCalledWith('planning');
        expect(exitFullscreen).not.toHaveBeenCalled();
    });

    it('should exit fullscreen when its panel is already fullscreen', async () => {
        spyUseFullscreen.mockReturnValue({fullscreenPanelId: 'planning', enterFullscreen, exitFullscreen});
        render(<FullscreenToggleButton panelId="planning" />);

        await user.click(screen.getByRole('button'));

        expect(exitFullscreen).toHaveBeenCalledTimes(1);
        expect(enterFullscreen).not.toHaveBeenCalled();
    });

    it('should enter fullscreen when another panel is fullscreen', async () => {
        spyUseFullscreen.mockReturnValue({fullscreenPanelId: 'other', enterFullscreen, exitFullscreen});
        render(<FullscreenToggleButton panelId="planning" />);

        await user.click(screen.getByRole('button'));

        expect(enterFullscreen).toHaveBeenCalledWith('planning');
        expect(exitFullscreen).not.toHaveBeenCalled();
    });
});
