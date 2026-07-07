import {type ReactNode, useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {act, render, screen, within} from '_ui/_tests/testUtils';
import {PanelMessengerContext} from '_ui/hooks/usePanelMessenger/panelMessengerContext';
import {CurrentViewContext} from '../../../store-current-view/CurrentViewContext';
import {currentViewReducer} from '../../../store-current-view/currentViewReducer';
import {type CurrentViewColumn} from '../../../store-current-view/_types';
import {TabDisplay} from '../TabDisplay';
import {ViewV2Types} from '../../../../../../../__generated__';

// All seeded columns start hidden, mirroring the previous fake "Attribut 2..7" setup.
const SEEDED_COLUMNS: CurrentViewColumn[] = [
    {visible: false, attribute: {id: 'attribute_2', label: {fr: 'Attribut 2', en: 'Attribut 2'}}},
    {visible: false, attribute: {id: 'attribute_3', label: {fr: 'Attribut 3', en: 'Attribut 3'}}},
    {visible: false, attribute: {id: 'attribute_5', label: {fr: 'Attribut 5', en: 'Attribut 5'}}},
];

// TabDisplay calls `usePanelIFrameHandlers` unconditionally (for the delegated-iframe sync), which
// reads `PanelMessengerContext`. Provide a minimal stub so the hook mounts; `registerHandlers` must
// return a cleanup fn (it is used as a useEffect teardown).
const messengerStub = {
    registerHandlers: () => () => undefined,
    registerNativePanelHandlers: () => () => undefined,
    dispatchToNativePanel: () => undefined,
    changeLangInAllFrames: () => undefined,
    addInternalEventHandler: () => () => undefined,
    dispatchToSelf: () => undefined,
} as unknown as React.ContextType<typeof PanelMessengerContext>;

const WithMessenger = ({children}: {children: ReactNode}) => (
    <PanelMessengerContext.Provider value={messengerStub}>{children}</PanelMessengerContext.Provider>
);

// Reducer-backed provider so toggling the eye dispatches real actions and re-renders.
const TabDisplayWithState = ({
    columns = SEEDED_COLUMNS,
    canManageViews = false,
}: {
    columns?: CurrentViewColumn[];
    canManageViews?: boolean;
}) => {
    const seed = {
        id: 'view-1',
        library: 'my_lib',
        label: {en: 'Test view'},
        shared: false,
        created_by: {id: '123', whoAmI: {id: '123', label: 'Me'}},
        display: {type: ViewV2Types.list, attributes: columns},
        sorts: [],
        filters: [],
        shortcuts: [],
    };
    const [state, dispatch] = useReducer(currentViewReducer, {view: seed, savedView: seed});
    return (
        <WithMessenger>
            <CurrentViewContext.Provider value={{...state, isEmptyView: false, canManageViews, dispatch}}>
                <TabDisplay />
            </CurrentViewContext.Provider>
        </WithMessenger>
    );
};

describe('TabDisplay', () => {
    const user = userEvent.setup();

    // The manage_views permission (canManageViews in the current-view context) gates the "available
    // attributes" gear inside ColumnsSettings.
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // The display tab renders exactly two lists, in DOM order: visible columns then hidden columns.
    const getVisibleList = () => screen.getAllByRole('list')[0];
    const getInvisibleList = () => screen.getAllByRole('list')[1];
    const getItemByLabel = (list: HTMLElement, label: RegExp | string) =>
        within(list).getByText(label).closest('li') as HTMLElement;
    // A draggable item exposes two role="button" elements (the dnd-kit drag handle + the eye toggle).
    // The eye toggle is the only real <button> element.
    const getEyeButton = (item: HTMLElement) =>
        within(item)
            .getAllByRole('button')
            .find(button => button.tagName === 'BUTTON') as HTMLElement;

    it('renders the display modes and only the locked identity column in the empty (default) view state', () => {
        // Empty state = no view in the store (null). The tab no longer shows a KitEmpty placeholder:
        // the (hardcoded) display modes and the locked identity column are always rendered.
        render(
            <WithMessenger>
                <CurrentViewContext.Provider
                    value={{view: null, savedView: null, isEmptyView: true, canManageViews: false, dispatch: vi.fn()}}
                >
                    <TabDisplay />
                </CurrentViewContext.Provider>
            </WithMessenger>,
        );

        expect(screen.queryByText('view_settings.empty_view')).not.toBeInTheDocument();
        expect(screen.getAllByRole('checkbox')).toHaveLength(2);

        const visibleItems = within(getVisibleList()).getAllByRole('listitem');
        expect(visibleItems).toHaveLength(1);
        expect(within(getVisibleList()).getByText(/columns\.identity$/)).toBeInTheDocument();
    });

    it('shows the "manage available attributes" gear only with the manage_views permission', () => {
        const gearLabel = 'view_settings.display.columns.manage_available';

        const {rerender} = render(<TabDisplayWithState canManageViews={false} />);
        expect(screen.queryByLabelText(gearLabel)).not.toBeInTheDocument();

        rerender(<TabDisplayWithState canManageViews />);
        expect(screen.getByLabelText(gearLabel)).toBeInTheDocument();
    });

    it('renders two display modes (table + kanban) with the current type selected', () => {
        // The seeded view type is `list`, rendered by the table tile.
        render(<TabDisplayWithState />);

        const tiles = screen.getAllByRole('checkbox');
        expect(tiles).toHaveLength(2);

        const checkedTiles = tiles.filter(tile => tile.getAttribute('aria-checked') === 'true');

        expect(checkedTiles).toHaveLength(1); // Table (list)
        expect(screen.getByText('view_settings.display.mode.table')).toBeInTheDocument();
        expect(screen.getByText('view_settings.display.mode.kanban')).toBeInTheDocument();
    });

    it('shows the locked identity column first, always visible and non-toggleable', () => {
        render(<TabDisplayWithState />);

        const visibleItems = within(getVisibleList()).getAllByRole('listitem');
        // Only the identity column is visible initially.
        expect(visibleItems).toHaveLength(1);

        const identityItem = getItemByLabel(getVisibleList(), /columns\.identity$/);
        expect(within(identityItem).getByRole('button')).toBeDisabled();
    });

    it('moves an attribute between the invisible and visible lists when toggling the eye', async () => {
        render(<TabDisplayWithState />);

        // Initially: identity is visible, the seeded attributes are invisible.
        expect(within(getInvisibleList()).getByText('Attribut 2')).toBeInTheDocument();
        expect(within(getVisibleList()).queryByText('Attribut 2')).not.toBeInTheDocument();

        // Show "Attribut 2" → it moves to the top list.
        await act(async () => {
            await user.click(getEyeButton(getItemByLabel(getInvisibleList(), 'Attribut 2')));
        });
        expect(within(getVisibleList()).getByText('Attribut 2')).toBeInTheDocument();
        expect(within(getInvisibleList()).queryByText('Attribut 2')).not.toBeInTheDocument();

        // Hide it again → it moves back to the bottom list.
        await act(async () => {
            await user.click(getEyeButton(getItemByLabel(getVisibleList(), 'Attribut 2')));
        });
        expect(within(getInvisibleList()).getByText('Attribut 2')).toBeInTheDocument();
        expect(within(getVisibleList()).queryByText('Attribut 2')).not.toBeInTheDocument();
    });

    it('filters the columns with the search input', async () => {
        render(<TabDisplayWithState />);

        await act(async () => {
            await user.type(screen.getByRole('textbox'), 'Attribut 5');
        });

        expect(within(getInvisibleList()).getByText('Attribut 5')).toBeInTheDocument();
        expect(within(getInvisibleList()).queryByText('Attribut 2')).not.toBeInTheDocument();
        // The locked identity column stays visible regardless of the search.
        expect(within(getVisibleList()).getByText(/columns\.identity$/)).toBeInTheDocument();
    });
});
