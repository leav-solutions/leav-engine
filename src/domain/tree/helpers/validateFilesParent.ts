import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeElement} from '_types/tree';
import {FilesAttributes} from '../../../_types/filesManager';
import {IQueryInfos} from '_types/queryInfos';

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
