import {type SubscriptionHookOptions, useSubscription} from '@apollo/client';
import {getTreeEvents} from '../../graphQL/subscribes/trees/getTreeEvents';
import {type TreeEventFiltersInput} from '../../_gqlTypes';
import {type TREE_EVENTS, type TREE_EVENTSVariables} from '../../_gqlTypes/TREE_EVENTS';

export const useTreeEventsSubscription = (params: {
    filters: TreeEventFiltersInput;
    skip?: boolean;
    onData: SubscriptionHookOptions['onData'];
}) => {
    const {filters, skip, onData} = params;
    return useSubscription<TREE_EVENTS, TREE_EVENTSVariables>(getTreeEvents, {
        variables: {filters},
        skip,
        onData,
    });
};
