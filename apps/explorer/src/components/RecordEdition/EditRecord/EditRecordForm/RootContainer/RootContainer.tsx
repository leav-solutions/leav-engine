// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {FormUIElementTypes, ICommonFieldsSettings} from '@leav/types';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {
    getRecordPropertiesQuery,
    IGetRecordProperties,
    IGetRecordPropertiesVariables
} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
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

    const allAttributes: string[] = Object.keys(formElements).reduce(
        (attributes, containerKey) => [
            ...attributes,
            ...formElements[containerKey]
                .filter(elem => elem.type === FormElementTypes.field)
                .map(elem => (elem.settings as ICommonFieldsSettings).attribute)
        ],
        []
    );

    const recordPropertiesQuery = getRecordPropertiesQuery(record.library.gqlNames.query, allAttributes);
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
