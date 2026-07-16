import userEvent from '@testing-library/user-event';
import {act, render, screen} from '_ui/_tests/testUtils';
import {PanelViewSettings} from '../PanelViewSettings';

let mockFilters: unknown[];
let mockActivatedSorts: unknown[];

// Only `view.filters`/`activatedSorts` (used for the sidebar's green-dot indicator) are exercised
// here; other fields aren't read by `PanelViewSettings`.
vi.mock('../store-current-view/useCurrentView', () => ({
    useCurrentView: () => ({view: {filters: mockFilters}, activatedSorts: mockActivatedSorts}),
}));

// The tab contents pull in the whole view store / network stack; the sidebar rail and the
// default-tab guard are what we exercise here, so stub the heavy children out.
vi.mock('../current-view-section/CurrentViewSection', () => ({
    CurrentViewSection: () => <div />,
}));
vi.mock('../tabs/TabHeader', () => ({
    TabHeader: ({tab}: {tab: {key: string}}) => <div data-testid="tab-header">{tab.key}</div>,
}));
vi.mock('../tabs/tab-display/TabDisplay', () => ({TabDisplay: () => <div>display-content</div>}));
vi.mock('../tabs/tab-filters/TabFilters', () => ({TabFilters: () => <div>filters-content</div>}));
vi.mock('../tabs/tab-sorts/TabSorts', () => ({TabSorts: () => <div>sorts-content</div>}));
vi.mock('../tabs/tab-catalog/TabCatalog', () => ({TabCatalog: () => <div>catalog-content</div>}));
vi.mock('../tabs/tab-display/useDelegatedDisplayIframeSource', () => ({
    useDelegatedDisplayIframeSource: () => undefined,
}));

// t() returns the i18n key, so the sidebar button aria-label is the tab's labelKey.
// Note: the catalog tab's label namespace is `views`, not `catalog` (see tabs/_constantes.ts).
const LABEL_BY_TAB = {
    catalog: 'view_settings.tab.views',
    display: 'view_settings.tab.display',
    filters: 'view_settings.tab.filters',
    sorts: 'view_settings.tab.sorts',
} as const;
const tabLabel = (key: keyof typeof LABEL_BY_TAB) => LABEL_BY_TAB[key];

describe('PanelViewSettings', () => {
    beforeEach(() => {
        mockFilters = [];
        mockActivatedSorts = [];
    });

    it('shows a green dot on the filters/sorts tab buttons when they have an active value', () => {
        mockFilters = [{id: 'attr1', values: ['value'], withEmptyValues: false}];
        mockActivatedSorts = [{id: 'attr2'}];
        render(<PanelViewSettings libraryId="lib" onClose={vi.fn()} />);

        const filtersBadge = screen.getByLabelText(tabLabel('filters')).closest('.ant-badge');
        const sortsBadge = screen.getByLabelText(tabLabel('sorts')).closest('.ant-badge');
        const displayBadge = screen.getByLabelText(tabLabel('display')).closest('.ant-badge');

        expect(filtersBadge?.querySelector('.ant-badge-dot')).toBeInTheDocument();
        expect(sortsBadge?.querySelector('.ant-badge-dot')).toBeInTheDocument();
        expect(displayBadge?.querySelector('.ant-badge-dot')).not.toBeInTheDocument();
    });

    it('shows no green dot on the filters/sorts tab buttons when there is no active value', () => {
        render(<PanelViewSettings libraryId="lib" onClose={vi.fn()} />);

        const filtersBadge = screen.getByLabelText(tabLabel('filters')).closest('.ant-badge');
        const sortsBadge = screen.getByLabelText(tabLabel('sorts')).closest('.ant-badge');

        expect(filtersBadge?.querySelector('.ant-badge-dot')).not.toBeInTheDocument();
        expect(sortsBadge?.querySelector('.ant-badge-dot')).not.toBeInTheDocument();
    });

    it('shows no green dot on the sorts tab button when every sort is deactivated', () => {
        // `activatedSorts` reflects only activated sorts (cf. useCurrentView) — an
        // all-deactivated view must therefore have no active sort, even though sorts exist.
        mockActivatedSorts = [];
        render(<PanelViewSettings libraryId="lib" onClose={vi.fn()} />);

        const sortsBadge = screen.getByLabelText(tabLabel('sorts')).closest('.ant-badge');
        expect(sortsBadge?.querySelector('.ant-badge-dot')).not.toBeInTheDocument();
    });

    it('shows no green dot on the filters tab button when a filter exists but has no value', () => {
        // A filter merely made "available" by the admin gear is seeded with empty values and no
        // `withEmptyValues` — it must not count as active, regardless of its pin state.
        mockFilters = [{id: 'attr1', values: [], withEmptyValues: false}];
        render(<PanelViewSettings libraryId="lib" onClose={vi.fn()} />);

        const filtersBadge = screen.getByLabelText(tabLabel('filters')).closest('.ant-badge');
        expect(filtersBadge?.querySelector('.ant-badge-dot')).not.toBeInTheDocument();
    });

    it('shows a green dot on the filters tab button for an unpinned filter with a value', () => {
        mockFilters = [{id: 'attr1', pinned: false, values: [], withEmptyValues: true}];
        render(<PanelViewSettings libraryId="lib" onClose={vi.fn()} />);

        const filtersBadge = screen.getByLabelText(tabLabel('filters')).closest('.ant-badge');
        expect(filtersBadge?.querySelector('.ant-badge-dot')).toBeInTheDocument();
    });

    it('renders all four tab buttons without hiddenTabs', () => {
        render(<PanelViewSettings libraryId="lib" onClose={vi.fn()} />);

        expect(screen.getByLabelText(tabLabel('display'))).toBeInTheDocument();
        expect(screen.getByLabelText(tabLabel('filters'))).toBeInTheDocument();
        expect(screen.getByLabelText(tabLabel('sorts'))).toBeInTheDocument();
        expect(screen.getByLabelText(tabLabel('catalog'))).toBeInTheDocument();
    });

    it('does not render a hidden tab button', () => {
        render(<PanelViewSettings libraryId="lib" hiddenTabs={['sorts']} onClose={vi.fn()} />);

        expect(screen.queryByLabelText(tabLabel('sorts'))).not.toBeInTheDocument();
        expect(screen.getByLabelText(tabLabel('display'))).toBeInTheDocument();
        expect(screen.getByLabelText(tabLabel('filters'))).toBeInTheDocument();
        expect(screen.getByLabelText(tabLabel('catalog'))).toBeInTheDocument();
    });

    it('falls back to the first visible tab when the requested tab is hidden', () => {
        render(
            <PanelViewSettings
                libraryId="lib"
                currentTab="sorts"
                hiddenTabs={['sorts', 'display']}
                onClose={vi.fn()}
            />,
        );

        // Tab order is [catalog, display, filters, sorts]; display + sorts hidden → first visible is catalog.
        expect(screen.getByTestId('tab-header')).toHaveTextContent('catalog');
    });

    it('lets the user switch to another visible tab', async () => {
        render(<PanelViewSettings libraryId="lib" hiddenTabs={['sorts']} onClose={vi.fn()} />);

        await act(async () => userEvent.click(screen.getByLabelText(tabLabel('filters'))));

        expect(screen.getByTestId('tab-header')).toHaveTextContent('filters');
    });
});
