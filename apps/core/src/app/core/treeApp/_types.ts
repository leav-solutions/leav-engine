import {type ILibrary} from '../../../_types/library';
import {type IPaginationParams, type ISortParams} from '../../../_types/list';
import {type ITreePermissionsConf} from '../../../_types/permissions';
import {
    type ITree,
    type ITreeElement,
    type ITreeFilterOptions,
    type ITreeLibrarySettings,
    type TreeEventTypes,
} from '../../../_types/tree';

export interface ITreeLibraryForGraphQL {
    library: ILibrary;
    settings: ITreeLibrarySettings;
}

export interface ITreeLibraryInputFromGraphQL {
    library: string;
    settings: ITreeLibrarySettings;
}

export interface ITreePermissionsConfForGraphQL {
    libraryId: string;
    permissionsConf: ITreePermissionsConf;
}

export type TreeFromGraphQL = Omit<ITree, 'libraries' | 'permissions_conf'> & {
    permissions_conf: [{libraryId: string; permissionsConf: ITreePermissionsConf}];
    libraries: [ITreeLibraryInputFromGraphQL];
};

export interface ITreesQueryArgs {
    filters: ITreeFilterOptions;
    pagination: IPaginationParams;
    sort: ISortParams;
}

export interface ISaveTreeMutationArgs {
    tree: TreeFromGraphQL;
}

export interface IAddElementMutationArgs {
    treeId: string;
    element: ITreeElement;
    parent?: string | null;
    order?: number;
}

export interface IMoveElementMutationArgs {
    treeId: string;
    nodeId: string;
    parentTo?: string | null;
    order?: number;
}

export interface IDeleteElementMutationArgs {
    treeId: string;
    nodeId: string;
    deleteChildren?: boolean;
}

export interface ITreeEventFilters {
    treeId: string;
    nodes: string;
    events: TreeEventTypes[];
}
