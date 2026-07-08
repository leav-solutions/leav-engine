import {
    type GetTreeLibrariesForExplorerQuery,
    useGetTreeLibrariesForExplorerQuery,
} from '../../../../../../__generated__';
import {type ITreeExplorerNode} from '../_types';

export type ITreeAllowedChildLibrary = NonNullable<
    GetTreeLibrariesForExplorerQuery['trees']
>['list'][number]['libraries'][number];

export interface IUseTreeLibraryAllowedAsChild {
    loading: boolean;
    error?: Error;
    libraries: ITreeAllowedChildLibrary[];
}

const ALL_CHILDREN_ALLOWED = '__all__';

/**
 * Returns the libraries allowed as children of a given node (or at the tree root when no parent).
 */
export const useTreeLibraryAllowedAsChild = (
    treeId?: string,
    parent?: ITreeExplorerNode,
): IUseTreeLibraryAllowedAsChild => {
    const {data, loading, error} = useGetTreeLibrariesForExplorerQuery({
        skip: !treeId,
        variables: {treeId: [treeId]},
    });

    const libraries: ITreeAllowedChildLibrary[] = [];

    if (!loading && !error) {
        const treeLibraries = data?.trees?.list[0]?.libraries ?? [];

        if (!parent) {
            libraries.push(...treeLibraries.filter(treeLibrary => treeLibrary.settings.allowedAtRoot));
        } else {
            const parentLibrary = treeLibraries.find(
                treeLibrary => treeLibrary.library.id === parent.record.whoAmI.library.id,
            );
            const allChildrenAllowed = parentLibrary?.settings.allowedChildren?.[0] === ALL_CHILDREN_ALLOWED;

            libraries.push(
                ...treeLibraries.filter(
                    treeLibrary =>
                        allChildrenAllowed || parentLibrary?.settings.allowedChildren.includes(treeLibrary.library.id),
                ),
            );
        }
    }

    return {loading, error, libraries};
};
