// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Home from 'components/Home';
import LibraryHome from 'components/LibraryHome';
import Navigation from 'components/Navigation';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {setActivePanel} from 'redux/activePanel';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import {WorkspacePanels} from '_types/types';

const VisibilityHandler = styled.div<{isActive: boolean}>`
    display: ${p => (p.isActive ? 'block' : 'none')};
`;

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
        <>
            <VisibilityHandler isActive={isHomeActive} className={WorkspacePanels.HOME}>
                <Home />
            </VisibilityHandler>
            <VisibilityHandler isActive={isLibraryActive} className={WorkspacePanels.LIBRARY}>
                <LibraryHome library={libraryId} key={libraryId} />
            </VisibilityHandler>
            <VisibilityHandler isActive={isTreeActive} className={WorkspacePanels.TREE}>
                <Navigation tree={treeId} key={treeId} />
            </VisibilityHandler>
        </>
    );
}

export default Workspace;
