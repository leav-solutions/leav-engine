import ErrorDisplay from '../../../../shared/ErrorDisplay';
import {type GET_ATTRIBUTES_VALUES_LIST_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {
    type ValuesListConfInput,
    useGetAttributesValuesListQuery,
    useSaveAttributeMutation,
} from '../../../../../_gqlTypes';
import Loading from '../../../../shared/Loading';
import ValuesListForm from './ValuesListForm';

interface IValuesListTabProps {
    attributeId: string;
}

function ValuesListTab({attributeId}: IValuesListTabProps): JSX.Element {
    const {loading, error, data} = useGetAttributesValuesListQuery({variables: {attrId: attributeId}});

    const [saveAttribute, {error: saveError}] = useSaveAttributeMutation();

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
