// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import {objectToNameValueArray} from '@leav/utils';
import {IValueVersion} from '_ui/types/values';
import {
    getRecordPropertiesQuery,
    IGetRecordProperties,
    IGetRecordPropertiesVariables,
    RecordProperty
} from '_ui/_queries/records/getRecordPropertiesQuery';
import {arrayValueVersionToObject} from '_ui/_utils';
import {hasTypename} from '_ui/_utils/typeguards';

export interface IUseRefetchFieldValuesHook {
    fetchValues: (version?: IValueVersion) => Promise<RecordProperty[]>;
}

const useRefreshFieldValues = (
    libraryId: string,
    attributeId: string,
    recordId: string
): IUseRefetchFieldValuesHook => {
    const [getRecordProperty] = useLazyQuery<IGetRecordProperties, IGetRecordPropertiesVariables>(
        getRecordPropertiesQuery([
            {
                attributeId
            }
        ]),
        {
            fetchPolicy: 'network-only'
        }
    );

    return {
        fetchValues: async (version?: IValueVersion) => {
            const res = await getRecordProperty({
                variables: {
                    library: libraryId,
                    recordId,
                    version: version
                        ? objectToNameValueArray(version).map(v => ({treeId: v.name, treeNodeId: v.value.id}))
                        : null
                }
            });

            if (!res.data.records.list.length) {
                return null;
            }

            const values = res.data.records.list[0][attributeId].map(value => {
                // Clear off __typename
                const data = {...value};
                if (hasTypename(data)) {
                    delete data.__typename;
                }

                return {
                    ...data,
                    version: arrayValueVersionToObject(value.version ?? [])
                };
            });
            return values;
        }
    };
};

export default useRefreshFieldValues;
