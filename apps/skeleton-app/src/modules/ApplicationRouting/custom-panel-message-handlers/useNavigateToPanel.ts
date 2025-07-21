// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generatePath, useLocation, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {routes} from '../routes';
import {AddPanel, IApplicationMatchingContext} from '../types';

export const useNavigateToPanel = (addPanel: AddPanel) => {
    const navigate = useNavigate();
    const {currentWorkspace} = useOutletContext<IApplicationMatchingContext>();
    const {panelId} = useParams();
    const {search} = useLocation();

    const navigateToPanel: IUseIFrameMessengerOptions['handlers']['onNavigateToPanel'] = data => {
        const routeParamsMap: Record<string, {route: string; params: {panelId: string; [key: string]: string}}> = {};
        let where = 'fullpage';

        if ('what' in data) {
            where = data.where;
            routeParamsMap.popup = {route: routes.popupPanel, params: {panelId, popupPanelId: data.what.id}};
            routeParamsMap.slider = {route: routes.sliderPanel, params: {panelId, sliderPanelId: data.what.id}};
            routeParamsMap.fullpage = {route: routes.panel, params: {panelId: data.what.id}};
            addPanel(data.what, {workspaceId: currentWorkspace.id, panelId});
        } else {
            routeParamsMap.fullpage = {route: routes.panel, params: {panelId: data.panelId}};
        }

        const {route, params} = routeParamsMap[where];

        return navigate(generatePath(route, params) + search);
    };

    return {
        navigateToPanel
    };
};
