// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SubscriptionHookOptions, useSubscription} from '@apollo/client';
import {getTreeEvents} from 'graphQL/subscribes/trees/getTreeEvents';
import {TreeEventFiltersInput} from '_gqlTypes/globalTypes';
import {TREE_EVENTS, TREE_EVENTSVariables} from '_gqlTypes/TREE_EVENTS';

export const useTreeEventsSubscription = (params: {
    filters: TreeEventFiltersInput;
    skip?: boolean;
    onData: SubscriptionHookOptions['onData'];
}) => {
    const {filters, skip, onData} = params;
    return useSubscription<TREE_EVENTS, TREE_EVENTSVariables>(getTreeEvents, {
        variables: {filters},
        skip,
        onData
    });
};
