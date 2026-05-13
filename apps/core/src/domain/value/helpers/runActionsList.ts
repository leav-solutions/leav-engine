import {type IActionsListDomain} from '../../actionsList/actionsListDomain';
import {type IUtils} from '../../../utils/utils';
import {ErrorTypes} from '../../../_types/errors';
import {type IValue} from '../../../_types/value';
import {type IRunActionListParams} from '../_types';

export type RunActionsListHelper = (params: IRunActionListParams) => Promise<IValue[]>;

export interface IRunActionsListHelperDeps {
    'core.domain.actionsList': IActionsListDomain;
    'core.utils': IUtils;
}

export default function ({
    'core.domain.actionsList': actionsListDomain,
    'core.utils': utils,
}: IRunActionsListHelperDeps): RunActionsListHelper {
    return async ({listName, values, attribute, record, library, ctx}) => {
        const valuesToProcess = utils.isStandardAttribute(attribute)
            ? values.map(value => ({...value, raw_payload: value.payload}))
            : values;

        try {
            const processedValues =
                !!attribute.actions_list?.[listName] && values !== null
                    ? await actionsListDomain.runActionsList(attribute.actions_list[listName], valuesToProcess, {
                          ...ctx,
                          attribute,
                          recordId: record?.id,
                          library,
                          actionEvent: listName,
                      })
                    : valuesToProcess;
            return processedValues;
        } catch (e) {
            if (e.type === ErrorTypes.VALIDATION_ERROR) {
                e.context = {
                    attribute: attribute.id,
                    values,
                    recordId: record?.id,
                };
            }
            throw e;
        }
    };
}
