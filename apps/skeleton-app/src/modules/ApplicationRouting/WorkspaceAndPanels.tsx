// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {Link, Outlet, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import type {IWorkspace, Panel} from './types';
import {getAllPanels} from './utils';
import {Page} from '../layout/Page';

export const WorkspaceAndPanels: FunctionComponent = () => {
    const {panelId} = useParams();
    const navigate = useNavigate();

    const workspaces = useOutletContext<IWorkspace[]>();

    const tuplesPanelByWorkspace: Array<[Panel, IWorkspace]> = workspaces
        .map<[Panel[], IWorkspace]>(workspace => [getAllPanels(workspace), workspace])
        .flatMap(([panels, workspace]) => panels.map<[Panel, IWorkspace]>(panel => [panel, workspace]));

    const currentParentTuple = tuplesPanelByWorkspace.find(([panel]) =>
        'children' in panel ? panel.children.find(({id}) => id === panelId) : false
    );

    const [currentPanel, currentWorkspace] = tuplesPanelByWorkspace.find(([panel]) => panel.id === panelId);

    const tabItems = currentParentTuple !== undefined && 'children' in currentParentTuple[0]
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
            <Outlet
                context={{currentPanel, currentWorkspace} satisfies {currentPanel: Panel; currentWorkspace: IWorkspace}}
        />
        </Page>
    );
};
