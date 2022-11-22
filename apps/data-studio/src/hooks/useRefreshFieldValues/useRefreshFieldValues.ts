// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import {getGraphqlQueryNameFromLibraryName, objectToNameValueArray} from '@leav/utils';
import {
    getRecordPropertiesQuery,
    IGetRecordProperties,
    IGetRecordPropertiesVariables,
    RecordProperty
} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {arrayValueVersionToObject} from 'utils';
import {IValueVersion} from '_types/types';

export interface IUseRefetchFieldValuesHook {
    fetchValues: (version?: IValueVersion) => Promise<RecordProperty[]>;
}

const useRefreshFieldValues = (
    libraryId: string,
    attributeId: string,
    recordId: string
): IUseRefetchFieldValuesHook => {
    const libraryGqlName = getGraphqlQueryNameFromLibraryName(libraryId);
    const [getRecordProperty] = useLazyQuery<IGetRecordProperties, IGetRecordPropertiesVariables>(
        getRecordPropertiesQuery(libraryGqlName, [
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
                    recordId,
                    version: version
                        ? objectToNameValueArray(version).map(v => ({treeId: v.name, treeNodeId: v.value.id}))
                        : null
                }
            });

            if (!res.data[libraryGqlName].list.length) {
                return null;
            }

            return res.data[libraryGqlName].list[0][attributeId].map(value => ({
                ...value,
                version: arrayValueVersionToObject(value.version ?? [])
            }));
        }
    };
};

export default useRefreshFieldValues;
