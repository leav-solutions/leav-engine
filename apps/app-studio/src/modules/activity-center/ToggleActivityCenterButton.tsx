// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {faBell} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitBadge, KitButton, KitSidePanel, KitTooltip} from 'aristid-ds';
import {ACTIVITY_CENTER_TARGET_ID} from '../../constants';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '@leav/ui';
import {createPortal} from 'react-dom';
import {ActivityCenter} from './ActivityCenter';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {toggleActivityCenterButton} from './activityCenter.module.css';

export const ToggleActivityCenterButton = () => {
    const {t} = useTranslation();
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

    // TODO: Later we should fetch the user's new activities from the backend
    const userHasNewActivity = false;
    const toggleButtonLabel = isActivityCenterOpen ? t('activity_center.close') : t('activity_center.open');

    return (
        <>
            <KitTooltip title={toggleButtonLabel} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
                <KitBadge dot={userHasNewActivity}>
                    <KitButton
                        className={toggleActivityCenterButton}
                        type="segmented"
                        size="m"
                        active={isActivityCenterOpen}
                        icon={<FontAwesomeIcon icon={faBell} />}
                        aria-label={toggleButtonLabel}
                        onClick={() => setIsActivityCenterOpen(!isActivityCenterOpen)}
                    />
                </KitBadge>
            </KitTooltip>
            {refDivToInsertSidePanel &&
                createPortal(
                    <KitSidePanel
                        ref={activityCenterSidePanelRef}
                        size="m"
                        idCardProps={{title: t('activity_center.title')}}
                        onClose={() => setIsActivityCenterOpen(false)}
                        floating
                        closable
                        showSeparator
                        closeOnEsc
                    >
                        <ActivityCenter />
                    </KitSidePanel>,
                    refDivToInsertSidePanel,
                )}
        </>
    );
};
