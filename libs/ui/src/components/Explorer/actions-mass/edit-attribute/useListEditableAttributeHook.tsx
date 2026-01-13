// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AttributeDetailsTreeAttributeFragment, AttributeType} from '_ui/_gqlTypes';
import {useMemo} from 'react';
import {useAttributeDetailsData} from '../../manage-view-settings/_shared/useAttributeDetailsData';

export type EditableAttributes = AttributeDetailsTreeAttributeFragment[];
export const useListEditableAttributeHook = ({libraryId}: {libraryId: string}): EditableAttributes => {
    const {attributeDetailsById} = useAttributeDetailsData(libraryId);
    const treeMonoValuedAttributes: AttributeDetailsTreeAttributeFragment[] = useMemo(
        () =>
            Object.values(attributeDetailsById).filter(attr => {
                const dependenciesTreeAttributes =
                    ('permissions_conf_dependent_values' in attr &&
                        attr.permissions_conf_dependent_values?.dependenciesTreeAttributes) ||
                    [];
                const dependentOnItself =
                    dependenciesTreeAttributes.length === 1 && dependenciesTreeAttributes[0].id === attr.id;
                return (
                    attr.type === AttributeType.tree &&
                    !attr.multiple_values &&
                    (dependenciesTreeAttributes.length === 0 || dependentOnItself)
                );
            }),
        [attributeDetailsById],
    );

    return treeMonoValuedAttributes;
};
