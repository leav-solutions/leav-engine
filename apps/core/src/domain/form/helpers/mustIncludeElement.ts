// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
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
        'core.domain.record': recordDomain = null,
        'core.domain.tree': treeDomain = null
    }: {
        'core.domain.record'?: IRecordDomain;
        'core.domain.tree'?: ITreeDomain;
    },
    ctx: IQueryInfos
): Promise<boolean> => {
    if (!element.dependencyValue) {
        return true;
    }

    // Get dependency value
    const recordDepValue = recordId
        ? await recordDomain.getRecordFieldValue({
              library: libraryId,
              attributeId: element.dependencyValue.attribute,
              record: {
                  id: recordId,
                  library: libraryId
              },
              ctx
          })
        : [];

    const depValues: ITreeValue[] | null =
        Array.isArray(recordDepValue) || !recordDepValue
            ? (recordDepValue as ITreeValue[] | null)
            : ([recordDepValue] as ITreeValue[]);

    // Get ancestors of value
    // For each ancestor, retrieve associated fields to check if field must be included
    let isFound = false;
    for (const depValue of depValues ?? []) {
        const ancestors = await treeDomain.getElementAncestors({
            treeId: depValue.treeId,
            nodeId: depValue.value.id,
            ctx
        });
        isFound = ancestors.some(ancestor => ancestor.id === element.dependencyValue.value);
        if (isFound) {
            break;
        }
    }

    return isFound;
};
