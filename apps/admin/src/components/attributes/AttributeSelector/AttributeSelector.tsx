// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {type FormDropdownProps} from 'semantic-ui-react';
import {
    type GET_ATTRIBUTES_attributes_list,
    type GET_ATTRIBUTESVariables,
    type GET_ATTRIBUTES_attributes_list_LinkAttribute,
} from '../../../_gqlTypes/GET_ATTRIBUTES';
import AttributeSelectorField from './AttributeSelectorField';
import {useGetAttributesQuery} from '_gqlTypes';

interface IAttributeSelectorProps extends FormDropdownProps {
    filters?: GET_ATTRIBUTESVariables;
    excludeReverseLinks?: boolean;
}

function AttributeSelector({
    filters = {},
    excludeReverseLinks = false,
    ...fieldProps
}: IAttributeSelectorProps): JSX.Element {
    const {
        loading,
        error: queryError,
        data,
    } = useGetAttributesQuery({
        variables: filters,
    });

    if (queryError) {
        return <ErrorDisplay message={queryError.message} />;
    }

    let attributes = data?.attributes?.list || [];

    // don't get reverse links if specified
    if (excludeReverseLinks) {
        attributes = attributes.filter(a => !(a as GET_ATTRIBUTES_attributes_list_LinkAttribute).reverse_link);
    }

    return (
        <AttributeSelectorField
            {...fieldProps}
            loading={loading}
            attributes={attributes as GET_ATTRIBUTES_attributes_list[]}
        />
    );
}

export default AttributeSelector;
