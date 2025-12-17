// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {type GET_ATTRIBUTES_VALUES_LIST_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {type ValuesListConfInput} from '../../../../../_gqlTypes/globalTypes';
import {type SAVE_ATTRIBUTE, type SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import Loading from '../../../../shared/Loading';
import ValuesListForm from './ValuesListForm';
import {useGetAttributesValuesListQuery} from '_gqlTypes';

interface IValuesListTabProps {
    attributeId: string;
}

function ValuesListTab({attributeId}: IValuesListTabProps): JSX.Element {
    const {loading, error, data} = useGetAttributesValuesListQuery({variables: {attrId: attributeId}});

    const [saveAttribute, {error: saveError}] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(
        saveAttributeQuery,
    );

    const _handleSubmit = (valuesListConf: ValuesListConfInput) => {
        saveAttribute({variables: {attrData: {id: attributeId, values_list: valuesListConf}}});
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (saveError) {
        return <ErrorDisplay message={saveError.message} />;
    }

    if (!data?.attributes?.list.length) {
        return <div>Unknown attribute</div>;
    }

    return (
        <ValuesListForm
            attribute={data?.attributes?.list[0] as GET_ATTRIBUTES_VALUES_LIST_attributes_list}
            onSubmit={_handleSubmit}
        />
    );
}

export default ValuesListTab;
