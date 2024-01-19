// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient} from '@apollo/client';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {
    ValueDetailsFragment,
    ValueDetailsLinkValueFragment,
    ValueDetailsTreeValueFragment,
    ValueDetailsValueFragment
} from '_ui/_gqlTypes';
import {getPropertyCacheFieldName} from '_ui/_utils';

export type IValuesCacheUpdateHook = (record: IRecordIdentityWhoAmI, savedValues: ValueDetailsFragment[]) => void;

export default function (): IValuesCacheUpdateHook {
    const {cache} = useApolloClient();

    return (record, savedValues) => {
        const recordWithTypename = {id: record.id, whoAmI: {...record}, __typename: 'Record'};
        for (const savedValue of savedValues) {
            const propertyCacheFieldName = getPropertyCacheFieldName(savedValue.attribute.id);

            const _updateCacheValue = (cacheValue: ValueDetailsFragment | ValueDetailsFragment[]) => {
                const valueToCache =
                    (savedValue as ValueDetailsValueFragment).value ??
                    (savedValue as ValueDetailsLinkValueFragment).linkValue ??
                    (savedValue as ValueDetailsTreeValueFragment).treeValue ??
                    null;

                if (Array.isArray(cacheValue)) {
                    const newCacheValue = [...cacheValue];
                    const cacheIndex = cacheValue.findIndex(val => val.id_value === savedValue.id_value);

                    if (cacheIndex !== -1) {
                        newCacheValue[cacheIndex] = valueToCache;
                    } else {
                        newCacheValue.push(valueToCache);
                    }
                } else {
                    // Update the cache value
                    return valueToCache;
                }
            };

            cache.modify<ValueDetailsFragment>({
                id: cache.identify(recordWithTypename),
                broadcast: true,
                fields: {
                    [propertyCacheFieldName]: _updateCacheValue,
                    [savedValue.attribute.id]: _updateCacheValue
                }
            });
        }
    };
}
