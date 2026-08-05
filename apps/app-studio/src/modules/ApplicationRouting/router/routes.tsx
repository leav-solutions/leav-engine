import {type RouteObject} from 'react-router-dom';
import {RedirectToFirstPanel} from '../guards/RedirectToFirstPanel';
import {RedirectToFirstWorkspace} from '../guards/RedirectToFirstWorkspace';
import {RedirectToFirstRecordPanel} from '../guards/RedirectToFirstRecordPanel';
import {RedirectToPreviousPanel} from '../guards/RedirectToPreviousPanel';
import {WorkspacesNavigationMenu} from '../workspaces/WorkspacesNavigationMenu';
import {Panel} from '../Panel';
import {PanelContainer} from '../PanelContainer';
import {AbsolutePaths, UnreachablePaths} from './paths';
import {RedirectToFirstRecordPanelAllowedInCompactMode} from '../guards/RedirectToFirstRecordPanelAllowedInCompactMode';
import {RedirectCreationPanelToPopup} from '../guards/RedirectCreationPanelToPopup';
import {WorkspacePanelContainer} from '../WorkspacePanelContainer';
import {NotFound} from '../NotFound';

// panelWithFlap route need to be before the panel route because router will match the first route that matches the path
const panelPaths = [AbsolutePaths.panelWithFlap, AbsolutePaths.panel];

// recordWherePanelWithFlap route need to be before the recordWherePanel because router will match the first route that matches the path
const recordWherePanelPaths = [UnreachablePaths.recordWherePanelWithFlap, UnreachablePaths.recordWherePanel];

const unreachableRecordPaths = [UnreachablePaths.recordWhere, UnreachablePaths.record];

// The route arrays instantiate `<Panel />` JSX. `Panel` and this module form an intentional cycle
// (recursive routing: a panel renders the next level's routes, which render panels). Building the
// arrays lazily — instead of at module-eval time — defers `<Panel />` creation to render time, when
// `Panel` is guaranteed to be defined regardless of which side of the cycle is the entry point.
// Both consumers call these at render, and the result is cached so the reference stays stable.
let firstLevelRoutesCache: RouteObject[] | null = null;
let nextLevelRoutesCache: RouteObject[] | null = null;

export const getFirstLevelRoutes = (): RouteObject[] => {
    firstLevelRoutesCache ??= [
        {
            path: UnreachablePaths.workspace,
            element: <RedirectToFirstPanel />,
        },
        {
            element: <WorkspacesNavigationMenu />,
            children: [
                ...panelPaths.map(panelPath => ({
                    path: panelPath,
                    element: (
                        <RedirectToPreviousPanel>
                            <WorkspacePanelContainer>
                                <Panel />
                            </WorkspacePanelContainer>
                        </RedirectToPreviousPanel>
                    ),
                })),
            ],
        },
        {
            element: <WorkspacesNavigationMenu />,
            children: [
                {
                    path: AbsolutePaths.notFound,
                    element: <NotFound />,
                },
            ],
        },
        {
            path: '*',
            element: <RedirectToFirstWorkspace />,
        },
    ];
    return firstLevelRoutesCache;
};

export const getNextLevelRoutes = (): RouteObject[] => {
    nextLevelRoutesCache ??= [
        ...unreachableRecordPaths.map(unreachableRecordPath => ({
            path: unreachableRecordPath,
            element: <RedirectToFirstRecordPanel />,
        })),
        ...recordWherePanelPaths.map(recordWherePanelPath => ({
            path: recordWherePanelPath,
            element: (
                <RedirectToPreviousPanel>
                    <RedirectToFirstRecordPanelAllowedInCompactMode>
                        <RedirectCreationPanelToPopup>
                            <PanelContainer>{children => <Panel sliderVoletHostElement={children} />}</PanelContainer>
                        </RedirectCreationPanelToPopup>
                    </RedirectToFirstRecordPanelAllowedInCompactMode>
                </RedirectToPreviousPanel>
            ),
        })),
    ];
    return nextLevelRoutesCache;
};
