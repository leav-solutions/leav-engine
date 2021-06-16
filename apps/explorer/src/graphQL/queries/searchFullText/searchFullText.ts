// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {IField, ILabel} from '../../../_types/types';
import {getRecordsFields} from '../records/getRecordsFromLibraryQuery';

export interface ISearchFullTextResult {
    [x: string]: any;
    whoAmI: {
        id: string;
        label: ILabel;
        color?: string;
        preview?: {
            small: string;
            medium: string;
            big: string;
            pages: string;
        };
        library: {
            id: string;
            label: ILabel;
        };
    };
}

export interface ISearchFullTextQuery {
    [x: string]: {
        totalCount: number;
        list: ISearchFullTextResult[];
    };
}

export interface ISearchFullTextVar {
    search: string;
    from: number;
    size: number;
}

const getFields = (libType?: string, fields?: IField[]) => {
    if (!libType || !fields || !fields.length) {
        return '';
    }

    return `
        ... on ${libType} {
            ${getRecordsFields(fields)}
        }
    `;
};

export const searchFullText = (libId?: string, libType?: string, fields?: IField[]) => {
    return gqlUnchecked`
        query USE_SEARCH_FULL_TEXT($search: String!, $from: Int!, $size: Int!) {
            ${libId}(pagination: { limit: $size, offset: $from }, searchQuery: $search) {
                totalCount
                list {
                    ${getFields(libType, fields)}
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
                            gqlNames {
                                query
                            }
                        }
                    }
                }
            }
        }`;
};
