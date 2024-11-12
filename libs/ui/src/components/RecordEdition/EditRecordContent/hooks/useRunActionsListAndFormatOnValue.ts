// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useRunActionsListAndFormatOnValueLazyQuery} from '_ui/_gqlTypes';
import {IValueToSubmit} from '../_types';
import {objectToNameValueArray} from '@leav/utils';
import {IValueVersion} from '_ui/types';

export const useRunActionsListAndFormatOnValue = () => {
    const [runActionsListAndFormatOnValueLazyQuery, {loading, error}] = useRunActionsListAndFormatOnValueLazyQuery();

    const runActionsListAndFormatOnValue = async (
        library: string,
        valueToProcess: IValueToSubmit,
        version: IValueVersion
    ) => {
        const result = await runActionsListAndFormatOnValueLazyQuery({
            variables: {
                library,
                value: {
                    attribute: valueToProcess.attribute,
                    payload: valueToProcess.value !== null ? String(valueToProcess.value) : null,
                    metadata: valueToProcess.metadata
                        ? objectToNameValueArray(valueToProcess.metadata).map(({name, value}) => ({
                              name,
                              value: String(value)
                          }))
                        : null
                },
                version: version
                    ? objectToNameValueArray(version).map(v => ({treeId: v.name, treeNodeId: v.value.id}))
                    : null
            }
        });

        return result.data.runActionsListAndFormatOnValue?.[0] ?? null;
    };

    return {runActionsListAndFormatOnValue, loading, error};
};
