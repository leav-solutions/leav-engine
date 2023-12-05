// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient} from '@apollo/client';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    SAVE_VALUE_BATCH_saveValueBatch_values,
    SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue,
    SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue,
    SAVE_VALUE_BATCH_saveValueBatch_values_Value
} from '_gqlTypes/SAVE_VALUE_BATCH';
import {getPropertyCacheFieldName} from '../../utils';

export type IValuesCacheUpdateHook = (
    record: RecordIdentity_whoAmI,
    savedValues: SAVE_VALUE_BATCH_saveValueBatch_values[]
) => void;

export default function (): IValuesCacheUpdateHook {
    const {cache} = useApolloClient();

    return (record, savedValues) => {
        const recordWithTypename = {id: record.id, whoAmI: {...record}, __typename: 'Record'};
        for (const savedValue of savedValues) {
            const propertyCacheFieldName = getPropertyCacheFieldName(savedValue.attribute.id);

            const _updateCacheValue = (
                cacheValue: SAVE_VALUE_BATCH_saveValueBatch_values | SAVE_VALUE_BATCH_saveValueBatch_values[]
            ) => {
                const valueToCache =
                    (savedValue as SAVE_VALUE_BATCH_saveValueBatch_values_Value).value ??
                    (savedValue as SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue).linkValue ??
                    (savedValue as SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue).treeValue ??
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

            cache.modify<SAVE_VALUE_BATCH_saveValueBatch_values>({
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
