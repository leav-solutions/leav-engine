import {render, screen} from '_ui/_tests/testUtils';
import {TabCatalog} from '../TabCatalog';

// Selection (useViewSelection) and per-row actions (useViewActions) are covered by their own hook specs.
// This file only asserts that TabCatalog wires the catalog into its two sections.
vi.mock('@leav/ui', async () => ({
    ...(await vi.importActual('@leav/ui')),
    usePanelEventHandlers: () => ({dispatch: vi.fn()}),
    useConfirmModal: () => ({openConfirmModal: vi.fn()}),
    useUser: () => ({userData: {userId: '123'}}),
}));

vi.mock('../useDeleteView', () => ({
    useDeleteView: () => ({deleteView: vi.fn(), deleteLoading: false}),
}));

vi.mock('../../../current-view-section/useCurrentViewActions', () => ({
    useCurrentViewActions: () => ({save: vi.fn(), saveLoading: false}),
}));

let mockCatalog: {myViews: any[]; sharedViews: any[]};
vi.mock('../useViewCatalog', () => ({
    useViewCatalog: () => mockCatalog,
}));

vi.mock('../useLastUsedView', () => ({
    useLastUsedView: () => ({saveLastUsedView: vi.fn(), lastUsedViewId: undefined}),
}));

let mockCurrentView: {
    view: {id: string; label?: Record<string, string>} | null;
    isDirty: boolean;
    isEmptyView?: boolean;
};
vi.mock('../../../store-current-view/useCurrentView', () => ({
    useCurrentView: () => mockCurrentView,
}));

describe('TabCatalog', () => {
    const myView = {id: 'view-1', label: {fr: 'Vue A'}, shared: false, created_by: {id: '123'}};
    const mySharedView = {id: 'view-2', label: {fr: 'Vue B'}, shared: true, created_by: {id: '123'}};
    const otherSharedView = {id: 'view-3', label: {fr: 'Vue C'}, shared: true, created_by: {id: '999'}};

    beforeEach(() => {
        vi.clearAllMocks();
        mockCatalog = {myViews: [myView, mySharedView], sharedViews: [otherSharedView]};
        mockCurrentView = {view: {id: 'view-1', label: {fr: 'Vue A'}}, isDirty: false};
    });

    it('renders the two sections with their views', () => {
        render(<TabCatalog libraryId="lib" />);

        expect(screen.getByText('view_settings.my_views')).toBeInTheDocument();
        expect(screen.getByText('view_settings.shared_views')).toBeInTheDocument();
        expect(screen.getByText('Vue A')).toBeInTheDocument();
        expect(screen.getByText('Vue B')).toBeInTheDocument();
        expect(screen.getByText('Vue C')).toBeInTheDocument();
    });

    it('shows the empty states when a section has no view', () => {
        mockCatalog = {myViews: [], sharedViews: []};
        render(<TabCatalog libraryId="lib" />);

        expect(screen.getByText('view_settings.my_views_empty')).toBeInTheDocument();
        expect(screen.getByText('view_settings.shared_views_empty')).toBeInTheDocument();
    });

    it('still renders the catalog in the empty (default) view state', () => {
        // No view loaded: the catalog must stay reachable so a view can be selected.
        mockCurrentView = {view: null, isDirty: false, isEmptyView: true};
        render(<TabCatalog libraryId="lib" />);

        expect(screen.getByText('view_settings.my_views')).toBeInTheDocument();
        expect(screen.getByText('Vue A')).toBeInTheDocument();
    });
});
