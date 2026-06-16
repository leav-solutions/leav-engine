import {useState} from 'react';
import {type RecordFilterInput, type SaveValueBulkMappingInput} from '_ui/_gqlTypes';
import {type SetAttributeMapping, type SetAttributeMappingWithDependency} from './_types';

type EditionMapping = {count: number; mapping: SaveValueBulkMappingInput[]};

const EDITION_MAPPING_INITIAL_STATE: EditionMapping = {count: 0, mapping: []};

const _isBucketMatchingFilter = (bucket: SaveValueBulkMappingInput, dependencyFilter: RecordFilterInput) =>
    bucket.dependenciesFilters?.some(
        filter => filter?.field === dependencyFilter.field && filter?.value === dependencyFilter.value,
    ) ?? false;

export const useEditionMappingState = () => {
    const [editionMapping, setEditionMapping] = useState<EditionMapping>(EDITION_MAPPING_INITIAL_STATE);

    const resetEditionMapping = () => setEditionMapping(EDITION_MAPPING_INITIAL_STATE);

    const applyMappingChange: SetAttributeMapping = ({before, after, occurrenceCount}) => {
        setEditionMapping(current =>
            before === after
                ? {
                      count: current.count - occurrenceCount,
                      mapping: [{values: (current.mapping[0]?.values ?? []).filter(value => value.before !== before)}],
                  }
                : {
                      count: current.count + occurrenceCount,
                      mapping: [
                          {
                              values: (current.mapping[0]?.values ?? [])
                                  .filter(value => value.before !== before)
                                  .concat([{before, after}]),
                          },
                      ],
                  },
        );
    };

    const applyMonoDependencyWorkflowChange: SetAttributeMappingWithDependency = ({
        before,
        after,
        occurrenceCount,
        dependencyFilter,
    }) => {
        setEditionMapping(current => {
            if (before === after) {
                return {
                    count: current.count - occurrenceCount,
                    mapping: current.mapping.map(bucket => {
                        if (!_isBucketMatchingFilter(bucket, dependencyFilter)) {
                            return bucket;
                        }
                        return {
                            dependenciesFilters: [dependencyFilter],
                            values: (bucket.values ?? []).filter(value => value.before !== before),
                        };
                    }),
                };
            }

            const hasExistingBucket = current.mapping.some(bucket => _isBucketMatchingFilter(bucket, dependencyFilter));

            if (!hasExistingBucket) {
                return {
                    count: current.count + occurrenceCount,
                    mapping: [...current.mapping, {dependenciesFilters: [dependencyFilter], values: [{before, after}]}],
                };
            }

            return {
                count: current.count + occurrenceCount,
                mapping: current.mapping.map(bucket => {
                    if (!_isBucketMatchingFilter(bucket, dependencyFilter)) {
                        return bucket;
                    }
                    return {
                        dependenciesFilters: [dependencyFilter],
                        values: (bucket.values ?? [])
                            .filter(value => value.before !== before)
                            .concat([{before, after}]),
                    };
                }),
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
