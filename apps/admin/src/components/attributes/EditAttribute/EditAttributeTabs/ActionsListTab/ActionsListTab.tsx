// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../../../shared/Loading';
import ALCContainer from './ALCContainer';
import {type IReserveAction} from './interfaces/interfaces';
import {generateReserveActionFrom} from './utils/generatingFunction';
import {useGetAvailableActionsQuery} from '../../../../../_gqlTypes';

interface IActionListConfigurerProps {
    attribute: GET_ATTRIBUTES_attributes_list;
}

function ActionsListTab({attribute}: IActionListConfigurerProps): JSX.Element {
    const {loading, error, data} = useGetAvailableActionsQuery();

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
