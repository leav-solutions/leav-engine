import * as gqlTypes from '_ui/_gqlTypes';
import {renderHook} from '_ui/_tests/testUtils';
import {useDependencyValues} from './useDependencyValues';

const libraryId = 'test_library';
const monoDependencyAttribute = {id: 'dep_attr', linkedTreeLibraryId: 'dep_lib'};
const massSelectionFilters = [];

describe('useDependencyValues', () => {
    it('should return loading=true and empty list when query has no data', () => {
        jest.spyOn(gqlTypes, 'useValuesOccurrencesForDependencyQuery').mockReturnValue({
            data: undefined,
            loading: true,
        } as gqlTypes.ValuesOccurrencesForDependencyQueryResult);

        const {result} = renderHook(() =>
            useDependencyValues({libraryId, monoDependencyAttribute, massSelectionFilters}),
        );

        expect(result.current.loading).toBe(true);
        expect(result.current.dependencyValues).toEqual([]);
    });

    it('should map a non-null treeNode to an EQUAL dependency filter with its node data', () => {
        jest.spyOn(gqlTypes, 'useValuesOccurrencesForDependencyQuery').mockReturnValue({
            data: {
                listDistinctValues: [{treeNode: {id: 'node_1', record: {id: 'rec_1', whoAmI: {label: 'Node 1'}}}}],
            },
            loading: false,
        } as unknown as gqlTypes.ValuesOccurrencesForDependencyQueryResult);

        const {result} = renderHook(() =>
            useDependencyValues({libraryId, monoDependencyAttribute, massSelectionFilters}),
        );

        expect(result.current.dependencyValues).toHaveLength(1);
        expect(result.current.dependencyValues[0]).toEqual({
            key: 'node_1',
            label: 'Node 1',
            dependencyFilter: {
                field: 'dep_attr.dep_lib.id',
                condition: gqlTypes.RecordFilterCondition.EQUAL,
                value: 'rec_1',
            },
            filtersWithDependency: [
                {field: 'dep_attr.dep_lib.id', condition: gqlTypes.RecordFilterCondition.EQUAL, value: 'rec_1'},
            ],
            dependencyAttributeId: 'dep_attr',
            dependencyAttributeNodeId: 'node_1',
        });
    });

    it('should wrap massSelectionFilters in brackets combined with AND when provided', () => {
        jest.spyOn(gqlTypes, 'useValuesOccurrencesForDependencyQuery').mockReturnValue({
            data: {
                listDistinctValues: [{treeNode: {id: 'node_1', record: {id: 'rec_1', whoAmI: {label: 'Node 1'}}}}],
            },
            loading: false,
        } as unknown as gqlTypes.ValuesOccurrencesForDependencyQueryResult);

        const filters = [{field: 'id', condition: gqlTypes.RecordFilterCondition.EQUAL, value: '42'}];

        const {result} = renderHook(() =>
            useDependencyValues({libraryId, monoDependencyAttribute, massSelectionFilters: filters}),
        );

        expect(result.current.dependencyValues[0].filtersWithDependency).toEqual([
            {field: 'dep_attr.dep_lib.id', condition: gqlTypes.RecordFilterCondition.EQUAL, value: 'rec_1'},
            {operator: gqlTypes.RecordFilterOperator.AND},
            {operator: gqlTypes.RecordFilterOperator.OPEN_BRACKET},
            {field: 'id', condition: gqlTypes.RecordFilterCondition.EQUAL, value: '42'},
            {operator: gqlTypes.RecordFilterOperator.CLOSE_BRACKET},
        ]);
    });

    it('should map a null treeNode to an IS_EMPTY filter with the translation label', () => {
        jest.spyOn(gqlTypes, 'useValuesOccurrencesForDependencyQuery').mockReturnValue({
            data: {listDistinctValues: [{treeNode: null}]},
            loading: false,
        } as unknown as gqlTypes.ValuesOccurrencesForDependencyQueryResult);

        const {result} = renderHook(() =>
            useDependencyValues({libraryId, monoDependencyAttribute, massSelectionFilters}),
        );

        expect(result.current.dependencyValues).toHaveLength(1);
        expect(result.current.dependencyValues[0].key).toBe('no-dependency');
        expect(result.current.dependencyValues[0].label).toBe('explorer.massAction.editAttribute_value_undefined');
        expect(result.current.dependencyValues[0].dependencyFilter).toEqual({
            field: 'dep_attr',
            condition: gqlTypes.RecordFilterCondition.IS_EMPTY,
        });
        expect(result.current.dependencyValues[0].dependencyAttributeId).toBeUndefined();
        expect(result.current.dependencyValues[0].dependencyAttributeNodeId).toBeUndefined();
    });
});
