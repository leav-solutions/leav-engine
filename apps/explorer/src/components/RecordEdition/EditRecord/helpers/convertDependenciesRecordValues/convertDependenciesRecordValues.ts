// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    IGetRecordDependenciesValue,
    RecordDependenciesValuesByAttribute
} from 'graphQL/queries/forms/getRecordDependenciesValuesQuery';
import {IDependencyValues} from '../../_types';

const _recordValuesToDependenciesValues = (
    recordValues: IGetRecordDependenciesValue | IGetRecordDependenciesValue[]
) => {
    if (!recordValues) {
        return [];
    }
    const valuesArray = Array.isArray(recordValues) ? recordValues : [recordValues];

    return valuesArray.reduce(
        (attributeValues, attributeValue) => [
            ...attributeValues,
            ...attributeValue.ancestors.flat().map(ancestor => ({
                id: ancestor.record.id,
                library: ancestor.record.library.id
            }))
        ],
        []
    );
};

/**
 * Convert record values to a more exploitable format
 *
 * @param recordValues
 * @param dependencyAttributes
 */
export const convertDependenciesRecordValues = (
    recordValues: RecordDependenciesValuesByAttribute,
    dependencyAttributes: string[]
): IDependencyValues => {
    return Object.keys(recordValues)
        .filter(key => dependencyAttributes.includes(key)) // Filter out __typename
        .reduce(
            (depValues, depAttributeKey) => ({
                ...depValues,
                [depAttributeKey]: _recordValuesToDependenciesValues(recordValues[depAttributeKey])
            }),
            {}
        );
};
