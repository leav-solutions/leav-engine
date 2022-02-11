// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValueDomain} from 'domain/value/valueDomain';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeElement} from '_types/tree';
import {FilesAttributes} from '../../../_types/filesManager';

export default async (
    parent: ITreeElement,
    deps: {valueDomain: IValueDomain},
    ctx: IQueryInfos
): Promise<{isValid: boolean; message?: string}> => {
    if (!parent) {
        // Adding to root
        return {isValid: true};
    }

    const isDirVal = await deps.valueDomain.getValues({
        library: parent.library,
        recordId: parent.id,
        attribute: FilesAttributes.IS_DIRECTORY,
        ctx
    });

    if (!isDirVal[0].value) {
        return {isValid: false, message: 'Cannot add anything under a file'};
    }

    return {isValid: true};
};
