// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getTreesQuery = gql`
    fragment TreeLight on Tree {
        id
        label
    }
    query GET_TREES {
        trees {
            list {
                ...TreeLight
            }
        }
    }
`;
