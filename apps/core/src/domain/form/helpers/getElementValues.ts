// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type IUtils} from 'utils/utils';
import {logger} from '@leav/logger';
import {type IQueryInfos} from '_types/queryInfos';
import {type IValue, type IValueVersion} from '_types/value';
import ValidationError from '../../../errors/ValidationError';
import {FormElementTypes, type IFormElement} from '../../../_types/forms';

export const getElementValues = async (params: {
    element: IFormElement;
    recordId: string;
    libraryId: string;
    version?: IValueVersion;
    deps: {'core.domain.record'?: IRecordDomain; 'core.utils'?: IUtils};
    ctx: IQueryInfos;
}): Promise<{error?: string; values: IValue[] | null}> => {
    const {element, recordId, libraryId, version, deps, ctx} = params;

    const result = {
        error: null,
        values: null,
    };

    if (element.type !== FormElementTypes.FIELD || !element.settings.attribute || !recordId) {
        return result;
    }

    try {
        const values = await deps['core.domain.record'].getRecordFieldValue({
            library: libraryId,
            attributeId: element.settings.attribute,
            record: {
                id: recordId,
                library: libraryId,
            },
            options: {version},
            ctx,
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
                .map(fieldError => deps['core.utils'].translateError(fieldError, lang))
                .join(', ');
        } else {
            logger.error(
                `Error getting element values for record ${recordId} and attribute ${element.settings.attribute}: ${error.message}`,
            );
        }
    }

    return result;
};
