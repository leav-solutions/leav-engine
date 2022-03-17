// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import moment from 'moment';
import {IQueryInfos} from '_types/queryInfos';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {ITreeValue, IValue} from '../../../_types/value';
import doesValueExist from './doesValueExist';

export default async (
    library: string,
    recordId: string,
    attribute: IAttribute,
    value: IValue,
    deps: {
        valueRepo: IValueRepo;
        recordRepo: IRecordRepo;
        actionsListDomain: IActionsListDomain;
        attributeDomain: IAttributeDomain;
    },
    ctx: IQueryInfos
): Promise<IValue> => {
    const valueExists = doesValueExist(value, attribute);

    const valueToSave = {
        ...value,
        modified_at: moment().unix()
    };

    if (!valueExists) {
        valueToSave.created_at = moment().unix();
    }

    let reverseLink: IAttribute;
    if (!!attribute.reverse_link) {
        reverseLink = await deps.attributeDomain.getAttributeProperties({
            id: attribute.reverse_link as string,
            ctx
        });
    }

    const savedVal = valueExists
        ? await deps.valueRepo.updateValue({
              library,
              recordId,
              attribute: {...attribute, reverse_link: reverseLink},
              value: valueToSave,
              ctx
          })
        : await deps.valueRepo.createValue({
              library,
              recordId,
              attribute: {...attribute, reverse_link: reverseLink},
              value: valueToSave,
              ctx
          });

    // Apply actions list on value
    const processedValue = attribute?.actions_list?.[ActionsListEvents.GET_VALUE]
        ? await deps.actionsListDomain.runActionsList(
              attribute?.actions_list?.[ActionsListEvents.GET_VALUE],
              savedVal,
              ctx
          )
        : savedVal;

    if (attribute.type === AttributeTypes.TREE) {
        (processedValue.value as ITreeValue).treeId = attribute.linked_tree;
    }

    return {...savedVal, value: processedValue.value, raw_value: savedVal.value, attribute: attribute.id};
};
