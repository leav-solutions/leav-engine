// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useContext, useEffect} from 'react';
import {Outlet, useNavigate, useParams} from 'react-router-dom';
import {Page} from '../layout/Page';
import {ApplicationContext} from '../workspace-context/ApplicationProvider';

export const WorkspaceAndPanels: FunctionComponent = () => {
    const {panelId} = useParams();
    const navigate = useNavigate();
    const {currentPanel, currentParentTuple, setCurrentPanelId} = useContext(ApplicationContext);

    useEffect(() => {
        if (panelId && currentPanel?.id !== panelId) {
            setCurrentPanelId(panelId);
        }
    }, [panelId, currentPanel]);

    const tabItems =
        currentParentTuple !== undefined && 'children' in currentParentTuple[0]
            ? currentParentTuple[0].children.map(panel => ({
                  key: panel.id,
                  label: panel.id,
                  onClick: () => {
                      navigate(`/${panel.id}`);
                  }
              }))
            : null;

    return (
        <Page title={currentPanel?.id} tabs={tabItems}>
            <Outlet />
        </Page>
    );
};
