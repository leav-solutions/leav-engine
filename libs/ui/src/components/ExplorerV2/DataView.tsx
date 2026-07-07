import {type FunctionComponent} from 'react';
import {ViewV2Types} from '_ui/_gqlTypes';
import {type IDataViewChildProps} from './_types';
import {type ViewType} from './manage-view-settings-v2';
import {TableView} from './TableView';
import {KanbanView} from './KanbanView';

type IDataViewProps = IDataViewChildProps & {
    viewType: ViewType;
    groupByAttributeId?: string;
};

/**
 * Display-mode router. It owns the `viewType` switch and forwards the shared {@link IDataViewChildProps}
 * to the matching renderer. `list`/`cards`/`timeline` all render as the table today (no dedicated
 * rendering yet); `kanban` gets its own board. Adding a mode means adding a branch here, not touching
 * the call site in `Explorer.tsx`.
 */
export const DataView: FunctionComponent<IDataViewProps> = ({viewType, groupByAttributeId, ...childProps}) => {
    if (viewType === ViewV2Types.kanban) {
        return <KanbanView {...childProps} groupByAttributeId={groupByAttributeId} />;
    }

    return <TableView {...childProps} />;
};
