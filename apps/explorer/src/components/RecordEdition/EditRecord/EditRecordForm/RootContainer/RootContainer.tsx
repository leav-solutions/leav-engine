// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {FormUIElementTypes, IFormLinkFieldSettings} from '@leav/types';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {
    getRecordPropertiesQuery,
    IGetRecordProperties,
    IGetRecordPropertiesVariables,
    IRecordPropertiesField
} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute_LinkAttribute} from '_gqlTypes/GET_FORM';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {IRecordIdentityWhoAmI} from '_types/types';
import EditRecordSkeleton from '../../EditRecordSkeleton';
import {useFormElementsByContainerContext} from '../../hooks/useFormElementsByContainerContext';
import {formComponents} from '../../uiElements';
import {FormElement} from '../../_types';

interface IRootContainerProps {
    record: IRecordIdentityWhoAmI;
}

function RootContainer({record}: IRootContainerProps): JSX.Element {
    const formElements = useFormElementsByContainerContext();

    const rootElement: FormElement<{}> = {
        id: '__root',
        containerId: null,
        type: FormElementTypes.layout,
        uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
        settings: {},
        attribute: null,
        uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER]
    };

    const allFields = Object.keys(formElements).reduce(
        (fields, containerKey): IRecordPropertiesField[] => [
            ...fields,
            ...formElements[containerKey]
                .filter(elem => elem.type === FormElementTypes.field)
                .map(
                    (elem): IRecordPropertiesField => {
                        return {
                            attributeId: elem.attribute.id,
                            linkedAttributes: Array.isArray((elem.settings as IFormLinkFieldSettings).columns)
                                ? (elem.settings as IFormLinkFieldSettings).columns.map(c => c.id)
                                : [],
                            linkedLibrary:
                                (elem.attribute as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute)
                                    .linked_library ?? null
                        };
                    }
                )
        ],
        []
    );

    const recordPropertiesQuery = getRecordPropertiesQuery(record.library.gqlNames.query, allFields);

    const {loading, error, data} = useQuery<IGetRecordProperties, IGetRecordPropertiesVariables>(
        recordPropertiesQuery,
        {variables: {recordId: record.id}}
    );

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const recordValues = data?.[record.library.gqlNames.query]?.list?.[0] ?? {};

    return <rootElement.uiElement element={rootElement} record={record} recordValues={recordValues} />;
}

export default RootContainer;
