// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {FormUIElementTypes} from '@leav/types';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {
    getRecordDependenciesValuesQuery,
    IGetRecordDependenciesValue,
    IGetRecordDependenciesValues,
    IGetRecordDependenciesValuesVariables
} from 'queries/forms/getRecordDependenciesValuesQuery';
import React from 'react';
import {GET_FORM_forms_list} from '_gqlTypes/GET_FORM';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {IRecordIdentityWhoAmI} from '_types/types';
import EditRecordSkeleton from '../EditRecordSkeleton';
import convertDependenciesRecordValues from '../helpers/convertDependenciesRecordValues';
import extractFormElements from '../helpers/extractFormElements';
import {FormElementsContext} from '../hooks/useFormElementsContext';
import {formComponents} from '../uiElements';
import {FormElement} from '../_types';

interface IEditRecordFormProps {
    form: GET_FORM_forms_list;
    record: IRecordIdentityWhoAmI;
}

const _recordValuesToDependenciesValues = (
    recordValues: IGetRecordDependenciesValue | IGetRecordDependenciesValue[]
) => {
    const valuesArray = Array.isArray(recordValues) ? recordValues : [recordValues];

    return valuesArray.reduce(
        (attributeValues, attributeValue) => [
            ...attributeValues,
            ...attributeValue.ancestors.map(ancestor => ({
                id: ancestor.record.id,
                library: ancestor.record.library.id
            }))
        ],
        []
    );
};

function EditRecordForm({form, record}: IEditRecordFormProps): JSX.Element {
    const depAttributes = form.dependencyAttributes.map(dependencyAttribute => dependencyAttribute.id);
    const dependenciesValuesQuery = getRecordDependenciesValuesQuery(record.library.gqlNames.query, depAttributes);

    const {loading, error, data} = useQuery<IGetRecordDependenciesValues, IGetRecordDependenciesValuesVariables>(
        dependenciesValuesQuery,
        {
            skip: !form.dependencyAttributes.length,
            variables: {id: record.id}
        }
    );

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error) {
        return <ErrorDisplay message={error?.message ?? ''} />;
    }

    // Convert record values to a more exploitable format
    const recordValues = data?.record?.list?.[0] ?? {};
    const dependenciesValues = convertDependenciesRecordValues(recordValues, depAttributes);
    const elementsByContainer = extractFormElements(form, dependenciesValues);

    const rootElement: FormElement<{}> = {
        id: '__root',
        containerId: null,
        type: FormElementTypes.layout,
        uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
        settings: {},
        uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER]
    };

    return (
        <FormElementsContext.Provider value={elementsByContainer}>
            <rootElement.uiElement element={rootElement} />
        </FormElementsContext.Provider>
    );
}

export default EditRecordForm;
