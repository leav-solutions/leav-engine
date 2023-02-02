// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const isFileExistsAsChild = gql`
    query IS_FILE_EXISTS_AS_CHILD($parentNode: ID, $treeId: ID!, $filename: String!) {
        isFileExistsAsChild(parentNode: $parentNode, treeId: $treeId, filename: $filename)
    }
`;
