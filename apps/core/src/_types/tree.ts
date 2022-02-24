// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeNodePermissionsConf} from './permissions';
import {IRecord} from './record';
import {IGetCoreEntitiesParams, IKeyValue} from './shared';

export interface ITreeLibrarySettings {
    allowMultiplePositions: boolean;
    allowedChildren: string[];
    allowedAtRoot: boolean;
}

export interface ITree extends ICoreEntity {
    libraries: IKeyValue<ITreeLibrarySettings>;
    behavior?: TreeBehavior;
    system?: boolean;
    permissions_conf?: ITreeNodePermissionsConf;
}

export interface ITreeFilterOptions extends ICoreEntityFilterOptions {
    system?: boolean;
    library?: string;
}

export interface IGetCoreTreesParams extends IGetCoreEntitiesParams {
    filters?: ITreeFilterOptions;
}

export interface ITreeElement {
    id: string;
    library: string;
}

export interface ITreeNode {
    id: string;
    order?: number;
    record?: IRecord;
    parent?: ITreeNode[];
    ancestors?: ITreeNode[];
    children?: ITreeNode[];
    linkedRecords?: IRecord[];
}

export type ITreeNodeLight = Pick<ITreeNode, 'id' | 'order'>;

export interface ITreeNodeWithTreeId extends ITreeNode {
    treeId: string;
}

export type TreePaths = ITreeNode[];

export enum TreeBehavior {
    STANDARD = 'standard',
    FILES = 'files'
}
