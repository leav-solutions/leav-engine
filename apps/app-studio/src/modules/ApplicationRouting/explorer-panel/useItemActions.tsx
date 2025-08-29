// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer, useLang} from '@leav/ui';
import {ComponentProps} from 'react';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {FaPlus} from 'react-icons/fa';
import {recordSearchParamsName, routes} from '../routes';
import {ItemActions} from '../types';
import {localizedTranslation} from '@leav/utils';

export const useItemActions = ({actions}: {actions: ItemActions}) => {
    const {lang} = useLang();
    const navigate = useNavigate();
    const {panelId} = useParams();

    const itemActions: ComponentProps<typeof Explorer>['itemActions'] = actions.map(action => ({
        icon: <FaPlus />,
        label: localizedTranslation(action.what.name, lang),
        callback: item => {
            const query = new URLSearchParams({[recordSearchParamsName]: item.itemId});

            // TODO: When we will address the feature to open a popup trough a popup panel, we might need to use routes.panel/routes.popupPanel instead of routes.popupPanel
            const {route, params} = {
                popup: {route: routes.popupPanel, params: {panelId, popupPanelId: action.what.id}},
                slider: {route: routes.sliderPanel, params: {panelId, sliderPanelId: action.what.id}},
                fullpage: {route: routes.panel, params: {panelId: action.what.id}}
            }[action.where];

            return navigate(generatePath(route, params) + '?' + query.toString());
        }
    }));

    return {itemActions};
};
