import {faBell} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitBadge, KitButton, KitSidePanel, KitSidePanelHeader, KitTooltip} from 'aristid-ds';
import {ACTIVITY_CENTER_TARGET_ID} from '../../constants';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {createPortal} from 'react-dom';
import {ActivityCenter} from './ActivityCenter';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {toggleActivityCenterButton} from './activityCenter.module.css';

export const ToggleActivityCenterButton = () => {
    const {t} = useTranslation();
    const [hasBeenOpened, setHasBeenOpened] = useState(false);
    const [isActivityCenterOpen, setIsActivityCenterOpen] = useState(false);
    const [refDivToInsertSidePanel, setRefDivToInsertSidePanel] = useState<HTMLDivElement | null>(null);
    const activityCenterSidePanelRef = useRef<KitSidePanelRef | null>(null);

    useEffect(() => {
        setRefDivToInsertSidePanel(document.getElementById(ACTIVITY_CENTER_TARGET_ID) as HTMLDivElement);
    }, []);

    useEffect(() => {
        if (!activityCenterSidePanelRef.current) {
            return;
        }

        if (isActivityCenterOpen) {
            activityCenterSidePanelRef.current?.open();
        } else {
            activityCenterSidePanelRef.current?.close();
        }
    }, [activityCenterSidePanelRef.current, isActivityCenterOpen]);

    const handleToggleActivityCenter = () => {
        if (!hasBeenOpened) {
            setHasBeenOpened(true);
        }
        setIsActivityCenterOpen(prev => !prev);
    };

    // TODO: Later we should fetch the user's new activities from the backend
    const userHasNewActivity = false;
    const toggleButtonLabel = isActivityCenterOpen ? t('activity_center.close') : t('activity_center.open');

    return (
        <>
            <KitTooltip title={toggleButtonLabel}>
                <KitBadge dot={userHasNewActivity}>
                    <KitButton
                        className={toggleActivityCenterButton}
                        type="segmented"
                        size="m"
                        active={isActivityCenterOpen}
                        icon={<FontAwesomeIcon icon={faBell} />}
                        aria-label={toggleButtonLabel}
                        onClick={handleToggleActivityCenter}
                    />
                </KitBadge>
            </KitTooltip>
            {refDivToInsertSidePanel &&
                hasBeenOpened &&
                createPortal(
                    <KitSidePanel ref={activityCenterSidePanelRef} size="m" floating closeOnEsc useChildrenOnly>
                        <KitSidePanelHeader
                            idCardProps={{title: t('activity_center.title')}}
                            showSeparator
                            closable
                            onClose={() => setIsActivityCenterOpen(false)}
                        />
                        <ActivityCenter />
                    </KitSidePanel>,
                    refDivToInsertSidePanel,
                )}
        </>
    );
};
