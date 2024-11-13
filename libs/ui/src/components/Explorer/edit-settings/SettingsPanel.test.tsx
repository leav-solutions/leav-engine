import {render} from '_ui/_tests/testUtils';
import {SettingsPanel} from './SettingsPanel';
import {act, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const setActiveSettingsMock = jest.fn();

jest.mock('./useEditSettings', () => ({
    useEditSettings: () => ({
        setActiveSettings: setActiveSettingsMock,
        activeSettings: {
            content: null,
            title: 'title'
        }
    })
}));

const [DisplayModeLabel] = ['DisplayMode Component'];

jest.mock('./DisplayMode', () => ({
    DisplayMode: () => <div>{DisplayModeLabel}</div>
}));

describe('SettingsPanel', () => {
    beforeEach(() => {
        setActiveSettingsMock.mockClear();
    });

    test('should be able to move to advanced setting and come back', async () => {
        render(<SettingsPanel library="users" />);
        expect(screen.getByRole('heading', {name: 'explorer.view-configuration'})).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: 'explorer.display-mode'}));

        expect(screen.getByText(DisplayModeLabel)).toBeVisible();
        expect(setActiveSettingsMock).toHaveBeenCalledTimes(1);
        expect(setActiveSettingsMock).toHaveBeenCalledWith({
            content: null,
            onClickLeftButton: expect.any(Function),
            title: 'explorer.display-mode'
        });

        const leftSidePanelButtonCallback = setActiveSettingsMock.mock.calls[0][0].onClickLeftButton;
        setActiveSettingsMock.mockClear();
        await act(() => leftSidePanelButtonCallback());

        expect(screen.getByRole('heading', {name: 'explorer.view-configuration'})).toBeVisible();
        expect(setActiveSettingsMock).toHaveBeenCalledTimes(1);
        expect(setActiveSettingsMock).toHaveBeenCalledWith({
            content: null,
            onClickLeftButton: undefined,
            title: 'explorer.settings'
        });
    });
});
