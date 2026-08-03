import {NO_AXIS_VALUE_COLUMN_ID} from '../grouping/buildKanbanColumns';
import {type IKanbanColumn} from '../grouping/_types';
import {buildTransitionsMap} from './buildTransitionsMap';
import {getDroppableColumnIds} from './getDroppableColumnIds';

const column = (id: string, nodeId: string | null): IKanbanColumn => ({
    id,
    nodeId,
    label: id,
    color: null,
    cards: [],
    count: 0,
    isLoadingMore: false,
});

const noValueColumn = column(NO_AXIS_VALUE_COLUMN_ID, null);
const draft = column('draft', 'node-draft');
const review = column('review', 'node-review');
const validated = column('validated', 'node-validated');

describe('getDroppableColumnIds', () => {
    it('returns every other column when there is no workflow restriction', () => {
        const droppableIds = getDroppableColumnIds({
            columns: [draft, review, validated],
            sourceColumn: draft,
            transitionsByNodeId: null,
        });

        expect(droppableIds).toEqual(new Set(['review', 'validated']));
    });

    it('returns only the columns allowed from the source node', () => {
        const droppableIds = getDroppableColumnIds({
            columns: [draft, review, validated],
            sourceColumn: draft,
            transitionsByNodeId: buildTransitionsMap([
                {node: {id: 'node-draft'}, allowedDependentValues: [{nodeId: 'node-review'}]},
            ]),
        });

        expect(droppableIds).toEqual(new Set(['review']));
    });

    it('never includes the source column', () => {
        const droppableIds = getDroppableColumnIds({
            columns: [draft, review],
            sourceColumn: review,
            transitionsByNodeId: buildTransitionsMap([
                {node: {id: 'node-review'}, allowedDependentValues: [{nodeId: 'node-review'}, {nodeId: 'node-draft'}]},
            ]),
        });

        expect(droppableIds).toEqual(new Set(['draft']));
    });

    it('includes the no-value column when clearing is allowed', () => {
        const droppableIds = getDroppableColumnIds({
            columns: [noValueColumn, draft, review],
            sourceColumn: draft,
            transitionsByNodeId: buildTransitionsMap([
                {node: {id: 'node-draft'}, allowedDependentValues: [{nodeId: 'node-review'}, {nodeId: null}]},
            ]),
        });

        expect(droppableIds).toEqual(new Set([NO_AXIS_VALUE_COLUMN_ID, 'review']));
    });

    it('excludes the no-value column when clearing is not allowed', () => {
        const droppableIds = getDroppableColumnIds({
            columns: [noValueColumn, draft, review],
            sourceColumn: draft,
            transitionsByNodeId: buildTransitionsMap([
                {node: {id: 'node-draft'}, allowedDependentValues: [{nodeId: 'node-review'}]},
            ]),
        });

        expect(droppableIds).toEqual(new Set(['review']));
    });
});
