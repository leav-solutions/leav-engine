// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import ValidationError from '../../../errors/ValidationError';
import {ActionsListEvents} from '../../../_types/actionsList';

interface IPrepareValueParams {
    attributeProps: IAttribute;
    value: IValue;
    library: string;
    recordId: string;
    infos?: IQueryInfos;
    keepEmpty: boolean;
    deps: {
        actionsListDomain: IActionsListDomain;
        attributeDomain: IAttributeDomain;
        utils: IUtils;
    };
    ctx: IQueryInfos;
}

export default async (params: IPrepareValueParams): Promise<IValue[]> => {
    const {attributeProps, value, library, recordId, deps, ctx} = params;

    // Execute actions list. Output value might be different from input value
    const preparedValues = !!attributeProps.actions_list?.saveValue
        ? await deps.actionsListDomain.runActionsList(attributeProps.actions_list.saveValue, [value], {
              ...ctx,
              attribute: attributeProps,
              recordId,
              library
          })
        : [value];

    preparedValues.map(async preparedValue => {
        if (preparedValue.metadata) {
            try {
                for (const metaFieldName of Object.keys(preparedValue.metadata)) {
                    const metaFieldProps = await deps.attributeDomain.getAttributeProperties({id: metaFieldName, ctx});

                    if (metaFieldProps?.actions_list?.[ActionsListEvents.SAVE_VALUE]) {
                        const processedMetaValue = await deps.actionsListDomain.runActionsList(
                            metaFieldProps.actions_list[ActionsListEvents.SAVE_VALUE],
                            [{payload: preparedValue.metadata[metaFieldName]}],
                            {
                                ...ctx,
                                attribute: metaFieldProps,
                                recordId,
                                library
                            }
                        );
                        preparedValue.metadata[metaFieldName] = processedMetaValue[0].payload;
                    }
                }
            } catch (e) {
                if (!(e instanceof ValidationError)) {
                    deps.utils.rethrow(e);
                }

                e.fields = {metadata: {...e.fields}};

                deps.utils.rethrow(e);
            }
        }
    });

    return preparedValues;
};
