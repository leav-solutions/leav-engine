// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {AttributeType} from '_gqlTypes/globalTypes';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {
    GET_ATTRIBUTES,
    GET_ATTRIBUTESVariables,
    GET_ATTRIBUTES_attributes_list_LinkAttribute
} from '../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../shared/Loading';
import AttributeSelectorField from './AttributeSelectorField';

interface IAttributeSelectorProps extends FormDropdownProps {
    filters?: GET_ATTRIBUTESVariables;
    reverseLinks?: boolean;
}

function AttributeSelector({
    filters = {},
    excludeReverseLinks = false,
    ...fieldProps
}: IAttributeSelectorProps): JSX.Element {
    const {loading, error: queryError, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: filters
    });

    if (loading) {
        return <Loading />;
    }

    if (queryError) {
        return <div data-test-id="error">Error {queryError.message}</div>;
    }

    let attributes = data?.attributes?.list || [];

    // don't get reverse links if specified
    if (excludeReverseLinks) {
        attributes = attributes.filter(a => !(a as GET_ATTRIBUTES_attributes_list_LinkAttribute).reverse_link);
    }

    return <AttributeSelectorField {...fieldProps} attributes={attributes} />;
}

export default AttributeSelector;
