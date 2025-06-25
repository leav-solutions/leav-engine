// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError} from '@apollo/client';
import {objectToNameValueArray, Override} from '@leav/utils';
import React from 'react';
import {IValueVersion} from '_ui/types/values';
import {
    RecordFormElementFragment,
    RecordFormQuery,
    RecordFormQueryResult,
    useRecordFormQuery,
    useRecordFormWithoutValuesQuery,
    ValueDetailsLinkValueFragment,
    ValueDetailsTreeValueFragment,
    ValueDetailsValueFragment
} from '_ui/_gqlTypes';
import {getRecordFormWithoutValuesQuery} from '_ui/_queries/records/getRecordFormWithoutValuesQuery';

export type RecordFormElementsValueStandardValue = Override<
    ValueDetailsValueFragment,
    {
        version?: IValueVersion;
        metadata?: Array<{
            name: string;
            value: Override<ValueDetailsValueFragment['metadata'][number]['value'], {version?: IValueVersion}>;
        }>;
        attribute?: ValueDetailsValueFragment['attribute'];
    }
>;

export type RecordFormElementsValueLinkValue = Override<
    ValueDetailsLinkValueFragment,
    {
        version?: IValueVersion;
        metadata?: Array<{
            name: string;
            value: Override<ValueDetailsLinkValueFragment['metadata'][number]['value'], {version?: IValueVersion}>;
        }>;
        attribute?: ValueDetailsValueFragment['attribute'];
    }
>;

export type RecordFormElementsValueTreeValue = Override<
    ValueDetailsTreeValueFragment,
    {
        version?: IValueVersion;
        metadata?: Array<{
            name: string;
            value: Override<ValueDetailsTreeValueFragment['metadata'][number]['value'], {version?: IValueVersion}>;
        }>;
        attribute?: ValueDetailsValueFragment['attribute'];
    }
>;

export type RecordFormElementsValue =
    | RecordFormElementsValueStandardValue
    | RecordFormElementsValueLinkValue
    | RecordFormElementsValueTreeValue;

export type RecordFormElement = Override<
    RecordFormElementFragment,
    {
        values: RecordFormElementsValue[];
    }
>;

export type IRecordForm = Override<
    RecordFormQuery['recordForm'],
    {
        elements: RecordFormElement[];
    }
>;

export type RecordFormElementAttribute = RecordFormElement['attribute'];

export interface IUseGetRecordFormHook {
    loading: boolean;
    error: ApolloError;
    recordForm: IRecordForm;
    refetch: RecordFormQueryResult['refetch'];
}

const useGetRecordForm = ({
    libraryId,
    recordId,
    formId,
    version
}: {
    libraryId: string;
    recordId: string;
    formId: string;
    version: IValueVersion;
}): IUseGetRecordFormHook => {
    const [recordForm, setRecordForm] = React.useState<any>(null);

    const requestVersion = version
        ? objectToNameValueArray(version)
              .filter(arrayVersion => !!arrayVersion.value)
              .map(({name, value}) => ({
                  treeId: name,
                  treeNodeId: value.id
              }))
        : null;

    const {loading, error, refetch} = useRecordFormWithoutValuesQuery({
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        variables: {
            libraryId,
            recordId,
            formId,
            version: requestVersion
        },
        onCompleted: data => {
            // console.log('data', data, data.recordForm.elements);

            const recordFormFormatted: IRecordForm = {
                ...data.recordForm,
                elements: data.recordForm.elements.map(
                    (element): RecordFormElement => ({
                        ...element,
                        values: []
                    })
                )
            };

            setRecordForm(recordFormFormatted);

            // Transform result to format values version to a more convenient object
            // const recordFormFormatted: IRecordForm = {
            //     ...data.recordForm
            // elements: data.recordForm.elements
            // elements: data.recordForm.elements.map(
            //     (element): RecordFormElement => ({
            //         ...element,
            //         values: (element?.values ?? []).map(value => ({
            //             ...value,
            //             version: arrayValueVersionToObject(value.version ?? []),
            //             metadata: (value.metadata ?? []).map(metadata => ({
            //                 ...metadata,
            //                 value: {
            //                     ...metadata.value,
            //                     version: arrayValueVersionToObject(metadata.value?.version ?? [])
            //                 }
            //             }))
            //         }))
            //     })
            // )
            // };
        }
    });

    const refetchRecordForm = () =>
        refetch({
            libraryId,
            recordId,
            formId,
            version: requestVersion
        });

    // To avoid a moment where loading is done and record form is not available yet, we force loading to be true until
    // record form is available
    return {loading: loading || (!recordForm && !error), error, recordForm, refetch: refetchRecordForm};
};

export default useGetRecordForm;
