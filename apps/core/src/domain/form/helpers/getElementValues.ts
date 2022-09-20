// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import ValidationError from '../../../errors/ValidationError';
import {FormElementTypes, IFormElement} from '../../../_types/forms';

export const getElementValues = async (
    el: IFormElement,
    recordId: string,
    libraryId: string,
    {
        'core.domain.record': recordDomain = null,
        'core.utils': utils = null
    }: {'core.domain.record'?: IRecordDomain; 'core.utils'?: IUtils},
    ctx: IQueryInfos
): Promise<{error?: string; values: IValue[] | null}> => {
    const result = {
        error: null,
        values: null
    };

    if (el.type !== FormElementTypes.field || !el.settings.attribute || !recordId) {
        return result;
    }

    try {
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
            return result;
        }

        result.values = Array.isArray(values) ? values : [values];
    } catch (error) {
        result.error = error.message;

        if (error instanceof ValidationError) {
            const lang = ctx.lang;
            result.error = Object.values(error.fields)
                .map(fieldError => utils.translateError(fieldError, lang))
                .join(', ');
        }
    }

    return result;
};
