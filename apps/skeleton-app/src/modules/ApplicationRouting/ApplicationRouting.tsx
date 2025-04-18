// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useContext} from 'react';
import {useRoutes} from 'react-router-dom';
import {Loading} from '@leav/ui';
import {Application} from './Application';
import {WorkspaceAndPanels} from './WorkspaceAndPanels';
import {PanelComponent} from './Panel';
import {ApplicationContext} from '../workspace-context/ApplicationProvider';

const ApplicationRouting: FunctionComponent = () => {
    const {application} = useContext(ApplicationContext);

    const routing = useRoutes(
        application === null
            ? []
            : [
                  {
                      element: <Application />,
                      children: [
                          {
                              element: <WorkspaceAndPanels />,
                              children: [
                                  {
                                      path: ':panelId',
                                      element: <PanelComponent />
                                  }
                              ]
                          }
                      ]
                  }
              ]
    );

    if (application === null) {
        return <Loading />;
    }

    return routing;
};

export default ApplicationRouting;
