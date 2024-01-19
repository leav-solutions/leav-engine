// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const doesFileExistAsChild = gql`
    query DOES_FILE_EXIST_AS_CHILD($parentNode: ID, $treeId: ID!, $filename: String!) {
        doesFileExistAsChild(parentNode: $parentNode, treeId: $treeId, filename: $filename)
    }
`;
