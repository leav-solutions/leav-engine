// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type AttributeDetailsTreeAttributeFragment,
    type TreeNodeChildrenQuery,
    useTreeNodeChildrenLazyQuery,
} from '_ui/_gqlTypes';
import {useEffect} from 'react';

export type TreeAttributeNodeValue = TreeNodeChildrenQuery['treeNodeChildren']['list'][0];
export const useListTreeAttributeValuesHook = ({
    treeAttribute: treeAttribute,
}: {
    treeAttribute: AttributeDetailsTreeAttributeFragment;
}): TreeAttributeNodeValue[] => {
    const [loadTreeContent, {data: treeContent}] = useTreeNodeChildrenLazyQuery();
    useEffect(() => {
        if (!treeAttribute.linked_tree) {
            throw new Error('Fatal: selected attribute not found');
        }
        loadTreeContent({
            variables: {
                treeId: treeAttribute.linked_tree.id,
            },
        });
    }, [treeAttribute]);

    return treeContent?.treeNodeChildren.list || [];
};
