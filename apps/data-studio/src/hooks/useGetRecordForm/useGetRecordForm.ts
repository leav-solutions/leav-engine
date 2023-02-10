// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError, useQuery} from '@apollo/client';
import {objectToNameValueArray, Override} from '@leav/utils';
import {getRecordFormQuery} from 'graphQL/queries/forms/getRecordFormQuery';
import React from 'react';
import {arrayValueVersionToObject} from 'utils';
import {
    RECORD_FORM,
    RECORD_FORMVariables,
    RECORD_FORM_recordForm,
    RECORD_FORM_recordForm_elements,
    RECORD_FORM_recordForm_elements_values_LinkValue,
    RECORD_FORM_recordForm_elements_values_TreeValue,
    RECORD_FORM_recordForm_elements_values_Value
} from '_gqlTypes/RECORD_FORM';
import {IValueVersion} from '_types/types';

export type RecordFormElementsValueStandardValue = Override<
    RECORD_FORM_recordForm_elements_values_Value,
    {version: IValueVersion}
>;
export type RecordFormElementsValueLinkValue = Override<
    RECORD_FORM_recordForm_elements_values_LinkValue,
    {version: IValueVersion}
>;
export type RecordFormElementsValueTreeValue = Override<
    RECORD_FORM_recordForm_elements_values_TreeValue,
    {version: IValueVersion}
>;

export type RecordFormElementsValue =
    | RecordFormElementsValueStandardValue
    | RecordFormElementsValueLinkValue
    | RecordFormElementsValueTreeValue;

export type RecordFormElement = Override<
    RECORD_FORM_recordForm_elements,
    {
        values: RecordFormElementsValue[];
    }
>;

export type IRecordForm = Override<
    RECORD_FORM_recordForm,
    {
        elements: RecordFormElement[];
    }
>;

export interface IUseGetRecordFormHook {
    loading: boolean;
    error: ApolloError;
    recordForm: IRecordForm;
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
    const [recordForm, setRecordForm] = React.useState<IRecordForm>(null);

    const requestVersion = version
        ? objectToNameValueArray(version)
              .filter(arrayVersion => !!arrayVersion.value)
              .map(({name, value}) => ({
                  treeId: name,
                  treeNodeId: value.id
              }))
        : null;

    const {loading, error} = useQuery<RECORD_FORM, RECORD_FORMVariables>(getRecordFormQuery, {
        fetchPolicy: 'network-only',
        variables: {
            libraryId,
            recordId,
            formId,
            version: requestVersion
        },
        onCompleted: data => {
            // Transform result to format values version to a more convenient object
            const recordFormFormatted: IRecordForm = {
                ...data.recordForm,
                elements: data.recordForm.elements.map(element => {
                    return {
                        ...element,
                        values: (element?.values ?? []).map(value => {
                            return {
                                ...value,
                                version: arrayValueVersionToObject(value.version ?? [])
                            };
                        })
                    };
                })
            };

            setRecordForm(recordFormFormatted);
        }
    });

    // To avoid a moment where loading is done and record form is not available yet, we force loading to be true until
    // record form is available
    return {loading: loading || (!recordForm && !error), error, recordForm};
};

export default useGetRecordForm;
