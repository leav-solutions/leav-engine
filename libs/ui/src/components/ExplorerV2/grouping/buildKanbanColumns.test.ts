import {buildKanbanColumns, NO_AXIS_VALUE_COLUMN_ID, type IKanbanAxisNode} from './buildKanbanColumns';
import {type IItemData} from '../_types';

const AXIS = 'status';

const axisNodes: IKanbanAxisNode[] = [
    {recordId: 'draft', label: 'Draft', color: '#aaa'},
    {recordId: 'validated', label: 'Validated', color: '#0f0'},
    {recordId: 'archived', label: 'Archived', color: null},
];

// Minimal card carrying just the axis tree value (only propertiesById is read by the helper).
const card = (id: string, axisRecordId: string | null): IItemData =>
    ({
        key: id,
        itemId: id,
        propertiesById: {
            [AXIS]: axisRecordId ? [{treePayload: {record: {id: axisRecordId, whoAmI: {id: axisRecordId}}}}] : [],
        },
    }) as unknown as IItemData;

const cardIds = (cards: IItemData[]) => cards.map(c => c.key);

describe('buildKanbanColumns', () => {
    it('distributes cards to the column matching their axis record id', () => {
        const columns = buildKanbanColumns({
            records: [card('a', 'draft'), card('b', 'validated'), card('c', 'draft')],
            groupByAttributeId: AXIS,
            axisNodes,
            noValueLabel: 'No value',
        });

        expect(columns.map(col => col.id)).toEqual(['draft', 'validated', 'archived']);
        expect(cardIds(columns[0].cards)).toEqual(['a', 'c']);
        expect(cardIds(columns[1].cards)).toEqual(['b']);
    });

    it('keeps an axis column with zero cards (empty columns are always shown)', () => {
        const columns = buildKanbanColumns({
            records: [card('a', 'draft')],
            groupByAttributeId: AXIS,
            axisNodes,
            noValueLabel: 'No value',
        });

        const archived = columns.find(col => col.id === 'archived');
        expect(archived).toBeDefined();
        expect(archived?.cards).toEqual([]);
    });

    it('gathers cards with no axis value into a leading "no value" column', () => {
        const columns = buildKanbanColumns({
            records: [card('a', null), card('b', 'validated')],
            groupByAttributeId: AXIS,
            axisNodes,
            noValueLabel: 'No value',
        });

        expect(columns[0].id).toBe(NO_AXIS_VALUE_COLUMN_ID);
        expect(columns[0].label).toBe('No value');
        expect(cardIds(columns[0].cards)).toEqual(['a']);
    });

    it('treats a value pointing to an unknown node as "no value"', () => {
        const columns = buildKanbanColumns({
            records: [card('a', 'deleted-node')],
            groupByAttributeId: AXIS,
            axisNodes,
            noValueLabel: 'No value',
        });

        expect(columns[0].id).toBe(NO_AXIS_VALUE_COLUMN_ID);
        expect(cardIds(columns[0].cards)).toEqual(['a']);
    });

    it('omits the "no value" column when every card has a matching value', () => {
        const columns = buildKanbanColumns({
            records: [card('a', 'draft'), card('b', 'validated')],
            groupByAttributeId: AXIS,
            axisNodes,
            noValueLabel: 'No value',
        });

        expect(columns.some(col => col.id === NO_AXIS_VALUE_COLUMN_ID)).toBe(false);
    });
});
