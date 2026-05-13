import ErrorDisplay from '../../shared/ErrorDisplay';
import {type FormDropdownProps} from 'semantic-ui-react';
import {
    type GET_ATTRIBUTES_attributes_list,
    type GET_ATTRIBUTESVariables,
    type GET_ATTRIBUTES_attributes_list_LinkAttribute,
} from '../../../_gqlTypes/GET_ATTRIBUTES';
import AttributeSelectorField from './AttributeSelectorField';
import {useGetAttributesQuery} from '../../../_gqlTypes';

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
