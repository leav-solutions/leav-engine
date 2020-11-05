import gql from 'graphql-tag';
import {ILabel} from '../../_types/types';

export interface IGetLibrariesAndTreesListQuery {
    libraries: {
        list: [
            {
                id: string;
                label: ILabel;
                gqlNames: {
                    query: string;
                    filter: string;
                    searchableFields: string;
                };
            }
        ];
    };

    trees: {
        list: [
            {
                id: string;
                label: ILabel;
                libraries: {
                    id: string;
                    label: ILabel;
                }[];
            }
        ];
    };
}

export const getLibrariesAndTreesListQuery = gql`
    query GET_LIBRARIES_AND_TREES_LIST {
        libraries {
            list {
                id
                label
                gqlNames {
                    query
                    filter
                    searchableFields
                }
            }
        }

        trees {
            list {
                id
                label
                libraries {
                    id
                    label
                }
            }
        }
    }
`;
