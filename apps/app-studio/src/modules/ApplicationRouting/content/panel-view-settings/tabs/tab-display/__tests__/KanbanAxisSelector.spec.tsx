import {useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {render, screen} from '_ui/_tests/testUtils';
import {AttributeType, ViewV2Types} from '../../../../../../../__generated__';
import {CurrentViewContext} from '../../../store-current-view/CurrentViewContext';
import {currentViewReducer} from '../../../store-current-view/currentViewReducer';
import {useCurrentView} from '../../../store-current-view/useCurrentView';
import {KanbanAxisSelector} from '../KanbanAxisSelector';

// The library attributes are fetched through the generated Apollo hook; mocking it (instead of a
// MockedProvider response) keeps the spec focused on the selector's own logic: eligibility
// filtering, options building, and the axis selection/clear round-trip through the store.
const mockUseGetViewSettingsLibraryAttributesQuery = vi.fn();
vi.mock('../../../../../../../__generated__', async () => ({
    ...(await vi.importActual('../../../../../../../__generated__')),
    useGetViewSettingsLibraryAttributesQuery: (...args: unknown[]) =>
        mockUseGetViewSettingsLibraryAttributesQuery(...args),
}));

interface IFakeAttribute {
    id: string;
    type: AttributeType;
    label: Record<string, string>;
    values_list?: {enable: boolean; allowFreeEntry: boolean};
}

const treeAttribute: IFakeAttribute = {id: 'status', type: AttributeType.tree, label: {fr: 'Statut', en: 'Statut'}};
const closedListAttribute: IFakeAttribute = {
    id: 'category',
    type: AttributeType.simple,
    label: {fr: 'Catégorie', en: 'Catégorie'},
    values_list: {enable: true, allowFreeEntry: false},
};
const freeEntryListAttribute: IFakeAttribute = {
    id: 'tags',
    type: AttributeType.simple,
    label: {fr: 'Tags', en: 'Tags'},
    values_list: {enable: true, allowFreeEntry: true},
};
const plainAttribute: IFakeAttribute = {id: 'name', type: AttributeType.simple, label: {fr: 'Nom', en: 'Nom'}};

const mockLibraryAttributes = (attributes: IFakeAttribute[]) => {
    mockUseGetViewSettingsLibraryAttributesQuery.mockReturnValue({
        data: {libraries: {list: [{id: 'my_lib', label: null, attributes}]}},
        loading: false,
    });
};

// Reads the axis the store currently holds, so the tests assert the real reducer round-trip
// (SET_GROUP_BY_ATTRIBUTE → isGroupBy marker → groupByAttributeId) and not just the select's UI.
const AxisProbe = () => {
    const {groupByAttributeId} = useCurrentView();

    return <div data-testid="axis-probe">{groupByAttributeId ?? 'no-axis'}</div>;
};

// Reducer-backed provider (same pattern as TabDisplay.spec) so selecting an axis dispatches real
// store actions and re-renders.
const SelectorWithStore = () => {
    const seed = {
        id: 'view-1',
        library: 'my_lib',
        label: {en: 'Test view'},
        shared: false,
        created_by: {id: '123', whoAmI: {id: '123', label: 'Me'}},
        display: {type: ViewV2Types.kanban, attributes: []},
        sorts: [],
        filters: [],
        shortcuts: [],
    };
    const [state, dispatch] = useReducer(currentViewReducer, {view: seed, savedView: seed});

    return (
        <CurrentViewContext.Provider value={{...state, isEmptyView: false, canManageViews: false, dispatch}}>
            <KanbanAxisSelector />
            <AxisProbe />
        </CurrentViewContext.Provider>
    );
};

describe('KanbanAxisSelector', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('offers only the tree attributes (phase 1: the board cannot group on a values list yet)', async () => {
        // GIVEN a library mixing a tree attribute and non-tree ones (closed list included: eligible for
        // grouping in general per ADR-011, but not implemented by the kanban board before LEAVC-1076)
        mockLibraryAttributes([treeAttribute, closedListAttribute, freeEntryListAttribute, plainAttribute]);
        render(<SelectorWithStore />);

        // WHEN the axis select is opened
        await user.click(screen.getByRole('combobox'));

        // THEN only the tree attribute is offered
        expect(screen.getByText('Statut')).toBeInTheDocument();
        expect(screen.queryByText('Catégorie')).not.toBeInTheDocument();
        expect(screen.queryByText('Tags')).not.toBeInTheDocument();
        expect(screen.queryByText('Nom')).not.toBeInTheDocument();
    });

    it('shows the no-eligible message instead of the select when no attribute qualifies', () => {
        // GIVEN a library with no tree attribute at all (a closed values list is not enough in phase 1)
        mockLibraryAttributes([closedListAttribute, freeEntryListAttribute, plainAttribute]);

        render(<SelectorWithStore />);

        expect(screen.getByText('view_settings.display.axis.no_eligible')).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('sets the grouping axis on selection and clears it with the clear control', async () => {
        // GIVEN eligible attributes and a view without an axis yet
        mockLibraryAttributes([treeAttribute, closedListAttribute]);
        render(<SelectorWithStore />);
        expect(screen.getByTestId('axis-probe')).toHaveTextContent('no-axis');

        // WHEN an attribute is picked as the axis
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getAllByText('Statut').pop() as HTMLElement);

        // THEN the store carries the isGroupBy marker for it
        expect(screen.getByTestId('axis-probe')).toHaveTextContent('status');

        // WHEN the selection is cleared (allowClear)
        await user.click(screen.getByLabelText('clear'));

        // THEN the store has no grouping axis any more
        expect(screen.getByTestId('axis-probe')).toHaveTextContent('no-axis');
    });
});
