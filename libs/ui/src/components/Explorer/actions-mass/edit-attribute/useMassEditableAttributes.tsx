// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMassEditableAttributesQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type MassEditableAttribute} from './_types';

export const useMassEditableAttributes = ({libraryId}: {libraryId: string}): MassEditableAttribute[] => {
    const {t} = useSharedTranslation();

    const {data} = useMassEditableAttributesQuery({
        variables: {libraryId},
        skip: libraryId.length === 0,
    });

    return (
        data?.attributes?.list
            .map(treeAttribute => {
                let dependencies: MassEditableAttribute['dependencies'] = [];
                if ('permissions_conf_dependent_values' in treeAttribute) {
                    dependencies = treeAttribute.permissions_conf_dependent_values?.dependenciesTreeAttributes ?? [];
                }

                const hasEmptyDependency = dependencies.length === 0;
                const isSimpleWorkflow = dependencies.length === 1 && dependencies[0].id === treeAttribute.id;
                const isMonoDependencyWorkflow =
                    dependencies.length === 2 &&
                    dependencies.filter(attribute => attribute.id === treeAttribute.id).length === 1;

                let treeNodes: MassEditableAttribute['treeNodes'] = [];
                if ('tree_values' in treeAttribute) {
                    treeNodes =
                        treeAttribute.tree_values?.map(treeValue => ({
                            id: treeValue.node?.id ?? null,
                            label:
                                treeValue.node?.record.whoAmI.label ??
                                treeValue.node?.record.id ??
                                t('explorer.massAction.editAttribute_value_undefined'),
                            color: treeValue.node?.record.whoAmI.color,
                            allowedDependentNodeIds: treeValue.allowedDependentValues?.map(({nodeId}) => nodeId!) ?? [],
                        })) ?? [];
                }

                return {
                    id: treeAttribute.id,
                    label: treeAttribute.label,
                    dependencies,
                    hasEmptyDependency,
                    isSimpleWorkflow,
                    isMonoDependencyWorkflow,
                    treeNodes,
                };
            })
            .filter(
                ({hasEmptyDependency, isSimpleWorkflow, isMonoDependencyWorkflow}) =>
                    hasEmptyDependency || isSimpleWorkflow /*|| isMonoDependencyWorkflow*/,
            ) ?? []
    );
};
