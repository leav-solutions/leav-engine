// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getLibrariesQuery = gql`
    fragment LibraryLight on Library {
        id
        label
    }

    query GET_LIBRARIES {
        libraries {
            list {
                ...LibraryLight
            }
        }
    }
`;