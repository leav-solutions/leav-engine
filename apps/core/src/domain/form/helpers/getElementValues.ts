// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordDomain} from 'domain/record/recordDomain';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {FormElementTypes, IFormElement} from '../../../_types/forms';

export const getElementValues = async (
    el: IFormElement,
    recordId: string,
    libraryId: string,
    {'core.domain.record': recordDomain = null}: {'core.domain.record'?: IRecordDomain},
    ctx: IQueryInfos
): Promise<IValue[] | null> => {
    if (el.type !== FormElementTypes.field || !el.settings.attribute || !recordId) {
        return null;
    }

    const values = await recordDomain.getRecordFieldValue({
        library: libraryId,
        attributeId: el.settings.attribute,
        record: {
            id: recordId,
            library: libraryId
        },
        ctx
    });

    if (values === null) {
        return null;
    }

    return Array.isArray(values) ? values : [values];
};
