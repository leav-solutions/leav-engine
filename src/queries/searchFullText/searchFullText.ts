import {gql} from '@apollo/client';
import {IItemsColumn} from '../../_types/types';
import {getRecordsFields} from './../records/getRecordsFromLibraryQuery';

const getFields = (libType?: string, fields?: IItemsColumn[]) => {
    if (!libType || !fields) {
        return '';
    }

    return `
        ... on ${libType} {
            ${getRecordsFields(fields)}
        }
    `;
};

export const SearchFullText = (libType?: string, fields?: IItemsColumn[]) => {
    return gql`
        query USE_SEARCH_FULL_TEXT($libId: ID!, $search: String!) {
            search(library: $libId, query: $search) {
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
                        }
                    }
                }
            }
        }`;
};
