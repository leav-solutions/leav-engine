// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {useRoutes} from 'react-router-dom';
import {Loading} from '@leav/ui';
import {useGetApplicationSkeletonSettingsQuery} from '../../__generated__';
import {Application} from './Application';
import {WorkspaceAndPanels} from './WorkspaceAndPanels';
import {PanelComponent} from './Panel';
import {routes} from './routes';

const ApplicationRouting: FunctionComponent = () => {
    const {data} = useGetApplicationSkeletonSettingsQuery();

    const application = data?.applications?.list[0].settings ?? null;

    const routing = useRoutes(
        application == null
            ? []
            : [
                  {
                      element: <Application application={application} />,
                      children: [
                          {
                              element: <WorkspaceAndPanels />,
                              children: [
                                  {
                                      path: routes.panel,
                                      element: <PanelComponent />
                                  }
                              ]
                          }
                      ]
                  }
              ]
    );

    if (application == null) {
        return <Loading />;
    }

    return <main>{routing}</main>;
};

export default ApplicationRouting;
