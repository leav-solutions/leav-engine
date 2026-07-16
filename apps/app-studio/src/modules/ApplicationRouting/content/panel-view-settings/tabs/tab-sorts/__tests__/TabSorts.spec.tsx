import {useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {act, render, screen, within} from '_ui/_tests/testUtils';
import {CurrentViewContext} from '../../../store-current-view/CurrentViewContext';
import {currentViewReducer} from '../../../store-current-view/currentViewReducer';
import {type CurrentViewSort} from '../../../store-current-view/_types';
import {TabSorts} from '../TabSorts';
import {SortOrder, ViewV2Types} from '../../../../../../../__generated__';

const makeSort = (id: string, label: string, activated: boolean): CurrentViewSort => ({
    attributes: [{id, label: {fr: label, en: label}}],
    order: SortOrder.asc,
    activated,
});

// Two activated sorts (kept in view order) and two deactivated ones (sorted alphabetically by label).
const SEEDED_SORTS: CurrentViewSort[] = [
    makeSort('sort_a', 'Sort A', true),
    makeSort('sort_b', 'Sort B', true),
    makeSort('sort_c', 'Sort C', false),
    makeSort('sort_d', 'Sort D', false),
];

// Reducer-backed provider so toggling the activation dispatches real actions and re-renders.
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

    // The sorts tab renders exactly two lists, in DOM order: activated sorts then deactivated sorts.
    const getActivatedList = () => screen.getAllByRole('list')[0];
    const getDeactivatedList = () => screen.getAllByRole('list')[1];
    const getItemByLabel = (list: HTMLElement, label: string) =>
        within(list).getByText(label).closest('li') as HTMLElement;

    it('renders the empty state when there is no sort', () => {
        render(<TabSortsWithState sorts={[]} />);

        expect(screen.getByText('explorer.sorts-empty')).toBeInTheDocument();
        expect(screen.queryAllByRole('list')).toHaveLength(0);
    });

    it('splits activated sorts (top) from deactivated sorts (bottom)', () => {
        render(<TabSortsWithState />);

        expect(within(getActivatedList()).getByText('Sort A')).toBeInTheDocument();
        expect(within(getActivatedList()).getByText('Sort B')).toBeInTheDocument();
        expect(within(getDeactivatedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getDeactivatedList()).getByText('Sort D')).toBeInTheDocument();
    });

    it('moves a sort between the deactivated and activated lists when toggling activation', async () => {
        render(<TabSortsWithState />);

        expect(within(getDeactivatedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getActivatedList()).queryByText('Sort C')).not.toBeInTheDocument();

        // Activate "Sort C" → it moves to the top list.
        await act(async () => {
            await user.click(
                within(getItemByLabel(getDeactivatedList(), 'Sort C')).getByLabelText('view_settings.sorts.activate'),
            );
        });
        expect(within(getActivatedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getDeactivatedList()).queryByText('Sort C')).not.toBeInTheDocument();

        // Deactivate it again → it moves back to the bottom list.
        await act(async () => {
            await user.click(
                within(getItemByLabel(getActivatedList(), 'Sort C')).getByLabelText('view_settings.sorts.deactivate'),
            );
        });
        expect(within(getDeactivatedList()).getByText('Sort C')).toBeInTheDocument();
        expect(within(getActivatedList()).queryByText('Sort C')).not.toBeInTheDocument();
    });
});
