// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useAttributeWithValuesForMassEditionLazyQuery, type AttributeDetailsTreeAttributeFragment} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useEffect, useMemo} from 'react';

export interface ITreeAttributeNodeValue {
    id: string | null;
    label: string;
    color?: string | null;
    allowedDependentValues?: Array<{nodeId?: string | null}> | null;
}

export const useListTreeAttributeValuesHook = ({
    treeAttribute: treeAttribute,
}: {
    treeAttribute: AttributeDetailsTreeAttributeFragment;
}): ITreeAttributeNodeValue[] => {
    const {t} = useSharedTranslation();
    const [loadValues, {data: treeContent}] = useAttributeWithValuesForMassEditionLazyQuery();

    useEffect(() => {
        if (!treeAttribute.linked_tree) {
            throw new Error('Fatal: selected attribute not found');
        }
        loadValues({
            fetchPolicy: 'no-cache',
            variables: {
                attributeId: treeAttribute.id,
            },
        });
    }, [treeAttribute]);

    return useMemo(
        () =>
            treeContent?.attributes?.list[0]?.tree_values?.map(treeValue => ({
                id: treeValue.node?.id || null,
                label:
                    treeValue.node?.record.whoAmI.label ||
                    treeValue.node?.record.whoAmI.id ||
                    t('explorer.massAction.editAttribute_value_undefined'),
                color: treeValue.node?.record.whoAmI.color,
                allowedDependentValues: treeValue.allowedDependentValues || null,
            })) || [],
        [treeContent],
    );
};
