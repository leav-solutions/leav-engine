// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import {useRoutes} from 'react-router-dom';
import {Loading} from '@leav/ui';
import {useGetApplicationSkeletonSettingsQuery} from '../../__generated__';
import {routes} from './routes';
import {PanelContent} from './PanelContent';
import {RedirectToFirstPanelOnHome} from './guards/RedirectToFirstPanelOnHome';
import {PanelsNavigationMenu} from './navigation-menu/PanelsNavigationMenu';
import {WorkspacesNavigationMenu} from './navigation-menu/WorkspacesNavigationMenu';
import {RedirectToFirstPanelOnInvalidPanel} from './guards/RedirectToFirstPanelOnInvalidPanel';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';
import {IApplication} from './types';
import {updateApplication} from './utils';

export const InitApplicationRouter: FunctionComponent = () => {
    const {data} = useGetApplicationSkeletonSettingsQuery();

    const [application, setApplication] = useState<IApplication | null>(null);

    useEffect(() => {
        setApplication(data?.applications?.list[0].settings ?? null);
    }, [data?.applications?.list[0].settings]);

    const addPanel = (panel: Panel, workspaceId: string, panelId: string): void => {
        setApplication(prevApplication => updateApplication(prevApplication, panel, workspaceId, panelId));
    };

    return useRoutes(
        application === null
            ? [{element: <Loading />, path: '*'}]
            : [
                  // TODO: add check each workspace has a panel at least
                  {
                      element: <WorkspacesNavigationMenu application={application} />,
                      children: [
                          {
                              element: (
                                  <RedirectToFirstPanelOnInvalidPanel application={application}>
                                      <PanelsNavigationMenu />
                                  </RedirectToFirstPanelOnInvalidPanel>
                              ),
                              children: [
                                  {
                                      path: routes.panel,
                                      element: <PanelContent addPanel={addPanel} />
                                  }
                              ]
                          },
                          {
                              path: '*',
                              element: <RedirectToFirstPanelOnHome application={application} />
                          }
                      ]
                  }
              ]
    );
};
