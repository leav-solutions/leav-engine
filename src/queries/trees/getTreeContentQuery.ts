// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {ILabel, IPreview} from '../../_types/types';

export interface IRecordField {
    whoAmI: {
        id: string;
        label: string | null;
        color?: string;
        preview: IPreview;
        library: {
            id: string;
            label: ILabel;
        };
    };
}

export interface IRecordAndChildren {
    record: IRecordField;
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
        whoAmI {
            id
            label
            color
            preview {
                small
                medium
                big
            }
            library {
                id
                label
            }
        }
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
    return gql`
        query GET_TREE_CONTENT($treeId: ID!, $startAt: TreeElementInput) {
            treeContent(treeId: $treeId, startAt: $startAt) {
                ${recGetChildren(depth)}
            }
        }
    `;
};
