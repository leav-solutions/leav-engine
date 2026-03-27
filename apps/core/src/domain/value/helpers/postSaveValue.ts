// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IActionsListDomain} from '../../actionsList/actionsListDomain';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IUtils} from '../../../utils/utils';
import {type IAttribute} from '../../../_types/attribute';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IValue} from '../../../_types/value';
import {ActionsListEvents} from '../../../_types/actionsList';

/**
 * Parameters for post-save value processing.
 */
interface IPostSaveValueParams {
    libraryId: string;
    recordId: string;
    attribute: IAttribute;
    value: IValue;
    ctx: IQueryInfos;
    deps: {
        actionsListDomain: IActionsListDomain;
        attributeDomain: IAttributeDomain;
        utils: IUtils;
    };
}

/**
 * Executes post-save action lists on saved value
 * Action lists can perform side effects
 * Unlike pre-save value actions, this runs AFTER the value is persisted to the database.
 */
const postSaveValue = async (params: IPostSaveValueParams): Promise<void> => {
    const {attribute, value, libraryId, recordId, deps, ctx} = params;

    // Execute post save value actions list on the saved value if configured.
    // Action lists can trigger side effects
    // Since the value is already saved, this is mainly for side effects.
    if (attribute.actions_list?.postSaveValue) {
        await deps.actionsListDomain.runActionsList(attribute.actions_list.postSaveValue, [value], {
            ...ctx,
            attribute,
            recordId,
            library: libraryId,
            actionEvent: ActionsListEvents.POST_SAVE_VALUE,
        });
    }
};

export default postSaveValue;
