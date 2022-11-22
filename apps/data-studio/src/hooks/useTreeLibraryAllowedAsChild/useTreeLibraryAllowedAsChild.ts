// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {
    GET_TREE_LIBRARIES,
    GET_TREE_LIBRARIESVariables,
    GET_TREE_LIBRARIES_trees_list_libraries
} from '_gqlTypes/GET_TREE_LIBRARIES';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';

export interface IUseTreeLibraryAllowedAsChild {
    loading: boolean;
    error: Error;
    libraries: GET_TREE_LIBRARIES_trees_list_libraries[];
}

export const useTreeLibraryAllowedAsChild = (
    treeId: string,
    parent?: TREE_NODE_CHILDREN_treeNodeChildren_list
): IUseTreeLibraryAllowedAsChild => {
    const {data, loading, error} = useQuery<GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables>(getTreeLibraries, {
        skip: !treeId,
        variables: {treeId}
    });

    const libraries = [];

    if (!loading && !error) {
        const treeLibraries = data?.trees?.list[0]?.libraries ?? [];

        if (!parent) {
            // If no parent, take only libraries allowed at root
            libraries.push(...treeLibraries.filter(treeLibrary => treeLibrary.settings.allowedAtRoot));
        } else {
            const parentLibrary = treeLibraries.find(
                treeLibrary => treeLibrary.library.id === parent.record.whoAmI.library.id
            );

            // If parent is specified, take only libraries allowed as children of parent
            libraries.push(
                ...treeLibraries.filter(treeLibrary =>
                    parentLibrary.settings.allowedChildren.includes(treeLibrary.library.id)
                )
            );
        }
    }

    return {
        loading,
        error,
        libraries
    };
};
