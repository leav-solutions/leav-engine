// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generatePath, useLocation, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {PanelSchema} from '_ui/hooks/useIFrameMessenger/schema';
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
        let recordIdSearch = search;

        if ('what' in data) {
            const result = PanelSchema.safeParse(data.what);
            if (!result.success) {
                console.error('[DEV ONLY] Invalid panel schema: ', result.error.message);
                return;
            }
            where = data.where;
            const panelTargetId = data.panelTargetId ?? data.what.id;
            routeParamsMap.popup = {route: routes.popupPanel, params: {panelId, popupPanelId: panelTargetId}};
            routeParamsMap.slider = {route: routes.sliderPanel, params: {panelId, sliderPanelId: panelTargetId}};
            routeParamsMap.fullpage = {route: routes.panel, params: {panelId: panelTargetId}};
            addPanel(data.what, {workspaceId: currentWorkspace.id, panelId});
            if (data.where === 'fullpage' && data.recordId !== undefined) {
                recordIdSearch = `?${new URLSearchParams({recordId: data.recordId}).toString()}`;
            }
        } else {
            routeParamsMap.fullpage = {route: routes.panel, params: {panelId: data.panelId}};
        }

        const {route, params} = routeParamsMap[where];

        return navigate(generatePath(route, params) + recordIdSearch);
    };

    return {
        navigateToPanel
    };
};
