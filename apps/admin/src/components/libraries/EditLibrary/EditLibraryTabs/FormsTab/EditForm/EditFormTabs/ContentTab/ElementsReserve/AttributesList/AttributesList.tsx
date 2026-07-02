import {type GET_ATTRIBUTES_attributes_list} from '../../../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../../../../../../../../shared/Loading';
import {useFormBuilderReducer} from '../../formBuilderReducer/hook/useFormBuilderReducer';
import ReserveAttribute from './ReserveAttribute';
import {useGetAttributesQuery} from '../../../../../../../../../../_gqlTypes';

function AttributesList(): JSX.Element {
    // Get library attributes
    const {state} = useFormBuilderReducer();
    const {error, loading, data} = useGetAttributesQuery({
        variables: {libraries: [state.library]},
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="error">ERROR {error.message}</div>;
    }

    return (
        <>
            {(data?.attributes?.list ?? []).map(a => (
                <ReserveAttribute key={a.id} attribute={a as GET_ATTRIBUTES_attributes_list} />
            ))}
        </>
    );
}

export default AttributesList;
