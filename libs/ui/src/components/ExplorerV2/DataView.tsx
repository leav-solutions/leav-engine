import {ViewV2Types} from '_ui/_gqlTypes';
import {type IDataViewChildProps} from './_types';
import {type IKanbanColumnsData} from './kanban/_types';
import {type IColumnSplit} from './column-split/_types';
import {type ViewType} from './manage-view-settings-v2';
import {TableView} from './table/TableView';
import {KanbanView} from './kanban/KanbanView';

type IDataViewProps = IDataViewChildProps & {
    viewType: ViewType;
    groupByAttributeId?: string;
    kanbanColumns?: IKanbanColumnsData;
    columnSplit: IColumnSplit;
};

/**
 * Display-mode router. It owns the `viewType` switch and forwards the shared {@link IDataViewChildProps}
 * to the matching renderer, plus each mode's own props (`kanbanColumns` for the board, `columnSplit` for
 * the table). `list`/`cards`/`timeline` all render as the table today (no dedicated rendering yet);
 * `kanban` gets its own board. Adding a mode means adding a branch here, not touching the call site in
 * `Explorer.tsx`.
 */
export const DataView = ({viewType, groupByAttributeId, kanbanColumns, columnSplit, ...childProps}: IDataViewProps) => {
    if (viewType === ViewV2Types.kanban) {
        return <KanbanView {...childProps} groupByAttributeId={groupByAttributeId} kanbanColumns={kanbanColumns} />;
    }

    return <TableView {...childProps} columnSplit={columnSplit} />;
};
