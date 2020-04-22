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
    recordId: number;
    infos?: IQueryInfos;
    keepEmpty: boolean;
    deps: {
        actionsListDomain: IActionsListDomain;
        attributeDomain: IAttributeDomain;
        utils: IUtils;
    };
    ctx: IQueryInfos;
}

export default async (params: IPrepareValueParams): Promise<IValue> => {
    const {attributeProps, value, library, recordId, deps, ctx} = params;

    // Execute actions list. Output value might be different from input value
    const preparedValue =
        !!attributeProps.actions_list && !!attributeProps.actions_list.saveValue
            ? await deps.actionsListDomain.runActionsList(attributeProps.actions_list.saveValue, value, {
                  attribute: attributeProps,
                  recordId,
                  library
              })
            : value;

    if (preparedValue.metadata) {
        try {
            for (const metaFieldName of Object.keys(preparedValue.metadata)) {
                const metaFieldProps = await deps.attributeDomain.getAttributeProperties({id: metaFieldName, ctx});

                if (metaFieldProps?.actions_list?.[ActionsListEvents.SAVE_VALUE]) {
                    const processedMetaValue = await deps.actionsListDomain.runActionsList(
                        metaFieldProps.actions_list[ActionsListEvents.SAVE_VALUE],
                        {value: preparedValue.metadata[metaFieldName]},
                        {
                            attribute: metaFieldProps,
                            recordId,
                            library
                        }
                    );
                    preparedValue.metadata[metaFieldName] = processedMetaValue.value;
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

    return preparedValue;
};
