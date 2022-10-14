// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError, useQuery} from '@apollo/client';
import {getVersionableAttributesByLibraryQuery} from 'graphQL/queries/attributes/getVersionableAttributesByLibrary';
import {
    GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY,
    GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARYVariables,
    GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile_trees
} from '_gqlTypes/GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY';

type ProfileTree = GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile_trees;

export interface IUseLibraryVersionProfilesHook {
    loading: boolean;
    error: ApolloError;
    trees: ProfileTree[];
}

export default (libraryId: string): IUseLibraryVersionProfilesHook => {
    const {loading, error, data} = useQuery<
        GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY,
        GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARYVariables
    >(getVersionableAttributesByLibraryQuery, {
        variables: {libraryId}
    });
    let trees: ProfileTree[] = [];

    if ((data?.attributes?.list ?? []).length) {
        const treesById = (data?.attributes?.list ?? []).reduce((allTrees, attribute) => {
            const profile = attribute.versions_conf?.profile;
            for (const tree of profile?.trees ?? []) {
                allTrees[tree.id] = tree;
            }

            return allTrees;
        }, {});

        trees = Object.values(treesById);
    }

    return {loading, error, trees};
};
