// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {getAttributesQuery} from '../../../../../../../../../../queries/attributes/getAttributesQuery';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../../../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../../../../../../../../shared/Loading';
import {IFormBuilderStateAndDispatch} from '../../formBuilderReducer/formBuilderReducer';
import ReserveAttribute from './ReserveAttribute';

function AttributesList({state, dispatch}: IFormBuilderStateAndDispatch): JSX.Element {
    // Get library attributes
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
                <ReserveAttribute key={a.id} attribute={a} state={state} dispatch={dispatch} />
            ))}
        </>
    );
}

export default AttributesList;
