// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSmartFilterListValuesQuery} from '_ui/_gqlTypes';
import {prepareFiltersForRequest} from '_ui/components/Filters/prepareFiltersForRequest';
import {type IUIFilterTree, type FiltersOperator, type UIFilter} from '_ui/components/Filters/_types';

export interface ISmartFilterNode {
    title: string;
    key: string;
    value: string | null; // recordId or text value
    count: number;
    ghosted?: boolean;
}

interface IUseGetSmartFilterDataProps {
    libraryId: string;
    attributeId: string;
    filters: UIFilter[] | IUIFilterTree[];
    filtersOperator: FiltersOperator;
    selectedValueIds?: string[] | null;
    selectedFormattedValues?: Array<string | null> | null;
}

export const useGetSmartFilterData = ({
    libraryId,
    attributeId,
    filters,
    filtersOperator,
    selectedValueIds,
    selectedFormattedValues,
}: IUseGetSmartFilterDataProps) => {
    const filtersWithoutCurrentAttributeFilter = filters.filter(filter => filter.attribute.id !== attributeId);
    const preparedFilters = prepareFiltersForRequest(filtersWithoutCurrentAttributeFilter, filtersOperator, undefined);

    const {data, loading, error} = useSmartFilterListValuesQuery({
        variables: {
            library: libraryId,
            attribute: attributeId,
            recordFilters: preparedFilters ?? undefined,
        },
    });

    const occurrences = data?.listDistinctValues;

    const smartFilterData: ISmartFilterNode[] = occurrences?.length
        ? occurrences
              .map(occurrence =>
                  'standardValue' in occurrence && occurrence.standardValue !== null
                      ? {
                            key: occurrence.standardValue,
                            title: occurrence.standardValue,
                            value: occurrence.standardValue,
                            count: occurrence.count,
                        }
                      : 'recordValue' in occurrence && occurrence.recordValue !== null
                        ? {
                              key: occurrence.recordValue.id,
                              title:
                                  occurrence.recordValue.whoAmI.label ??
                                  occurrence.recordValue.whoAmI.id ??
                                  occurrence.recordValue.id,
                              value: occurrence.recordValue.whoAmI.id,
                              count: occurrence.count,
                          }
                        : {
                              key: 'no_value',
                              title: '',
                              value: null,
                              count: occurrence.count,
                          },
              )
              .sort((a, b) => a.title.localeCompare(b.title, undefined, {numeric: true}))
        : [];

    const smartFilterDataWithoutNoValue = smartFilterData.filter(node => node.key !== 'no_value');
    const noValueNodeData = smartFilterData.find(node => node.key === 'no_value');

    const selectedNodeIdsNotInSmartFilterData = (selectedValueIds ?? []).filter(
        nodeId => !smartFilterData.some(node => node.key === nodeId),
    );
    const selectedNodesNotInSmartFilterData: ISmartFilterNode[] = selectedNodeIdsNotInSmartFilterData.map(nodeId => {
        const index = selectedValueIds?.indexOf(nodeId) ?? -1;
        const formattedValue =
            index >= 0 && selectedFormattedValues?.[index] != null ? selectedFormattedValues[index] : nodeId;
        return {
            key: nodeId,
            value: nodeId,
            title: formattedValue ?? nodeId,
            count: 0,
            ghosted: true,
        };
    });

    const smartFilterDataToDisplay = [...smartFilterDataWithoutNoValue, ...selectedNodesNotInSmartFilterData];

    return {
        smartFilterDataToDisplay,
        noValueNodeData,
        isLoading: loading,
        error: error ?? null,
    };
};
