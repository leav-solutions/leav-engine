import {NO_AXIS_VALUE_COLUMN_ID} from '../grouping/buildKanbanColumns';
import {type IKanbanAxisNode, type IKanbanColumn} from '../grouping/_types';
import {type IKanbanColumnState, type KanbanColumnsState} from './kanbanColumnsReducer';

const emptyColumnState: IKanbanColumnState = {cards: [], count: 0, isLoadingMore: false};

/**
 * Assembles the kanban columns on the per-column path: the column set is the axis nodes (every node
 * gets its column, even before its state is loaded), fed with the reducer-owned cards and counts.
 * The "no value" column leads, only when the counts revealed records without an axis value.
 */
export const assembleKanbanColumns = ({
    axisNodes,
    columnStatesById,
    noValueLabel,
}: {
    axisNodes: IKanbanAxisNode[];
    columnStatesById: KanbanColumnsState;
    noValueLabel: string;
}): IKanbanColumn[] => {
    const axisColumns: IKanbanColumn[] = axisNodes.map(node => ({
        id: node.recordId,
        nodeId: node.nodeId,
        label: node.label,
        color: node.color,
        ...(columnStatesById[node.recordId] ?? emptyColumnState),
    }));

    const noValueState = columnStatesById[NO_AXIS_VALUE_COLUMN_ID];

    return noValueState && noValueState.count > 0
        ? [
              {id: NO_AXIS_VALUE_COLUMN_ID, nodeId: null, label: noValueLabel, color: null, ...noValueState},
              ...axisColumns,
          ]
        : axisColumns;
};
