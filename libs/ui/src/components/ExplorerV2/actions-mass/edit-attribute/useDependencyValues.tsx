import {
    RecordFilterCondition,
    type RecordFilterInput,
    RecordFilterOperator,
    useValuesOccurrencesForDependencyQuery,
} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type DependencyValue} from './_types';

export const useDependencyValues = ({
    libraryId,
    monoDependencyAttribute,
    massSelectionFilters,
    massSelectionSearchQuery,
}: {
    libraryId: string;
    monoDependencyAttribute: {id: string; linkedTreeLibraryId: string};
    massSelectionFilters: RecordFilterInput[];
    massSelectionSearchQuery?: string;
}): {dependencyValues: DependencyValue[]; loading: boolean} => {
    const {t} = useSharedTranslation();

    const {data, loading} = useValuesOccurrencesForDependencyQuery({
        variables: {
            libraryId,
            dependencyAttributeId: monoDependencyAttribute.id,
            recordFilters: massSelectionFilters,
            searchQuery: massSelectionSearchQuery,
        },
    });

    const dependencyValues = (data?.listDistinctValues ?? []).map(occurrence => {
        const dependencyFilter: RecordFilterInput = occurrence.treeNode
            ? {
                  field: `${monoDependencyAttribute.id}.${monoDependencyAttribute.linkedTreeLibraryId}.id`,
                  condition: RecordFilterCondition.EQUAL,
                  value: occurrence.treeNode.record.id,
              }
            : {
                  field: monoDependencyAttribute.id,
                  condition: RecordFilterCondition.IS_EMPTY,
              };

        const filtersWithDependency: RecordFilterInput[] =
            massSelectionFilters.length > 0
                ? [
                      dependencyFilter,
                      {operator: RecordFilterOperator.AND},
                      {operator: RecordFilterOperator.OPEN_BRACKET},
                      ...massSelectionFilters,
                      {operator: RecordFilterOperator.CLOSE_BRACKET},
                  ]
                : [dependencyFilter];

        return {
            key: occurrence.treeNode?.id ?? 'no-dependency',
            label:
                occurrence.treeNode?.record.whoAmI.label ??
                String(t('explorer.massAction.editAttribute_value_undefined')),
            dependencyFilter,
            filtersWithDependency,
            dependencyAttributeId: occurrence.treeNode ? monoDependencyAttribute.id : undefined,
            dependencyAttributeNodeId: occurrence.treeNode?.id,
        };
    });

    return {dependencyValues, loading};
};
