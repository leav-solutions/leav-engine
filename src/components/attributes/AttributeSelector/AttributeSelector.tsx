import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../shared/Loading';
import AttributeSelectorField from './AttributeSelectorField';

interface IAttributeSelectorProps extends FormDropdownProps {
    filters?: GET_ATTRIBUTESVariables;
}

function AttributeSelector({filters = {}, ...fieldProps}: IAttributeSelectorProps): JSX.Element {
    const {loading, error: queryError, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: filters
    });

    if (loading) {
        return <Loading />;
    }

    if (queryError) {
        return <div data-test-id="error">Error {queryError.message}</div>;
    }

    const attributes = data?.attributes?.list || [];

    return <AttributeSelectorField {...fieldProps} attributes={attributes} />;
}

export default AttributeSelector;
