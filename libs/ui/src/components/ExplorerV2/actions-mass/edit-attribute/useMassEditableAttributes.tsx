import {useMemo} from 'react';
import {AttributeType} from '_ui/_gqlTypes';
import {type AttributesPropertiesById} from '../../_types';
import {type MassEditableAttribute} from './_types';

/**
 * Pure derivation from the upstream-loaded attributes map (`useExplorerLibraryMetadata`): which
 * mono-valued tree attributes are eligible for mass edition, classified by their workflow
 * dependencies (hasEmptyDependency / isSimpleWorkflow / isMonoDependencyWorkflow). Filtering by
 * type/multiple_values was formerly delegated to the server (MassEditableAttributes query).
 */
export const useMassEditableAttributes = (attributesProperties: AttributesPropertiesById): MassEditableAttribute[] =>
    useMemo(
        () =>
            Object.values(attributesProperties)
                .filter(attribute => attribute.type === AttributeType.tree && !attribute.multiple_values)
                .map(treeAttribute => {
                    let dependencies: MassEditableAttribute['dependencies'] = [];
                    if ('permissions_conf_dependent_values' in treeAttribute) {
                        dependencies = (
                            treeAttribute.permissions_conf_dependent_values?.dependenciesTreeAttributes ?? []
                        )
                            .map(attribute => {
                                if ('linked_tree' in attribute && attribute.linked_tree?.libraries.length === 1) {
                                    return {
                                        id: attribute.id,
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
                ),
        [attributesProperties],
    );
