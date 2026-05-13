import {gql} from '@apollo/client';

export const doesFileExistAsChild = gql`
    query DOES_FILE_EXIST_AS_CHILD($parentNode: ID, $treeId: ID!, $filename: String!) {
        doesFileExistAsChild(parentNode: $parentNode, treeId: $treeId, filename: $filename)
    }
`;
