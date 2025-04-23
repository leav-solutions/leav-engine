// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {Link, Outlet, useOutletContext, useParams} from 'react-router-dom';
import type {IWorkspace, Panel} from './types';
import {getAllPanels} from './utils';

export const WorkspaceAndPanels: FunctionComponent = () => {
    const {panelId} = useParams();

    const workspaces = useOutletContext<IWorkspace[]>();

    const tuplesPanelByWorkspace: Array<[Panel, IWorkspace]> = workspaces
        .map<[Panel[], IWorkspace]>(workspace => [getAllPanels(workspace), workspace])
        .flatMap(([panels, workspace]) => panels.map<[Panel, IWorkspace]>(panel => [panel, workspace]));

    const currentParentTuple = tuplesPanelByWorkspace.find(([panel]) =>
        'children' in panel ? panel.children.find(({id}) => id === panelId) : false
    );

    const [currentPanel, currentWorkspace] = tuplesPanelByWorkspace.find(([panel]) => panel.id === panelId);

    return (
        <>
            {currentParentTuple !== undefined && 'children' in currentParentTuple[0] && (
                <nav>
                    <menu>
                        {currentParentTuple[0].children.map(panel => (
                            <li key={panel.id}>
                                <Link to={'/' + panel.id}>{panel.id}</Link>
                            </li>
                        ))}
                    </menu>
                </nav>
            )}
            <Outlet
                context={{currentPanel, currentWorkspace} satisfies {currentPanel: Panel; currentWorkspace: IWorkspace}}
            />
        </>
    );
};
