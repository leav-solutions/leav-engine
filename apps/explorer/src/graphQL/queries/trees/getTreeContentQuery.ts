// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import recordIdentityFragment from '../records/recordIdentityFragment';

export type TreeNodeAncestors = Array<{
    record: RecordIdentity;
}>;

export interface IRecordAndChildren {
    record: RecordIdentity;
    children?: IRecordAndChildren[];
}

export interface IGetTreeContentQuery {
    treeContent: IRecordAndChildren[];
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
