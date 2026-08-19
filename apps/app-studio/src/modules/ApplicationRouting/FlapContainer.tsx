import {forwardRef} from 'react';
import {KitSidePanel} from 'aristid-ds';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {useNavigate} from 'react-router-dom';
import {useRouteParams} from './router/useRouteParams';
import {RelativePaths} from './router/paths';
import {PanelHeader} from './header/PanelHeader';
import {FlapContent} from './content/FlapContent';
import {flapContainer} from './flap.module.css';

export const FlapContainer = forwardRef<KitSidePanelRef>((_, refFlap) => {
    const navigate = useNavigate();

    const {where, flapRecordId, flapLibraryId} = useRouteParams();

    if (where === 'slider') {
        return <FlapContent />;
    }

    return (
        <KitSidePanel
            className={flapContainer}
            ref={refFlap}
            size="l"
            headerExtra={
                <PanelHeader
                    actionPosition="right"
                    currentRecordId={flapRecordId}
                    currentLibraryId={flapLibraryId}
                    hidePanelTabs
                    hidePanelDisplayModeSelector
                />
            }
            onCloseAfterAnimation={() => {
                navigate(RelativePaths.closeFlapPanel, {relative: 'path'});
            }}
            closable
            showSeparator
            closeOnEsc
        >
            <FlapContent />
        </KitSidePanel>
    );
});
