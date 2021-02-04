// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
                libraries: Array<{
                    id: string;
                    label: ILabel;
                }>;
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
