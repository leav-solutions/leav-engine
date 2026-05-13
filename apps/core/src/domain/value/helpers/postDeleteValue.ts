import {type IActionsListDomain} from '../../actionsList/actionsListDomain';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IUtils} from '../../../utils/utils';
import {type IAttribute} from '../../../_types/attribute';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IValue} from '../../../_types/value';
import {ActionsListEvents} from '../../../_types/actionsList';

/**
 * Parameters for post-delete value processing.
 */
interface IPostDeleteValueParams {
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
 * Executes post-delete action lists on deleted value
 * Action lists can perform side effects
 * Unlike pre-delete value actions, this runs AFTER the value is persisted to the database.
 */
const postDeleteValue = async (params: IPostDeleteValueParams): Promise<void> => {
    const {attribute, value, libraryId, recordId, deps, ctx} = params;

    // Execute post delete value actions list on the deleted value if configured.
    // Action lists can trigger side effects
    // Since the value is already deleted, this is mainly for side effects.
    if (attribute.actions_list?.postDeleteValue) {
        await deps.actionsListDomain.runActionsList(attribute.actions_list.postDeleteValue, [value], {
            ...ctx,
            attribute,
            recordId,
            library: libraryId,
            actionEvent: ActionsListEvents.POST_DELETE_VALUE,
        });
    }
};

export default postDeleteValue;
