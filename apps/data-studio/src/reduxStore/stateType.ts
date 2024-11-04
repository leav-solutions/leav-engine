// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {IBaseInfo, IInfo, ISharedStateSelectionSearch, SharedStateSelection} from '_types/types';

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
