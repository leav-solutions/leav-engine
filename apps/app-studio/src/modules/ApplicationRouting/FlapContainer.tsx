// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {forwardRef} from 'react';
import {KitSidePanel} from 'aristid-ds';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {useNavigate, useParams} from 'react-router-dom';
import {RelativePaths} from './router/paths';
import {PanelHeader} from './header/PanelHeader';
import {Flap} from './Flap';
import {flapContainer} from './flap.module.css';

export const FlapContainer = forwardRef<KitSidePanelRef>((_, refFlap) => {
    const navigate = useNavigate();

    const {workspaceId, panelId, recordId, where} = useParams();

    if (where === 'slider') {
        return <Flap />;
    }

    return (
        <KitSidePanel
            className={flapContainer}
            ref={refFlap}
            size="l"
            headerExtra={<PanelHeader enabled hideExpandCollapseButton actionPosition="right" />}
            onCloseAfterAnimation={() => {
                navigate(RelativePaths.closeFlapPanel, {relative: 'path'});
            }}
            closable
            showSeparator
            closeOnEsc
        >
            <Flap />
        </KitSidePanel>
    );
});
