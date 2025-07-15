// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {useRoutes} from 'react-router-dom';
import {Loading} from '@leav/ui';
import {routes} from './routes';
import {AddPanel} from './types';
import {addChildPanelToApplication} from './utils';
import {RedirectToFirstPanelOnHome} from './guards/RedirectToFirstPanelOnHome';
import {RedirectToFirstPanelOnInvalidPanel} from './guards/RedirectToFirstPanelOnInvalidPanel';
import {PanelsNavigationMenu} from './navigation-menu/PanelsNavigationMenu';
import {WorkspacesNavigationMenu} from './navigation-menu/WorkspacesNavigationMenu';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/ApplicationSettingsContext';
import {FullPagePanel} from './panel/FullPagePanel';
import {AddModalForPopupPanel} from './panel/AddModalForPopupPanel';
import {PopupPanel} from './panel/PopupPanel';

export const InitApplicationRouter: FunctionComponent = () => {
    const [application, setApplication] = useApplicationSettingsContext();

    const addPanel: AddPanel = (panel, destination) => {
        setApplication(prevApplication => addChildPanelToApplication(panel, prevApplication, destination));
    };

    return useRoutes(
        application === null
            ? [{element: <Loading />, path: '*'}]
            : [
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
                                      element: <FullPagePanel addPanel={addPanel} />,
                                      children: [
                                          {
                                              element: (
                                                  <AddModalForPopupPanel>
                                                      <PanelsNavigationMenu />
                                                  </AddModalForPopupPanel>
                                              ),
                                              children: [
                                                  {
                                                      path: routes.popupPanel,
                                                      element: <PopupPanel addPanel={addPanel} />
                                                  }
                                              ]
                                          }
                                      ]
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
