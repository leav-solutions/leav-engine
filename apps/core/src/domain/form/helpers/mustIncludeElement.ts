// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordDomain} from 'domain/record/recordDomain';
import {IFormDependentElements} from '_types/forms';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeValue} from '_types/value';

/**
 * Check if element must be included in form based on dependencies
 */
export const mustIncludeElement = async (
    element: IFormDependentElements,
    recordId: string,
    libraryId: string,
    {
        'core.domain.record': recordDomain = null
    }: {
        'core.domain.record'?: IRecordDomain;
    },
    ctx: IQueryInfos
): Promise<boolean> => {
    if (!element.dependency) {
        return true;
    }

    // Get dependency value
    const recordDepValue = await recordDomain.getRecordFieldValue({
        library: libraryId,
        attributeId: element.dependency.attribute,
        record: {
            id: recordId,
            library: libraryId
        },
        ctx
    });
    const depValues: ITreeValue[] | null =
        Array.isArray(recordDepValue) || !recordDepValue
            ? (recordDepValue as ITreeValue[] | null)
            : ([recordDepValue] as ITreeValue[]);

    // Check if field must be included
    const isFound = !!depValues.find(
        depValue =>
            depValue.value.record.id === element.dependency.value.id &&
            depValue.value.record.library === element.dependency.value.library
    );

    return isFound;
};
