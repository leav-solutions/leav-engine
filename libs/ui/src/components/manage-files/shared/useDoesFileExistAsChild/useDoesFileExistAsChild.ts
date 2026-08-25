import {useCallback} from 'react';
import {useDoesFileExistAsChildLazyQuery} from '_ui/_gqlTypes';

/**
 * Duplicate-name guard shared by both flows. The tree root has no parent node of its own, hence the
 * `parentNode: null` when the selected node *is* the tree.
 */
export const useDoesFileExistAsChild = (treeId?: string) => {
    const [runDoesFileExistAsChild] = useDoesFileExistAsChildLazyQuery({fetchPolicy: 'no-cache'});

    const doesFileExistAsChild = useCallback(
        async (parentNode: string, filename: string): Promise<boolean> => {
            const {data} = await runDoesFileExistAsChild({
                variables: {
                    treeId,
                    parentNode: parentNode !== treeId ? parentNode : null,
                    filename,
                },
            });

            return data?.doesFileExistAsChild ?? false;
        },
        [runDoesFileExistAsChild, treeId],
    );

    return {doesFileExistAsChild};
};
