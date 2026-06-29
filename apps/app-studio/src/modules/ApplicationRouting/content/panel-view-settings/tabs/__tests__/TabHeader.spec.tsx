import userEvent from '@testing-library/user-event';
import {faFilter, faList} from '@fortawesome/free-solid-svg-icons';
import {act, render, screen} from '_ui/_tests/testUtils';
import {ViewV2Shortcut} from '../../../../../../__generated__';
import {TabHeader} from '../TabHeader';
import {type ViewSettingsTabConfig} from '../_types';

const mockToggleShortcut = jest.fn();
let mockShortcuts: ViewV2Shortcut[];
let mockCanManageViews: boolean;

jest.mock('../../store-current-view/useCurrentView', () => ({
    useCurrentView: () => ({
        shortcuts: mockShortcuts,
        toggleShortcut: mockToggleShortcut,
        canManageViews: mockCanManageViews,
    }),
}));

jest.mock('../../manage-available-attributes/AvailableAttributesDropdown', () => ({
    AvailableAttributesDropdown: ({mode}: {mode: string}) => <button aria-label={`gear-${mode}`} />,
}));

const filtersTab: ViewSettingsTabConfig = {key: 'filters', labelKey: 'view_settings.tab.filters', icon: faFilter};
const displayTab: ViewSettingsTabConfig = {key: 'display', labelKey: 'view_settings.tab.display', icon: faList};
const sortsTab: ViewSettingsTabConfig = {key: 'sorts', labelKey: 'view_settings.tab.sorts', icon: faList};

// TabHeader renders the gear in "nested" mode (see the stub above).
const gearLabel = 'gear-nested';

describe('TabHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShortcuts = [ViewV2Shortcut.display];
        mockCanManageViews = false;
    });

    it('toggles the shortcut of a non-display tab on click', async () => {
        render(<TabHeader tab={filtersTab} />);

        await act(async () => userEvent.click(screen.getByLabelText('view_settings.pin')));

        expect(mockToggleShortcut).toHaveBeenCalledWith(ViewV2Shortcut.filters);
    });

    it('shows the unpin label when the tab is already pinned', () => {
        mockShortcuts = [ViewV2Shortcut.display, ViewV2Shortcut.filters];
        render(<TabHeader tab={filtersTab} />);

        expect(screen.getByLabelText('view_settings.unpin')).toBeInTheDocument();
    });

    it('hides the pin button on the always-pinned display tab', () => {
        render(<TabHeader tab={displayTab} />);

        expect(screen.queryByLabelText('view_settings.unpin')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('view_settings.pin')).not.toBeInTheDocument();
    });

    it('shows the available-attributes gear for a views-manager on the sorts tab', () => {
        mockCanManageViews = true;
        render(<TabHeader tab={sortsTab} />);

        expect(screen.getByLabelText(gearLabel)).toBeInTheDocument();
    });

    it('hides the gear without the manage_views permission on the sorts tab', () => {
        mockCanManageViews = false;
        render(<TabHeader tab={sortsTab} />);

        expect(screen.queryByLabelText(gearLabel)).not.toBeInTheDocument();
    });

    it('hides the gear for a views-manager on a tab that does not host it (filters)', () => {
        mockCanManageViews = true;
        render(<TabHeader tab={filtersTab} />);

        expect(screen.queryByLabelText(gearLabel)).not.toBeInTheDocument();
    });
});
