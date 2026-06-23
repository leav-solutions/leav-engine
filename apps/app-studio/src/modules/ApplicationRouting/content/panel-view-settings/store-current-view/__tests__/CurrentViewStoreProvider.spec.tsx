import userEvent from '@testing-library/user-event';
import {act, render, screen} from '_ui/_tests/testUtils';
import {ViewV2Types} from '../../../../../../__generated__';
import {type CurrentView} from '../_types';
import {useCurrentView} from '../useCurrentView';
import {CurrentViewStoreProvider} from '../CurrentViewStoreProvider';

// usePanelEventHandlers comes from @leav/ui; keep useLang/useUser real (provided by the test render).
jest.mock('@leav/ui', () => ({
    ...jest.requireActual('@leav/ui'),
    usePanelEventHandlers: () => ({dispatch: jest.fn()}),
}));

// The store resolves its current view id from `lastUsedViewId ?? viewId`; pin lastUsedViewId off.
jest.mock('../../tabs/tab-catalog/useLastUsedView', () => ({
    useLastUsedView: () => ({lastUsedViewId: undefined, saveLastUsedView: jest.fn()}),
}));

const mockUseGetViewV2Query = jest.fn();
jest.mock('../../../../../../__generated__', () => ({
    ...jest.requireActual('../../../../../../__generated__'),
    useGetViewV2Query: (...args: unknown[]) => mockUseGetViewV2Query(...args),
}));

type NonNullView = NonNullable<CurrentView>;

const makeView = (overrides: Partial<NonNullView> = {}): NonNullView => ({
    id: 'view-1',
    library: 'my_lib',
    label: {fr: 'Vue A'},
    shared: false,
    created_by: {id: '123', whoAmI: {id: '123', label: 'Me'}},
    display: {
        type: ViewV2Types.list,
        attributes: [
            {visible: true, attribute: {id: 'attribute_2', label: {fr: 'Attribut 2'}}},
            {visible: true, attribute: {id: 'attribute_3', label: {fr: 'Attribut 3'}}},
        ],
    },
    sorts: [],
    ...overrides,
});

// Stands in for the view-settings volet: reads the shared store and lets the test toggle a column.
const VoletChild = () => {
    const {view, isEmptyView, toggleVisibility} = useCurrentView();

    if (!view) {
        return <div>{isEmptyView ? 'empty-view' : 'no-view'}</div>;
    }

    return (
        <div>
            {view.display.attributes.map(({attribute, visible}) => (
                <div key={attribute.id} data-testid={`col-${attribute.id}`}>
                    {visible ? 'visible' : 'hidden'}
                </div>
            ))}
            <button onClick={() => toggleVisibility('attribute_2')}>toggle</button>
        </div>
    );
};

const Wrapper = ({showVolet, providerKey = 'view-1'}: {showVolet: boolean; providerKey?: string}) => (
    <CurrentViewStoreProvider key={providerKey} viewId="view-1">
        {showVolet ? <VoletChild /> : <div>volet-closed</div>}
    </CurrentViewStoreProvider>
);

beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetViewV2Query.mockReturnValue({data: {viewV2: makeView()}});
});

describe('CurrentViewStoreProvider', () => {
    const user = userEvent.setup();

    it('loads the fetched view into the shared store', async () => {
        render(<Wrapper showVolet />);

        expect(await screen.findByTestId('col-attribute_2')).toHaveTextContent('visible');
    });

    it('keeps unsaved edits when the volet child unmounts and remounts (the bug fix)', async () => {
        const {rerender} = render(<Wrapper showVolet />);

        await screen.findByTestId('col-attribute_2');

        // Hide a column (unsaved edit).
        await act(async () => {
            await user.click(screen.getByText('toggle'));
        });
        expect(screen.getByTestId('col-attribute_2')).toHaveTextContent('hidden');

        // Close the volet: the child unmounts but the provider (mounted higher) stays.
        rerender(<Wrapper showVolet={false} />);
        expect(screen.getByText('volet-closed')).toBeInTheDocument();

        // Reopen the volet: the edit must still be there — no reload from the server.
        rerender(<Wrapper showVolet />);
        expect(screen.getByTestId('col-attribute_2')).toHaveTextContent('hidden');
    });

    it('does NOT clobber unsaved edits on a background refetch of the same view id (R4)', async () => {
        const {rerender} = render(<Wrapper showVolet />);

        await screen.findByTestId('col-attribute_2');
        await act(async () => {
            await user.click(screen.getByText('toggle'));
        });
        expect(screen.getByTestId('col-attribute_2')).toHaveTextContent('hidden');

        // A fresh query result for the SAME id (e.g. a cache refetch): the load guard must ignore it.
        mockUseGetViewV2Query.mockReturnValue({data: {viewV2: makeView()}});
        rerender(<Wrapper showVolet />);

        expect(screen.getByTestId('col-attribute_2')).toHaveTextContent('hidden');
    });

    it('reloads the saved view when the provider is remounted (e.g. switching panels)', async () => {
        const {rerender} = render(<Wrapper showVolet providerKey="view-1" />);

        await screen.findByTestId('col-attribute_2');
        await act(async () => {
            await user.click(screen.getByText('toggle'));
        });
        expect(screen.getByTestId('col-attribute_2')).toHaveTextContent('hidden');

        // A new key remounts the provider (fresh edit session): the saved view is loaded again.
        rerender(<Wrapper showVolet providerKey="other-panel" />);
        expect(await screen.findByTestId('col-attribute_2')).toHaveTextContent('visible');
    });

    it('falls back to the empty state when the configured id does not resolve to a v2 view', () => {
        // e.g. a v1 / deleted / no-permission id: the v2 query settles with no view.
        mockUseGetViewV2Query.mockReturnValue({data: {viewV2: null}});

        render(<Wrapper showVolet />);

        expect(screen.getByText('empty-view')).toBeInTheDocument();
    });

    it('falls back to the empty state when the resolved view belongs to another library (guard)', () => {
        // The id resolves to a view of library 'my_lib', but this explorer displays 'other_lib':
        // a stale / cross-library view id must never be applied to the wrong explorer.
        mockUseGetViewV2Query.mockReturnValue({data: {viewV2: makeView({library: 'my_lib'})}});

        render(
            <CurrentViewStoreProvider viewId="view-1" displayedLibraryId="other_lib">
                <VoletChild />
            </CurrentViewStoreProvider>,
        );

        expect(screen.getByText('empty-view')).toBeInTheDocument();
    });

    it('loads the view when it belongs to the displayed library', async () => {
        mockUseGetViewV2Query.mockReturnValue({data: {viewV2: makeView({library: 'my_lib'})}});

        render(
            <CurrentViewStoreProvider viewId="view-1" displayedLibraryId="my_lib">
                <VoletChild />
            </CurrentViewStoreProvider>,
        );

        expect(await screen.findByTestId('col-attribute_2')).toHaveTextContent('visible');
    });

    it('falls back to the empty state when no view id is configured', () => {
        // No configured id: the query is skipped (no data), the panel is empty.
        mockUseGetViewV2Query.mockReturnValue({data: undefined});

        render(
            <CurrentViewStoreProvider viewId={undefined}>
                <VoletChild />
            </CurrentViewStoreProvider>,
        );

        expect(screen.getByText('empty-view')).toBeInTheDocument();
    });

    it('does not flash the empty state while the view is still loading', () => {
        mockUseGetViewV2Query.mockReturnValue({data: undefined, loading: true});

        render(<Wrapper showVolet />);

        expect(screen.getByText('no-view')).toBeInTheDocument();
    });
});
