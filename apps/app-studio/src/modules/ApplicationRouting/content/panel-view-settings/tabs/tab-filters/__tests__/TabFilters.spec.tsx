import {useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {FiltersActionTypes, FiltersContext, type IUIFiltersState, type UIFilter} from '@leav/ui';
import {act, render, screen, within} from '_ui/_tests/testUtils';
import {CurrentViewContext} from '../../../store-current-view/CurrentViewContext';
import {currentViewReducer} from '../../../store-current-view/currentViewReducer';
import {type CurrentViewFilter} from '../../../store-current-view/_types';
import {RecordFilterCondition, ViewV2Types} from '../../../../../../../__generated__';
import {TabFilters} from '../TabFilters';

// Minimal stub of the @leav/ui filter editor: renders the store filter and dispatches a config change
// to the (real) FiltersContext, so we can assert pinned filters are edited through the SHARED store.
jest.mock('@leav/ui', () => {
    const actual = jest.requireActual('@leav/ui');
    const {useContext} = jest.requireActual('react');

    return {
        ...actual,
        CommonFilterItem: ({filter}: {filter: {id: string; condition: unknown; value: unknown}}) => {
            const {dispatch} = useContext(actual.FiltersContext);
            return (
                <button
                    aria-label={`edit-${filter.id}`}
                    onClick={() =>
                        dispatch({
                            type: actual.FiltersActionTypes.CHANGE_FILTER_CONFIG,
                            payload: {...filter, condition: 'CONTAINS', value: 'paris'},
                        })
                    }
                >
                    {String(filter.condition)}::{String(filter.value)}
                </button>
            );
        },
    };
});

const makeFilter = (id: string, label: string, pinned: boolean): CurrentViewFilter => ({
    attributes: [{id, label: {fr: label, en: label}}],
    condition: RecordFilterCondition.EQUAL,
    values: [],
    pinned,
});

const SEEDED_FILTERS: CurrentViewFilter[] = [
    makeFilter('filter_a', 'Filter A', true),
    makeFilter('filter_b', 'Filter B', true),
    makeFilter('filter_c', 'Filter C', false),
    makeFilter('filter_d', 'Filter D', false),
];

// UIFilters as they live in the shared store (id = attribute path), for the pinned filters only.
const makeStoreFilter = (id: string): UIFilter =>
    ({
        id,
        field: id,
        attribute: {id, label: id, type: 'simple'},
        condition: RecordFilterCondition.EQUAL,
        value: null,
    }) as unknown as UIFilter;

const mockDispatch = jest.fn();

const TabFiltersWithState = ({filters = SEEDED_FILTERS}: {filters?: CurrentViewFilter[]}) => {
    const seed = {
        id: 'view-1',
        library: 'my_lib',
        label: {en: 'Test view'},
        shared: false,
        created_by: {id: '123', whoAmI: {id: '123', label: 'Me'}},
        display: {type: ViewV2Types.list, attributes: []},
        sorts: [],
        filters,
        shortcuts: [],
    };
    const [state, dispatch] = useReducer(currentViewReducer, {view: seed, savedView: seed});

    const filtersData = {
        filters: filters.filter(f => f.pinned).map(f => makeStoreFilter(f.attributes[0].id)),
        filtersOperator: 'AND',
        attributesDataById: {},
    } as unknown as IUIFiltersState;

    return (
        <CurrentViewContext.Provider value={{...state, isEmptyView: false, canManageViews: false, dispatch}}>
            <FiltersContext.Provider value={{filtersData, dispatch: mockDispatch}}>
                <TabFilters />
            </FiltersContext.Provider>
        </CurrentViewContext.Provider>
    );
};

describe('TabFilters', () => {
    const user = userEvent.setup();
    beforeEach(() => mockDispatch.mockClear());

    const getPinnedList = () => screen.getAllByRole('list')[0];
    const getUnpinnedList = () => screen.getAllByRole('list')[1];

    it('renders the empty state when there is no filter', () => {
        render(<TabFiltersWithState filters={[]} />);

        expect(screen.getByText('explorer.filters-empty')).toBeInTheDocument();
        expect(screen.queryAllByRole('list')).toHaveLength(0);
    });

    it('renders pinned filters with the shared-store editor, unpinned ones read-only', () => {
        render(<TabFiltersWithState />);

        // Pinned → editable (CommonFilterItem from the shared store).
        expect(within(getPinnedList()).getByLabelText('edit-filter_a')).toBeInTheDocument();
        expect(within(getPinnedList()).getByLabelText('edit-filter_b')).toBeInTheDocument();
        // Unpinned → read-only label, NOT the editor.
        expect(screen.queryByLabelText('edit-filter_c')).not.toBeInTheDocument();
        expect(within(getUnpinnedList()).getByText('Filter C')).toBeInTheDocument();
        expect(within(getUnpinnedList()).getByText('Filter D')).toBeInTheDocument();
    });

    it('moves a filter between the lists when toggling the pin', async () => {
        render(<TabFiltersWithState />);

        await act(async () => {
            await user.click(
                within(within(getUnpinnedList()).getByText('Filter C').closest('li') as HTMLElement).getByLabelText(
                    'view_settings.filters.pin',
                ),
            );
        });

        // 'Filter C' is now pinned → its read-only label leaves the unpinned list.
        expect(within(getUnpinnedList()).queryByText('Filter C')).not.toBeInTheDocument();
    });

    it('filters both lists by the search input', async () => {
        render(<TabFiltersWithState />);

        await act(async () => {
            await user.type(screen.getByPlaceholderText('view_settings.filters.search_placeholder'), 'Filter A');
        });

        expect(screen.getByLabelText('edit-filter_a')).toBeInTheDocument();
        expect(screen.queryByLabelText('edit-filter_b')).not.toBeInTheDocument();
        expect(screen.queryByText('Filter C')).not.toBeInTheDocument();
    });

    it('edits a pinned filter value through the shared FiltersContext', async () => {
        render(<TabFiltersWithState />);

        await act(async () => {
            await user.click(screen.getByLabelText('edit-filter_a'));
        });

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({type: FiltersActionTypes.CHANGE_FILTER_CONFIG}),
        );
    });
});
