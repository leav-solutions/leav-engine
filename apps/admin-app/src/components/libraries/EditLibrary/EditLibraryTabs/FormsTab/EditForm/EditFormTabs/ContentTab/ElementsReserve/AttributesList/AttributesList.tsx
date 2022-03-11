// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React from 'react';
import {getAttributesQuery} from '../../../../../../../../../../queries/attributes/getAttributesQuery';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../../../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../../../../../../../../shared/Loading';
import {useFormBuilderReducer} from '../../formBuilderReducer/hook/useFormBuilderReducer';
import ReserveAttribute from './ReserveAttribute';

function AttributesList(): JSX.Element {
    // Get library attributes
    const {state} = useFormBuilderReducer();
    const {error, loading, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: {libraries: [state.library]}
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="error">ERROR {error}</div>;
    }

    return (
        <>
            {(data?.attributes?.list ?? []).map(a => (
                <ReserveAttribute key={a.id} attribute={a} />
            ))}
        </>
    );
}

export default AttributesList;
