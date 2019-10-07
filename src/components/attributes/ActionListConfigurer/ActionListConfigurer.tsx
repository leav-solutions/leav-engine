import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import ALCContainer from './ALCContainer';
import {useQuery} from '@apollo/react-hooks';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {GET_AVAILABLE_ACTIONS} from '../../../_gqlTypes/GET_AVAILABLE_ACTIONS';
import {getAvailableActionsQuery} from '../../../queries/attributes/getAvailableActionsQuery';
import {getTypeFromFormat} from './utils/actionsManipulations';

import {IReserveAction} from './interfaces/interfaces';
import Loading from '../../shared/Loading';

import {generateReserveActionFrom} from './utils/generatingFunction';

interface IActionListConfigurerProps extends WithNamespaces {
    attribute: GET_ATTRIBUTES_attributes_list;
}

function ActionListConfigurer({attribute, i18n, t}: IActionListConfigurerProps): JSX.Element {
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
        return <></>
    }

    const actions: IReserveAction[] = [];
    const inType = attribute.format ? getTypeFromFormat(attribute.format) : '';

    if (data.availableActions) {
        data.availableActions.forEach(act => {
            const action: IReserveAction | null = generateReserveActionFrom(act);
            if (action) {
                actions.push(action);
            }
        });
    }

    return (
        <ALCContainer
            availableActions={actions}
            attribute={attribute}
            inType={inType ? [inType] : []}
            outType={inType ? [inType] : []}
        />
    );
}

export default withNamespaces()(ActionListConfigurer);
