import userEvent from '@testing-library/user-event';
import {faFilter, faList} from '@fortawesome/free-solid-svg-icons';
import {act, render, screen} from '_ui/_tests/testUtils';
import {ViewV2Shortcut} from '../../../../../../__generated__';
import {TabHeader} from '../TabHeader';
import {type ViewSettingsTabConfig} from '../_types';

const mockToggleShortcut = jest.fn();
let mockShortcuts: ViewV2Shortcut[];

jest.mock('../../store-current-view/useCurrentView', () => ({
    useCurrentView: () => ({shortcuts: mockShortcuts, toggleShortcut: mockToggleShortcut}),
}));

const filtersTab: ViewSettingsTabConfig = {key: 'filters', labelKey: 'view_settings.tab.filters', icon: faFilter};
const displayTab: ViewSettingsTabConfig = {key: 'display', labelKey: 'view_settings.tab.display', icon: faList};

describe('TabHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShortcuts = [ViewV2Shortcut.display];
    });

    it('toggles the shortcut of a non-display tab on click', async () => {
        render(<TabHeader tab={filtersTab} canEditAvailableAttributesInHeader={false} />);

        await act(async () => userEvent.click(screen.getByLabelText('view_settings.pin')));

        expect(mockToggleShortcut).toHaveBeenCalledWith(ViewV2Shortcut.filters);
    });

    it('shows the unpin label when the tab is already pinned', () => {
        mockShortcuts = [ViewV2Shortcut.display, ViewV2Shortcut.filters];
        render(<TabHeader tab={filtersTab} canEditAvailableAttributesInHeader={false} />);

        expect(screen.getByLabelText('view_settings.unpin')).toBeInTheDocument();
    });

    it('hides the pin button on the always-pinned display tab', () => {
        render(<TabHeader tab={displayTab} canEditAvailableAttributesInHeader={false} />);

        expect(screen.queryByLabelText('view_settings.unpin')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('view_settings.pin')).not.toBeInTheDocument();
    });
});
