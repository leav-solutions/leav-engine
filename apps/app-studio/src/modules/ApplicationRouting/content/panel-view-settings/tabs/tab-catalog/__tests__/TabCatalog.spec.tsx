import userEvent from '@testing-library/user-event';
import {act, render, screen} from '_ui/_tests/testUtils';
import {TabCatalog} from '../TabCatalog';

// usePanelEventHandlers comes from @leav/ui; keep useLang real for localizedTranslation.
const mockDispatch = jest.fn();

jest.mock('@leav/ui', () => ({
    ...jest.requireActual('@leav/ui'),
    usePanelEventHandlers: () => ({dispatch: mockDispatch}),
}));

let mockSave: jest.Mock;
jest.mock('../../../current-view-section/useCurrentViewActions', () => ({
    useCurrentViewActions: () => ({save: mockSave, saveLoading: false}),
}));

let mockCatalog: {myViews: any[]; sharedViews: any[]};
jest.mock('../useViewCatalog', () => ({
    useViewCatalog: () => mockCatalog,
}));

let mockCurrentView: {view: {id: string; label?: Record<string, string>} | null; isDirty: boolean};
jest.mock('../../../store-current-view/useCurrentView', () => ({
    useCurrentView: () => mockCurrentView,
}));

describe('TabCatalog', () => {
    const user = userEvent.setup();

    const myView = {id: 'view-1', label: {fr: 'Vue A'}, shared: false, created_by: {id: '123'}};
    const mySharedView = {id: 'view-2', label: {fr: 'Vue B'}, shared: true, created_by: {id: '123'}};
    const otherSharedView = {id: 'view-3', label: {fr: 'Vue C'}, shared: true, created_by: {id: '999'}};

    beforeEach(() => {
        jest.clearAllMocks();
        mockSave = jest.fn().mockResolvedValue(true);
        mockCatalog = {myViews: [myView, mySharedView], sharedViews: [otherSharedView]};
        mockCurrentView = {view: {id: 'view-1', label: {fr: 'Vue A'}}, isDirty: false};
    });

    describe('rendering', () => {
        it('renders the two sections with their views', () => {
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            expect(screen.getByText('view_settings.my-views')).toBeInTheDocument();
            expect(screen.getByText('view_settings.shared-views')).toBeInTheDocument();
            expect(screen.getByText('Vue A')).toBeInTheDocument();
            expect(screen.getByText('Vue B')).toBeInTheDocument();
            expect(screen.getByText('Vue C')).toBeInTheDocument();
        });

        it('shows the empty states when a section has no view', () => {
            mockCatalog = {myViews: [], sharedViews: []};
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            expect(screen.getByText('view_settings.my-views-empty')).toBeInTheDocument();
            expect(screen.getByText('view_settings.shared-views-empty')).toBeInTheDocument();
        });
    });

    describe('selection', () => {
        it('dispatches view-settings-select-view when clicking another view (not dirty)', async () => {
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            await act(async () => {
                await user.click(screen.getByText('Vue B'));
            });

            expect(mockDispatch).toHaveBeenCalledWith({type: 'view-settings-select-view', data: {viewId: 'view-2'}});
            expect(screen.queryByText('view_settings.unsaved-changes.title')).not.toBeInTheDocument();
        });

        it('is a no-op when clicking the already-loaded view', async () => {
            // currentLoadedView.id === 'view-1' === clicked id ⇒ no dispatch, no modal.
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            await act(async () => {
                await user.click(screen.getByText('Vue A'));
            });

            expect(mockDispatch).not.toHaveBeenCalled();
            expect(screen.queryByText('view_settings.unsaved-changes.title')).not.toBeInTheDocument();
        });

        it('opens the unsaved-changes modal instead of dispatching when there are unsaved changes', async () => {
            mockCurrentView = {view: {id: 'view-1', label: {fr: 'Vue A'}}, isDirty: true};
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            await act(async () => {
                await user.click(screen.getByText('Vue B'));
            });

            expect(screen.getByText('view_settings.unsaved-changes.title')).toBeInTheDocument();
            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('discards changes and dispatches when clicking Discard', async () => {
            mockCurrentView = {view: {id: 'view-1', label: {fr: 'Vue A'}}, isDirty: true};
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            await act(async () => {
                await user.click(screen.getByText('Vue B'));
            });
            await act(async () => {
                await user.click(screen.getByText('view_settings.unsaved-changes.discard'));
            });

            expect(mockSave).not.toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith({type: 'view-settings-select-view', data: {viewId: 'view-2'}});
        });

        it('saves then dispatches when clicking Save and save succeeds', async () => {
            mockCurrentView = {view: {id: 'view-1', label: {fr: 'Vue A'}}, isDirty: true};
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            await act(async () => {
                await user.click(screen.getByText('Vue B'));
            });
            await act(async () => {
                await user.click(screen.getByText('view_settings.current-view.save'));
            });

            expect(mockSave).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith({type: 'view-settings-select-view', data: {viewId: 'view-2'}});
        });

        it('keeps the modal open and does not dispatch when save fails', async () => {
            mockSave = jest.fn().mockResolvedValue(false);
            mockCurrentView = {view: {id: 'view-1', label: {fr: 'Vue A'}}, isDirty: true};
            render(<TabCatalog viewId="view-1" libraryId="lib" />);

            await act(async () => {
                await user.click(screen.getByText('Vue B'));
            });
            await act(async () => {
                await user.click(screen.getByText('view_settings.current-view.save'));
            });

            expect(mockSave).toHaveBeenCalledTimes(1);
            expect(mockDispatch).not.toHaveBeenCalled();
            expect(screen.getByText('view_settings.unsaved-changes.title')).toBeInTheDocument();
        });
    });
});
