// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import recordIdentityFragment from '../records/recordIdentityFragment';

export type TreeNodeAncestors = Array<{
    record: RecordIdentity;
}>;

export interface ITreeNodePermissions {
    access_tree: boolean;
    detach: boolean;
    edit_children: boolean;
}

export interface ITreeContentRecordAndChildren {
    record: RecordIdentity;
    children?: ITreeContentRecordAndChildren[];
    permissions: ITreeNodePermissions;
}

export interface IGetTreeContentQuery {
    treeContent: ITreeContentRecordAndChildren[];
}

export interface IGetTreeContentQueryVar {
    treeId: string;
    startAt?: {
        id: string;
        library: string;
    };
}

const recordField = `
    record {
        ...RecordIdentity
    }
    permissions {
        access_tree
        detach
        edit_children
    }
`;

const recGetChildren = (depth: number) => {
    if (depth) {
        return `
            ${recordField}
            children {
                ${recGetChildren(--depth)}
            }
        `;
    }
    return recordField;
};

export const getTreeContentQuery = (depth: number) => {
    return gqlUnchecked`
        ${recordIdentityFragment}
        query GET_TREE_CONTENT($treeId: ID!, $startAt: TreeElementInput) {
            treeContent(treeId: $treeId, startAt: $startAt) {
                ${recGetChildren(depth)}
            }
        }
    `;
};
