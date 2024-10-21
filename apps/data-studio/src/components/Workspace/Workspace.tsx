// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Loading} from '@leav/ui';
import RouteNotFound from 'components/Router/RouteNotFound';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {FunctionComponent, lazy, Suspense, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {setActivePanel} from 'reduxStore/activePanel';
import {useAppDispatch} from 'reduxStore/store';
import styled from 'styled-components';
import {WorkspacePanels} from '_types/types';
import Explorer from '_ui/components/Explorer';

const VisibilityHandlerDiv = styled.div<{$isActive: boolean}>`
    display: ${p => (p.$isActive ? 'block' : 'none')};
`;

const WrapperDiv = styled.div`
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
`;

const Home = lazy(() => import('components/Home'));
const LibraryHome = lazy(() => import('components/LibraryHome'));
const Navigation = lazy(() => import('components/Navigation'));

const Workspace: FunctionComponent<{isExplorer?: true}> = ({isExplorer}) => {
    const allowedPanels = Object.values(WorkspacePanels);

    const dispatch = useAppDispatch();
    const {panel, entityId} = useParams<{panel: WorkspacePanels; entityId?: string}>();

    let activePanel = panel?.toLowerCase() as WorkspacePanels;

    if (!Object.values(WorkspacePanels).includes(activePanel)) {
        activePanel = WorkspacePanels.HOME;
    }

    const [activeLibrary] = useActiveLibrary();
    const [activeTree] = useActiveTree();

    const isExplorerActive = isExplorer ?? false;
    const isHomeActive = activePanel === WorkspacePanels.HOME && !isExplorerActive;
    const isLibraryActive = activePanel === WorkspacePanels.LIBRARY && !isExplorerActive;
    const isTreeActive = activePanel === WorkspacePanels.TREE && !isExplorerActive;

    const libraryId = isLibraryActive ? entityId : activeLibrary?.id;
    const treeId = isTreeActive ? entityId : activeTree?.id;

    useEffect(() => {
        if (isExplorerActive) {
            dispatch(setActivePanel(WorkspacePanels.EXPLORER));
        } else {
            dispatch(setActivePanel(activePanel));
        }
    }, [activePanel, dispatch, isExplorerActive]);

    if (panel && !allowedPanels.includes(panel)) {
        return <RouteNotFound />;
    }

    return (
        <WrapperDiv>
            <Suspense fallback={<Loading />}>
                <VisibilityHandlerDiv $isActive={isHomeActive} className={WorkspacePanels.HOME}>
                    <Home />
                </VisibilityHandlerDiv>
                <VisibilityHandlerDiv $isActive={isLibraryActive} className={WorkspacePanels.LIBRARY}>
                    <LibraryHome library={libraryId} key={libraryId} />
                </VisibilityHandlerDiv>
                <VisibilityHandlerDiv $isActive={isTreeActive} className={WorkspacePanels.TREE}>
                    <Navigation tree={treeId} key={treeId} />
                </VisibilityHandlerDiv>
                <VisibilityHandlerDiv $isActive={isExplorerActive} className={WorkspacePanels.LIBRARY}>
                    <Explorer library={libraryId} />
                </VisibilityHandlerDiv>
            </Suspense>
        </WrapperDiv>
    );
};

export default Workspace;
