// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IQueryInfos} from '_types/queryInfos';
import {IValue, IValueVersion} from '_types/value';
import ValidationError from '../../../errors/ValidationError';
import {FormElementTypes, IFormElement} from '../../../_types/forms';

export const getElementValues = async (params: {
    element: IFormElement;
    recordId: string;
    libraryId: string;
    version?: IValueVersion;
    deps: {'core.domain.record'?: IRecordDomain; 'core.utils'?: IUtils; 'core.utils.logger'?: winston.Winston};
    ctx: IQueryInfos;
}): Promise<{error?: string; values: IValue[] | null}> => {
    const {element, recordId, libraryId, version, deps, ctx} = params;

    const result = {
        error: null,
        values: null
    };

    if (element.type !== FormElementTypes.field || !element.settings.attribute || !recordId) {
        return result;
    }

    try {
        const values = await deps['core.domain.record'].getRecordFieldValue({
            library: libraryId,
            attributeId: element.settings.attribute,
            record: {
                id: recordId,
                library: libraryId
            },
            options: {version},
            ctx
        });

        if (values === null || (!Array.isArray(values) && values.value === null)) {
            return result;
        }

        result.values = Array.isArray(values) ? values : [values];
    } catch (error) {
        result.error = error.message;

        if (error instanceof ValidationError) {
            const lang = ctx.lang;
            result.error = Object.values(error.fields)
                .map(fieldError => deps['core.utils'].translateError(fieldError, lang))
                .join(', ');
        } else {
            deps['core.utils.logger'].error(error);
        }
    }

    return result;
};
