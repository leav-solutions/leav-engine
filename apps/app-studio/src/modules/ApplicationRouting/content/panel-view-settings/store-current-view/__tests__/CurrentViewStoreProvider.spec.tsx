import {useContext} from 'react';
import userEvent from '@testing-library/user-event';
import {act, render, screen} from '_ui/_tests/testUtils';
import {ViewV2Shortcut, ViewV2Types} from '../../../../../../__generated__';
import {type CurrentView} from '../_types';
import {useCurrentView} from '../useCurrentView';
import {CurrentViewContext} from '../CurrentViewContext';
import {CurrentViewStoreProvider} from '../CurrentViewStoreProvider';
import {DEFAULT_DRAFT_VIEW_ID} from '../_constants';

// usePanelEventHandlers comes from @leav/ui; keep useLang/useUser real (provided by the test render).
vi.mock('@leav/ui', async () => ({
    ...(await vi.importActual('@leav/ui')),
    usePanelEventHandlers: () => ({dispatch: vi.fn()}),
}));

// The store resolves its current view id from `selectedViewId ?? lastUsedViewId ?? viewId`. The mocks
// are controllable so a test can drive both the resolution order and the async last-used-view lookup
// still being in flight (feeds `isViewResolving`).
const mockUseLastUsedView = vi.fn();
vi.mock('../../tabs/tab-catalog/useLastUsedView', () => ({
    useLastUsedView: (...args: unknown[]) => mockUseLastUsedView(...args),
}));

// Permission is resolved via an isAllowed query; stub the hook so the provider test stays isolated
// from Apollo. `false` mirrors a non-manager: the default-view draft is never seeded (these tests
// assert the plain empty state). Manager seeding is covered in CurrentViewSection.spec, except the
// `INIT_DEFAULT_VIEW` vs. `isViewResolving` race covered in the `describe` below, which needs `true`.
const mockUseCanManageViews = vi.fn((_libraryId?: string) => false);
vi.mock('../useCanManageViews', () => ({
    useCanManageViews: (libraryId?: string) => mockUseCanManageViews(libraryId),
}));

const mockUseGetViewV2Query = vi.fn();
vi.mock('../../../../../../__generated__', async () => ({
    ...(await vi.importActual('../../../../../../__generated__')),
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
    filters: [],
    shortcuts: [ViewV2Shortcut.display],
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

// `useGetViewV2Query` resolved by the `viewId` variable actually received, so a test can seed several
// candidate views (configured id vs. last-used id) and assert which one wins.
const mockViewV2ById = (byId: Record<string, NonNullView | null>) => {
    mockUseGetViewV2Query.mockImplementation((options: any) => ({
        data: {viewV2: byId[options?.variables?.viewId] ?? null},
        loading: false,
    }));
};

// Reads the store's authoritative "view not known yet" flag straight from the context.
const ResolvingProbe = () => {
    const {isViewResolving} = useContext(CurrentViewContext);

    return <div>resolving:{String(isViewResolving)}</div>;
};

// Reads both signals needed to catch the `INIT_DEFAULT_VIEW` vs. `isViewResolving` race: whether the
// synthetic empty draft has been seeded into the reducer, and whether resolution is still in flight.
const DraftProbe = () => {
    const {view, isViewResolving} = useContext(CurrentViewContext);

    return (
        <div>
            resolving:{String(isViewResolving)} draft:{String(view?.id === DEFAULT_DRAFT_VIEW_ID)}
        </div>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseLastUsedView.mockReturnValue({lastUsedViewId: undefined, loading: false, saveLastUsedView: vi.fn()});
    mockUseCanManageViews.mockReturnValue(false);
    mockViewV2ById({'view-1': makeView()});
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

    describe('last-used view resolution', () => {
        const lastUsedView = makeView({
            id: 'view-last',
            display: {
                type: ViewV2Types.list,
                attributes: [{visible: true, attribute: {id: 'attribute_9', label: {fr: 'Attribut 9'}}}],
            },
        });

        it('loads the last-used view in priority over the configured view id', async () => {
            mockUseLastUsedView.mockReturnValue({lastUsedViewId: 'view-last', saveLastUsedView: vi.fn()});
            mockViewV2ById({'view-1': makeView(), 'view-last': lastUsedView});

            render(<Wrapper showVolet />);

            expect(await screen.findByTestId('col-attribute_9')).toHaveTextContent('visible');
            expect(screen.queryByTestId('col-attribute_2')).not.toBeInTheDocument();
        });

        it('falls back to the configured view id when the last-used id does not resolve, without flashing the empty state', async () => {
            mockUseLastUsedView.mockReturnValue({lastUsedViewId: 'view-last-gone', saveLastUsedView: vi.fn()});
            mockViewV2ById({'view-1': makeView()}); // 'view-last-gone' resolves to null (deleted/unshared)

            render(<Wrapper showVolet />);

            expect(screen.queryByText('empty-view')).not.toBeInTheDocument();
            expect(await screen.findByTestId('col-attribute_2')).toHaveTextContent('visible');
        });

        it('falls back to the configured view id when the last-used view belongs to another library', async () => {
            mockUseLastUsedView.mockReturnValue({lastUsedViewId: 'view-foreign', saveLastUsedView: vi.fn()});
            mockViewV2ById({
                'view-1': makeView({library: 'my_lib'}),
                'view-foreign': makeView({id: 'view-foreign', library: 'other_lib'}),
            });

            render(
                <CurrentViewStoreProvider viewId="view-1" displayedLibraryId="my_lib">
                    <VoletChild />
                </CurrentViewStoreProvider>,
            );

            expect(screen.queryByText('empty-view')).not.toBeInTheDocument();
            expect(await screen.findByTestId('col-attribute_2')).toHaveTextContent('visible');
        });

        it('falls back to the empty state when the last-used id does not resolve and no view id is configured', () => {
            mockUseLastUsedView.mockReturnValue({lastUsedViewId: 'view-last-gone', saveLastUsedView: vi.fn()});
            mockViewV2ById({}); // nothing resolves

            render(
                <CurrentViewStoreProvider viewId={undefined}>
                    <VoletChild />
                </CurrentViewStoreProvider>,
            );

            expect(screen.getByText('empty-view')).toBeInTheDocument();
        });
    });

    // `isViewResolving` is what stops the explorer from flashing its default (list) view before the real
    // view — e.g. a kanban — is known. It must cover BOTH async windows and clear once settled.
    describe('isViewResolving', () => {
        it('flags resolving while the targeted view content is loading', () => {
            mockUseGetViewV2Query.mockReturnValue({data: undefined, loading: true});

            render(
                <CurrentViewStoreProvider viewId="view-1">
                    <ResolvingProbe />
                </CurrentViewStoreProvider>,
            );

            expect(screen.getByText('resolving:true')).toBeInTheDocument();
        });

        it('flags resolving while the last-used-view lookup is in flight and no id is pinned (the regression)', () => {
            // No configured viewId, last-used-view query still loading: currentViewId is undefined so
            // isEmptyView reads true, but the view is NOT known yet — the explorer must wait, not fall back.
            mockUseLastUsedView.mockReturnValue({lastUsedViewId: undefined, loading: true, saveLastUsedView: vi.fn()});
            mockUseGetViewV2Query.mockReturnValue({data: undefined});

            render(
                <CurrentViewStoreProvider viewId={undefined}>
                    <ResolvingProbe />
                </CurrentViewStoreProvider>,
            );

            expect(screen.getByText('resolving:true')).toBeInTheDocument();
        });

        it('clears resolving once the view is fetched', () => {
            render(
                <CurrentViewStoreProvider viewId="view-1">
                    <ResolvingProbe />
                </CurrentViewStoreProvider>,
            );

            expect(screen.getByText('resolving:false')).toBeInTheDocument();
        });

        it('does not flag resolving in the settled empty state (no id, lookup done)', () => {
            mockUseGetViewV2Query.mockReturnValue({data: undefined});

            render(
                <CurrentViewStoreProvider viewId={undefined}>
                    <ResolvingProbe />
                </CurrentViewStoreProvider>,
            );

            expect(screen.getByText('resolving:false')).toBeInTheDocument();
        });
    });

    // Regression: `INIT_DEFAULT_VIEW` used to seed the synthetic empty draft off `isEmptyView` alone,
    // which reads `true` transiently while view resolution is still in flight (see the comment on
    // `isViewResolving` above) — flashing ExplorerV2 a defined-but-empty `currentView` (ADR-006) before
    // the real (last-used/configured) view has had a chance to resolve, firing its records/count queries
    // for nothing. Only a `manage_views` user reaches this path (`INIT_DEFAULT_VIEW`'s other guard).
    describe('INIT_DEFAULT_VIEW vs. isViewResolving (the regression)', () => {
        it('does not seed the empty draft while resolution is still in flight, only once it genuinely settles empty', async () => {
            mockUseCanManageViews.mockReturnValue(true);
            mockUseLastUsedView.mockReturnValue({lastUsedViewId: undefined, loading: true, saveLastUsedView: vi.fn()});
            mockUseGetViewV2Query.mockReturnValue({data: undefined});

            const {rerender} = render(
                <CurrentViewStoreProvider viewId={undefined} displayedLibraryId="my_lib">
                    <DraftProbe />
                </CurrentViewStoreProvider>,
            );

            // Last-used-view lookup still in flight, no id pinned: `isEmptyView` already reads `true`,
            // but the draft must NOT be seeded until resolution actually settles.
            expect(screen.getByText('resolving:true draft:false')).toBeInTheDocument();

            // Resolution settles on "nothing pinned" (no last-used view, no configured id): NOW the
            // draft may be seeded.
            mockUseLastUsedView.mockReturnValue({lastUsedViewId: undefined, loading: false, saveLastUsedView: vi.fn()});
            rerender(
                <CurrentViewStoreProvider viewId={undefined} displayedLibraryId="my_lib">
                    <DraftProbe />
                </CurrentViewStoreProvider>,
            );

            expect(await screen.findByText('resolving:false draft:true')).toBeInTheDocument();
        });
    });
});
