// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React from 'react';
import {getAvailableActionsQuery} from '../../../../../queries/attributes/getAvailableActionsQuery';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {GET_AVAILABLE_ACTIONS} from '../../../../../_gqlTypes/GET_AVAILABLE_ACTIONS';
import Loading from '../../../../shared/Loading';
import ALCContainer from './ALCContainer';
import {IReserveAction} from './interfaces/interfaces';
import {generateReserveActionFrom} from './utils/generatingFunction';

interface IActionListConfigurerProps {
    attribute: GET_ATTRIBUTES_attributes_list;
}

function ActionsListTab({attribute}: IActionListConfigurerProps): JSX.Element {
    const {loading, error, data} = useQuery<GET_AVAILABLE_ACTIONS, GET_ATTRIBUTES_attributes_list>(
        getAvailableActionsQuery
    );

    if (loading) {
        return <Loading />;
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }
    if (!data) {
        return <></>;
    }

    const actions: IReserveAction[] = [];
    // const inType = attribute.format ? getTypeFromFormat(attribute.format) : '';

    if (data.availableActions) {
        data.availableActions.forEach(act => {
            const action: IReserveAction | null = generateReserveActionFrom(act);
            if (action) {
                actions.push(action);
            }
        });
    }

    return <ALCContainer availableActions={actions} attribute={attribute} />;
}

export default ActionsListTab;
