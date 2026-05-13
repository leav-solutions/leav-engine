import {type GET_TASKS_tasks_list} from '../_gqlTypes/GET_TASKS';
import {type TREE_NODE_CHILDREN_treeNodeChildren_list} from '../_gqlTypes/TREE_NODE_CHILDREN';
import {type IBaseInfo, type IInfo, type ISharedStateSelectionSearch, type SharedStateSelection} from '../_types/types';

export interface ISelectionState {
    selection: SharedStateSelection;
    searchSelection: ISharedStateSelectionSearch;
}

export interface INavigationElement extends TREE_NODE_CHILDREN_treeNodeChildren_list {
    showDetails?: boolean;
}

export interface INavigationState {
    activeTree: string;
    path: INavigationElement[];
}

export interface ITasksState {
    tasks: {[taskId: string]: GET_TASKS_tasks_list};
}

export interface INotificationsState {
    isPanelOpen: boolean;
}

export interface IInfosState {
    base?: IBaseInfo;
    stack: IInfo[];
}
