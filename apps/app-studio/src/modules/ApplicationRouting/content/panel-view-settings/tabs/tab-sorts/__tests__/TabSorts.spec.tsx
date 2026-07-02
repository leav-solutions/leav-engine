import {useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {act, render, screen, within} from '_ui/_tests/testUtils';
import {CurrentViewContext} from '../../../store-current-view/CurrentViewContext';
import {currentViewReducer} from '../../../store-current-view/currentViewReducer';
import {type CurrentViewSort} from '../../../store-current-view/_types';
import {TabSorts} from '../TabSorts';
import {SortOrder, ViewV2Types} from '../../../../../../../__generated__';

const makeSort = (id: string, label: string, pinned: boolean): CurrentViewSort => ({
    attributes: [{id, label: {fr: label, en: label}}],
    order: SortOrder.asc,
    pinned,
});

// Two pinned sorts (kept in view order) and two unpinned ones (sorted alphabetically by label).
const SEEDED_SORTS: CurrentViewSort[] = [
    makeSort('sort_a', 'Sort A', true),
    makeSort('sort_b', 'Sort B', true),
    makeSort('sort_c', 'Sort C', false),
    makeSort('sort_d', 'Sort D', false),
];

// Reducer-backed provider so toggling the pin dispatches real actions and re-renders.
const TabSortsWithState = ({sorts = SEEDED_SORTS}: {sorts?: CurrentViewSort[]}) => {
    const seed = {
        id: 'view-1',
        library: 'my_lib',
        label: {en: 'Test view'},
        shared: false,
        created_by: {id: '123', whoAmI: {id: '123', label: 'Me'}},
        display: {type: ViewV2Types.list, attributes: []},
        sorts,
        filters: [],
        shortcuts: [],
    };
    const [state, dispatch] = useReducer(currentViewReducer, {view: seed, savedView: seed});
    return (
        <CurrentViewContext.Provider value={{...state, isEmptyView: false, canManageViews: false, dispatch}}>
            <TabSorts />
        </CurrentViewContext.Provider>
    );
};

describe('TabSorts', () => {
    const user = userEvent.setup();

    // The sorts tab renders exactly two lists, in DOM order: pinned sorts then unpinned sorts.
    const getPinnedList = () => screen.getAllByRole('list')[0];
    const getUnpinnedList = () => screen.getAllByRole('list')[1];
    const getItemByLabel = (list: HTMLElement, label: string) =>
        within(list).getByText(label).closest('li') as HTMLElement;

    it('renders the empty state when there is no sort', () => {
        render(<TabSortsWithState sorts={[]} />);

        expect(screen.getByText('explorer.sorts-empty')).toBeInTheDocument();
        expect(screen.queryAllByRole('list')).toHaveLength(0);
    });

    it('splits pinned sorts (top) from unpinned sorts (bottom)', () => {
        render(<TabSortsWithState />);

        expect(within(getPinnedList()).getByText('Sort A')).toBeInTheDocument();
        expect(within(getPinnedList()).getByText('Sort B')).toBeInTheDocument();
        expect(within(getUnpinnedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getUnpinnedList()).getByText('Sort D')).toBeInTheDocument();
    });

    it('moves a sort between the unpinned and pinned lists when toggling the pin', async () => {
        render(<TabSortsWithState />);

        expect(within(getUnpinnedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getPinnedList()).queryByText('Sort C')).not.toBeInTheDocument();

        // Pin "Sort C" → it moves to the top list.
        await act(async () => {
            await user.click(
                within(getItemByLabel(getUnpinnedList(), 'Sort C')).getByLabelText('view_settings.sorts.pin'),
            );
        });
        expect(within(getPinnedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getUnpinnedList()).queryByText('Sort C')).not.toBeInTheDocument();

        // Unpin it again → it moves back to the bottom list.
        await act(async () => {
            await user.click(
                within(getItemByLabel(getPinnedList(), 'Sort C')).getByLabelText('view_settings.sorts.unpin'),
            );
        });
        expect(within(getUnpinnedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getPinnedList()).queryByText('Sort C')).not.toBeInTheDocument();
    });
});
