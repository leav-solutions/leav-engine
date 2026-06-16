import {useMassEditableAttributesQuery} from '_ui/_gqlTypes';
import {type MassEditableAttribute} from './_types';

export const useMassEditableAttributes = ({libraryId}: {libraryId: string}): MassEditableAttribute[] => {
    const {data} = useMassEditableAttributesQuery({
        variables: {libraryId},
        skip: libraryId.length === 0,
    });

    return (
        data?.attributes?.list
            .map(treeAttribute => {
                let dependencies: MassEditableAttribute['dependencies'] = [];
                if ('permissions_conf_dependent_values' in treeAttribute) {
                    dependencies = (treeAttribute.permissions_conf_dependent_values?.dependenciesTreeAttributes ?? [])
                        .map(attribute => {
                            if ('linked_tree' in attribute && attribute.linked_tree?.libraries.length === 1) {
                                return {
                                    id: attribute.id,
                                    label: attribute.label,
                                    linkedTreeLibraryId: attribute.linked_tree.libraries[0].library.id,
                                };
                            }
                            return null;
                        })
                        // TODO: to be factorised as utility (replace .filter(Boolean) but with better TS support)
                        .filter((x): x is NonNullable<typeof x> => x !== null);
                }

                const hasEmptyDependency = dependencies.length === 0;
                const isSimpleWorkflow = dependencies.length === 1 && dependencies[0].id === treeAttribute.id;
                const isMonoDependencyWorkflow =
                    dependencies.length === 2 &&
                    dependencies.filter(attribute => attribute.id === treeAttribute.id).length === 1;

                return {
                    id: treeAttribute.id,
                    label: treeAttribute.label,
                    dependencies,
                    hasEmptyDependency,
                    isSimpleWorkflow,
                    isMonoDependencyWorkflow,
                };
            })
            .filter(
                ({hasEmptyDependency, isSimpleWorkflow, isMonoDependencyWorkflow}) =>
                    hasEmptyDependency || isSimpleWorkflow || isMonoDependencyWorkflow,
            ) ?? []
    );
};
