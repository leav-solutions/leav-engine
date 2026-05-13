import {type ApolloError} from '@apollo/client';
import {type GetVersionableAttributesByLibraryQuery, useGetVersionableAttributesByLibraryQuery} from '_ui/_gqlTypes';

type ProfileTree =
    GetVersionableAttributesByLibraryQuery['attributes']['list'][0]['versions_conf']['profile']['trees'][0];

export interface IUseLibraryVersionProfilesHook {
    loading: boolean;
    error: ApolloError;
    trees: ProfileTree[];
}

export default (libraryId: string): IUseLibraryVersionProfilesHook => {
    const {loading, error, data} = useGetVersionableAttributesByLibraryQuery({
        variables: {libraryId},
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
