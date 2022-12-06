// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {
    GET_ATTRIBUTES,
    GET_ATTRIBUTESVariables,
    GET_ATTRIBUTES_attributes_list_LinkAttribute
} from '../../../_gqlTypes/GET_ATTRIBUTES';
import AttributeSelectorField from './AttributeSelectorField';

interface IAttributeSelectorProps extends FormDropdownProps {
    filters?: GET_ATTRIBUTESVariables;
    excludeReverseLinks?: boolean;
}

function AttributeSelector({
    filters = {},
    excludeReverseLinks = false,
    ...fieldProps
}: IAttributeSelectorProps): JSX.Element {
    const {loading, error: queryError, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: filters
    });

    if (queryError) {
        return <ErrorDisplay message={queryError.message} />;
    }

    let attributes = data?.attributes?.list || [];

    // don't get reverse links if specified
    if (excludeReverseLinks) {
        attributes = attributes.filter(a => !(a as GET_ATTRIBUTES_attributes_list_LinkAttribute).reverse_link);
    }

    return <AttributeSelectorField {...fieldProps} loading={loading} attributes={attributes} />;
}

export default AttributeSelector;
