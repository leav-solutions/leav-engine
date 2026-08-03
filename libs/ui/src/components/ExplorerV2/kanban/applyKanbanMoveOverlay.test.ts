import {type IItemData} from '../_types';
import {type IKanbanColumn} from '../grouping/_types';
import {applyKanbanMoveOverlay, pruneReconciledMoves} from './applyKanbanMoveOverlay';

const card = (itemId: string): IItemData => ({itemId, key: itemId}) as unknown as IItemData;

const column = (id: string, cards: IItemData[]): IKanbanColumn => ({
    id,
    nodeId: `node-${id}`,
    label: id,
    color: null,
    cards,
    count: cards.length,
    isLoadingMore: false,
});

const cardIds = (col: IKanbanColumn) => col.cards.map(c => c.itemId);

describe('applyKanbanMoveOverlay', () => {
    it('moves an optimistically saved card into its target column', () => {
        const columns = [column('draft', [card('a'), card('b')]), column('review', [card('c')])];

        const overlaid = applyKanbanMoveOverlay(columns, new Map([['a', 'review']]));

        expect(cardIds(overlaid[0])).toEqual(['b']);
        expect(cardIds(overlaid[1])).toEqual(['c', 'a']);
    });

    it('appends the moved card at the end of the target column', () => {
        const columns = [column('draft', [card('a')]), column('review', [card('b'), card('c')])];

        const overlaid = applyKanbanMoveOverlay(columns, new Map([['a', 'review']]));

        expect(cardIds(overlaid[1])).toEqual(['b', 'c', 'a']);
    });

    it('returns the columns untouched when there is no pending move', () => {
        const columns = [column('draft', [card('a')]), column('review', [])];

        expect(applyKanbanMoveOverlay(columns, new Map())).toBe(columns);
    });
});

describe('pruneReconciledMoves', () => {
    it('drops a move once fresh data already places the card in its target column', () => {
        const columns = [column('draft', []), column('review', [card('a')])];

        const pruned = pruneReconciledMoves(columns, new Map([['a', 'review']]));

        expect(pruned.size).toBe(0);
    });

    it('drops a move whose card left the filtered data set', () => {
        const columns = [column('draft', []), column('review', [])];

        const pruned = pruneReconciledMoves(columns, new Map([['a', 'review']]));

        expect(pruned.size).toBe(0);
    });

    it('keeps a move still awaiting fresh data', () => {
        const columns = [column('draft', [card('a')]), column('review', [])];

        const pruned = pruneReconciledMoves(columns, new Map([['a', 'review']]));

        expect(pruned.get('a')).toBe('review');
    });
});
