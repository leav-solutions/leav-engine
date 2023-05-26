// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Loading} from '@leav/ui';
import {WorkspacePanels} from '_types/types';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {lazy, Suspense, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {setActivePanel} from 'reduxStore/activePanel';
import {useAppDispatch} from 'reduxStore/store';
import styled from 'styled-components';

const VisibilityHandler = styled.div<{isActive: boolean}>`
    display: ${p => (p.isActive ? 'block' : 'none')};
`;

const Wrapper = styled.div`
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
`;

const Home = lazy(() => import('components/Home'));
const LibraryHome = lazy(() => import('components/LibraryHome'));
const Navigation = lazy(() => import('components/Navigation'));

function Workspace(): JSX.Element {
    const dispatch = useAppDispatch();
    const {panel, entityId} = useParams<{panel: WorkspacePanels; entityId?: string}>();
    let activePanel = panel?.toLowerCase() as WorkspacePanels;

    if (!Object.values(WorkspacePanels).includes(activePanel)) {
        activePanel = WorkspacePanels.HOME;
    }

    const [activeLibrary] = useActiveLibrary();
    const [activeTree] = useActiveTree();

    const isHomeActive = activePanel === WorkspacePanels.HOME;
    const isLibraryActive = activePanel === WorkspacePanels.LIBRARY;
    const isTreeActive = activePanel === WorkspacePanels.TREE;

    const libraryId = isLibraryActive ? entityId : activeLibrary?.id;
    const treeId = isTreeActive ? entityId : activeTree?.id;

    useEffect(() => {
        dispatch(setActivePanel(activePanel));
    }, [activePanel, dispatch]);

    return (
        <Wrapper>
            <Suspense fallback={<Loading />}>
                <VisibilityHandler isActive={isHomeActive} className={WorkspacePanels.HOME}>
                    <Home />
                </VisibilityHandler>
                <VisibilityHandler isActive={isLibraryActive} className={WorkspacePanels.LIBRARY}>
                    <LibraryHome library={libraryId} key={libraryId} />
                </VisibilityHandler>
                <VisibilityHandler isActive={isTreeActive} className={WorkspacePanels.TREE}>
                    <Navigation tree={treeId} key={treeId} />
                </VisibilityHandler>
            </Suspense>
        </Wrapper>
    );
}

export default Workspace;
