import {useState} from 'react';
import {
    type RecordFilterInput,
    type SaveValueBulkMappingInput,
    type SaveValueBulkMappingValueInput,
} from '_ui/_gqlTypes';
import {
    DO_NOT_CHANGE,
    type MassEditMappingChange,
    type SetAttributeMapping,
    type SetAttributeMappingWithDependency,
} from './_types';

type EditionMapping = {count: number; mapping: SaveValueBulkMappingInput[]};

const EDITION_MAPPING_INITIAL_STATE: EditionMapping = {count: 0, mapping: []};

const _isBucketMatchingFilter = (bucket: SaveValueBulkMappingInput, dependencyFilter: RecordFilterInput) =>
    bucket.dependenciesFilters?.some(
        filter => filter?.field === dependencyFilter.field && filter?.value === dependencyFilter.value,
    ) ?? false;

const _isNeutralChange = ({before, after}: MassEditMappingChange) => after === DO_NOT_CHANGE || after === before;

const _isMapped = (values: SaveValueBulkMappingValueInput[], before: MassEditMappingChange['before']) =>
    values.some(value => value.before === before);

const _countDelta = (values: SaveValueBulkMappingValueInput[], change: MassEditMappingChange) => {
    if (_isMapped(values, change.before)) {
        return _isNeutralChange(change) ? -change.occurrenceCount : 0;
    }
    return _isNeutralChange(change) ? 0 : change.occurrenceCount;
};

const _applyChangeToValues = (
    values: SaveValueBulkMappingValueInput[],
    change: MassEditMappingChange,
): SaveValueBulkMappingValueInput[] => {
    const otherValues = values.filter(value => value.before !== change.before);

    return _isNeutralChange(change) ? otherValues : otherValues.concat([{before: change.before, after: change.after}]);
};

export const useEditionMappingState = () => {
    const [editionMapping, setEditionMapping] = useState<EditionMapping>(EDITION_MAPPING_INITIAL_STATE);

    const resetEditionMapping = () => setEditionMapping(EDITION_MAPPING_INITIAL_STATE);

    const applyMappingChange: SetAttributeMapping = change => {
        setEditionMapping(current => {
            const values = current.mapping[0]?.values ?? [];

            if (_isNeutralChange(change) && !_isMapped(values, change.before)) {
                return current;
            }

            return {
                count: current.count + _countDelta(values, change),
                mapping: [{values: _applyChangeToValues(values, change)}],
            };
        });
    };

    const applyMonoDependencyWorkflowChange: SetAttributeMappingWithDependency = ({dependencyFilter, ...change}) => {
        setEditionMapping(current => {
            const matchingBucket = current.mapping.find(bucket => _isBucketMatchingFilter(bucket, dependencyFilter));
            const values = matchingBucket?.values ?? [];

            if (_isNeutralChange(change) && !_isMapped(values, change.before)) {
                return current;
            }

            const updatedBucket = {
                dependenciesFilters: [dependencyFilter],
                values: _applyChangeToValues(values, change),
            };

            return {
                count: current.count + _countDelta(values, change),
                mapping: matchingBucket
                    ? current.mapping.map(bucket =>
                          _isBucketMatchingFilter(bucket, dependencyFilter) ? updatedBucket : bucket,
                      )
                    : current.mapping.concat([updatedBucket]),
            };
        });
    };

    return {
        editionMapping,
        resetEditionMapping,
        applyMappingChange,
        applyMonoDependencyWorkflowChange,
    };
};
