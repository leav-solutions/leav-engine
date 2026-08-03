import {assembleKanbanColumns} from './assembleKanbanColumns';
import {NO_AXIS_VALUE_COLUMN_ID} from '../grouping/buildKanbanColumns';
import {type IKanbanAxisNode} from '../grouping/_types';
import {type KanbanColumnsState} from './kanbanColumnsReducer';
import {type IItemData} from '../_types';

const card = (id: string): IItemData => ({itemId: id, key: id}) as IItemData;

const axisNodes: IKanbanAxisNode[] = [
    {recordId: 'draft', nodeId: 'node-draft', libraryId: 'statuses', label: 'Draft', color: '#aaa'},
    {recordId: 'validated', nodeId: 'node-validated', libraryId: 'statuses', label: 'Validated', color: null},
];

describe('assembleKanbanColumns', () => {
    it('renders one column per axis node, even without a loaded state', () => {
        const columns = assembleKanbanColumns({axisNodes, columnStatesById: {}, noValueLabel: 'No value'});

        expect(columns.map(column => column.id)).toEqual(['draft', 'validated']);
        expect(columns[0]).toEqual({
            id: 'draft',
            nodeId: 'node-draft',
            label: 'Draft',
            color: '#aaa',
            cards: [],
            count: 0,
            isLoadingMore: false,
        });
    });

    it('injects the loaded cards and counts into their column', () => {
        const columnStatesById: KanbanColumnsState = {
            draft: {cards: [card('a'), card('b')], count: 12, isLoadingMore: true},
        };

        const columns = assembleKanbanColumns({axisNodes, columnStatesById, noValueLabel: 'No value'});

        expect(columns[0].cards.map(c => c.itemId)).toEqual(['a', 'b']);
        expect(columns[0].count).toBe(12);
        expect(columns[0].isLoadingMore).toBe(true);
    });

    it('prepends the no-value column only when its count is positive', () => {
        const withNoValue = assembleKanbanColumns({
            axisNodes,
            columnStatesById: {[NO_AXIS_VALUE_COLUMN_ID]: {cards: [card('x')], count: 5, isLoadingMore: false}},
            noValueLabel: 'No value',
        });

        expect(withNoValue.map(column => column.id)).toEqual([NO_AXIS_VALUE_COLUMN_ID, 'draft', 'validated']);
        expect(withNoValue[0].label).toBe('No value');

        const withoutNoValue = assembleKanbanColumns({axisNodes, columnStatesById: {}, noValueLabel: 'No value'});
        expect(withoutNoValue.map(column => column.id)).toEqual(['draft', 'validated']);
    });
});
