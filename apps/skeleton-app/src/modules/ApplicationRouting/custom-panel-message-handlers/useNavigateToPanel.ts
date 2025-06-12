// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generatePath, useNavigate} from 'react-router-dom';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {routes} from '../routes';

export const useNavigateToPanel = () => {
    const navigate = useNavigate();

    const navigateToPanel: IUseIFrameMessengerOptions['handlers']['onNavigateToPanel'] = data => {
        navigate(generatePath(routes.panel, {panelId: data.panelId}));
    };

    return {
        navigateToPanel
    };
};
