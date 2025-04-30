// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
<<<<<<<< HEAD:libs/ui/src/components/Explorer/manage-view-settings/store-view-settings/useViewSettingsContext.ts
import {useContext} from 'react';
import {ViewSettingsContext} from './ViewSettingsContext';

export const useViewSettingsContext = () => useContext(ViewSettingsContext);
========
export const recordSearchParamsName = 'recordId';

export const routes = {
    panel: '/:panelId'
};
>>>>>>>> develop:apps/skeleton-app/src/modules/ApplicationRouting/routes.ts
