import {render} from '@testing-library/react';
import {IFrameMessengerClientProvider} from './IFrameMessengerClientProvider';
import {usePanelMessenger} from '_ui/hooks/usePanelMessenger/usePanelMessenger';

vi.mock('_ui/hooks/usePanelMessenger/usePanelMessenger');

describe('IFrameMessengerClientProvider', () => {
    const notifyEscape = vi.fn();
    const unregister = vi.fn();

    beforeEach(() => {
        notifyEscape.mockClear();
        unregister.mockClear();
        vi.mocked(usePanelMessenger).mockReturnValue({
            isRegistered: true,
            notifyEscape,
            unregister,
        } as unknown as ReturnType<typeof usePanelMessenger>);
    });

    it('should notify the host when the user presses Escape inside the iframe', () => {
        render(<IFrameMessengerClientProvider>child</IFrameMessengerClientProvider>);

        window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));

        expect(notifyEscape).toHaveBeenCalledTimes(1);
    });

    it('should not notify the host for keys other than Escape', () => {
        render(<IFrameMessengerClientProvider>child</IFrameMessengerClientProvider>);

        window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

        expect(notifyEscape).not.toHaveBeenCalled();
    });
});
