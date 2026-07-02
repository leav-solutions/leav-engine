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
    AvailableAttributesDropdown: ({facet}: {facet: string}) => <button aria-label={`gear-${facet}`} />,
}));

const filtersTab: ViewSettingsTabConfig = {key: 'filters', labelKey: 'view_settings.tab.filters', icon: faFilter};
const displayTab: ViewSettingsTabConfig = {key: 'display', labelKey: 'view_settings.tab.display', icon: faList};
const sortsTab: ViewSettingsTabConfig = {key: 'sorts', labelKey: 'view_settings.tab.sorts', icon: faList};

// TabHeader passes `facet={tab.key}` to the gear (see the stub above): gear-sorts / gear-filters.
const gearLabel = (facet: string) => `gear-${facet}`;

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

    it('shows the available-attributes gear (facet=sorts) for a views-manager on the sorts tab', () => {
        mockCanManageViews = true;
        render(<TabHeader tab={sortsTab} />);

        expect(screen.getByLabelText(gearLabel('sorts'))).toBeInTheDocument();
    });

    it('hides the gear without the manage_views permission on the sorts tab', () => {
        mockCanManageViews = false;
        render(<TabHeader tab={sortsTab} />);

        expect(screen.queryByLabelText(gearLabel('sorts'))).not.toBeInTheDocument();
    });

    it('shows the available-attributes gear (facet=filters) for a views-manager on the filters tab', () => {
        mockCanManageViews = true;
        render(<TabHeader tab={filtersTab} />);

        expect(screen.getByLabelText(gearLabel('filters'))).toBeInTheDocument();
    });

    it('hides the gear for a views-manager on a tab that does not host it (display)', () => {
        mockCanManageViews = true;
        render(<TabHeader tab={displayTab} />);

        expect(screen.queryByLabelText(gearLabel('sorts'))).not.toBeInTheDocument();
        expect(screen.queryByLabelText(gearLabel('filters'))).not.toBeInTheDocument();
    });
});
