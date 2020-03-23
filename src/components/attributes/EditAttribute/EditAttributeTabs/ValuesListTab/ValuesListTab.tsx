import {useMutation, useQuery} from '@apollo/react-hooks';
import React from 'react';
import {getAttributeValuesListQuery} from '../../../../../queries/attributes/getAttributeValuesListQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {
    GET_ATTRIBUTES_VALUES_LIST,
    GET_ATTRIBUTES_VALUES_LISTVariables
} from '../../../../../_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {ValuesListConfInput} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import Loading from '../../../../shared/Loading';
import ValuesListForm from './ValuesListForm';

interface IValuesListTabProps {
    attributeId: string;
}

function ValuesListTab({attributeId}: IValuesListTabProps): JSX.Element {
    const {loading, error, data} = useQuery<GET_ATTRIBUTES_VALUES_LIST, GET_ATTRIBUTES_VALUES_LISTVariables>(
        getAttributeValuesListQuery,
        {variables: {attrId: attributeId}}
    );

    const [saveAttribute, {error: saveError}] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(
        saveAttributeQuery
    );

    const _handleSubmit = (valuesListConf: ValuesListConfInput) => {
        saveAttribute({variables: {attrData: {id: attributeId, values_list: valuesListConf}}});
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="error">ERROR</div>;
    }

    if (saveError) {
        return <div className="error">SAVE ERROR</div>;
    }

    if (!data?.attributes?.list.length) {
        return <div>Unknown attribute</div>;
    }

    return <ValuesListForm attribute={data?.attributes?.list[0]} onSubmit={_handleSubmit} />;
}

export default ValuesListTab;
