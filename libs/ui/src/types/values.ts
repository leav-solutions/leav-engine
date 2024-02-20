// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IValueVersionTreeNode {
    id: string;
    label: string;
}

export interface IValueVersion {
    [treeId: string]: IValueVersionTreeNode;
}
