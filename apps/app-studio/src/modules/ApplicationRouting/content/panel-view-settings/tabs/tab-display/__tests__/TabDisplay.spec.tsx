import {useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {act, render, screen, within} from '_ui/_tests/testUtils';
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

// Reducer-backed provider so toggling the eye dispatches real actions and re-renders.
const TabDisplayWithState = ({columns = SEEDED_COLUMNS}: {columns?: CurrentViewColumn[]}) => {
    const [view, dispatch] = useReducer(currentViewReducer, {
        id: 'view-1',
        label: {en: 'Test view'},
        shared: false,
        display: {type: ViewV2Types.list, attributes: columns},
    });
    return (
        <CurrentViewContext.Provider value={{view, dispatch}}>
            <TabDisplay canEditAdminView={false} />
        </CurrentViewContext.Provider>
    );
};

describe('TabDisplay', () => {
    const user = userEvent.setup();

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

    it('renders three display modes: one selected, the two others disabled', () => {
        render(<TabDisplayWithState />);

        const tiles = screen.getAllByRole('checkbox');
        expect(tiles).toHaveLength(3);

        const checkedTiles = tiles.filter(tile => tile.getAttribute('aria-checked') === 'true');
        const disabledTiles = tiles.filter(tile => (tile as HTMLButtonElement).disabled);

        expect(checkedTiles).toHaveLength(1); // Table
        expect(disabledTiles).toHaveLength(2); // List + Mosaic
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
