// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps} from 'react';
import {Explorer} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {generatePath} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {recordSearchParamsName, routes} from '../routes';
import {ItemActions} from '../types';

export const mapperToItemActions = ({
    actions,
    lang,
    navigate,
    panelId
}: {
    actions: ItemActions;
    lang: string[];
    navigate: (path: string) => void;
    panelId: string;
}): ComponentProps<typeof Explorer>['itemActions'] =>
    actions.map(action => {
        // As suggested by FontAwesome documentation, we need this workaround to use the string notation
        // More info: https://docs.fontawesome.com/web/use-with/react/add-icons#workaround
        // @ts-expect-error: Type 'string' is not assignable to type 'IconProp'
        const icon: IconProp = `fa-solid ${action.what.icon ? action.what.icon : 'fa-star-of-life'}`;

        return {
            icon: <FontAwesomeIcon icon={icon} />,
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
        };
    });
