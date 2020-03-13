import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeElement} from '_types/tree';
import {FilesAttributes} from '../../../_types/filesManager';

export default async (
    parent: ITreeElement,
    deps: {valueDomain: IValueDomain}
): Promise<{isValid: boolean; message?: string}> => {
    if (!parent) {
        // Adding to root
        return {isValid: true};
    }

    const isDirVal = await deps.valueDomain.getValues(parent.library, parent.id, FilesAttributes.IS_DIRECTORY);

    if (!isDirVal[0].value) {
        return {isValid: false, message: 'Cannot add anything under a file'};
    }

    return {isValid: true};
};
