import {render, screen} from '_ui/_tests/testUtils';
import {type IKanbanColumn} from '../grouping/_types';
import {KanbanColumn} from './KanbanColumn';

const emptyColumn: IKanbanColumn = {
    id: 'draft',
    nodeId: 'node-draft',
    label: 'Draft',
    color: null,
    cards: [],
    count: 0,
    isLoadingMore: false,
};

const renderCard = () => null;

describe('KanbanColumn', () => {
    it('shows the empty label on a settled empty column', () => {
        // GIVEN a column the fresh counts declared truly empty (count 0, board not reloading)
        render(<KanbanColumn column={emptyColumn} renderCard={renderCard} isDropDisabled={false} />);

        expect(screen.getByText('explorer.kanban.empty-column')).toBeInTheDocument();
    });

    it('does not claim the column is empty while the whole board is reloading', () => {
        // GIVEN a board reload in flight: the column state was wiped, so its count 0 means
        // "not known yet", not "no records"
        render(<KanbanColumn column={emptyColumn} renderCard={renderCard} isDropDisabled={false} isBoardReloading />);

        // the empty label must not flash during the reload window (a delayed loader shows instead)
        expect(screen.queryByText('explorer.kanban.empty-column')).not.toBeInTheDocument();
    });
});
