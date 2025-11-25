// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {faDownLeftAndUpRightToCenter, faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';
import {KitButton, KitTooltip} from 'aristid-ds';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {RelativePaths} from '../router/paths';
import {useTranslation} from 'react-i18next';

export const ExpandCollapseCurrentPanelButton: FunctionComponent = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} = useParams();

    const isCurrentPanelInSlider = where === 'slider';

    const panelPath = isCurrentPanelInSlider
        ? RelativePaths.openCurrentPanelInPopup
        : RelativePaths.openCurrentPanelInSlider;

    const hasFlapAlreadyOpen = flapPanelId !== undefined;

    return (
        <KitTooltip
            title={isCurrentPanelInSlider ? t('global.expand') : t('global.collapse')}
            mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}
        >
            <KitButton
                size="m"
                aria-label={isCurrentPanelInSlider ? t('global.expand') : t('global.collapse')}
                icon={
                    <FontAwesomeIcon
                        icon={isCurrentPanelInSlider ? faUpRightAndDownLeftFromCenter : faDownLeftAndUpRightToCenter}
                    />
                }
                onClick={() => {
                    if (hasFlapAlreadyOpen) {
                        return navigate(
                            generatePath(
                                RelativePaths.closeFlapPanel + '/' + panelPath + '/' + RelativePaths.openFlap,
                                {
                                    recordId,
                                    recordPanelId,
                                    flapRecordId,
                                    flapLibraryId,
                                    flapPanelId,
                                },
                            ),
                            {relative: 'path'},
                        );
                    }

                    return navigate(generatePath(panelPath, {recordId, recordPanelId}), {relative: 'path'});
                }}
            />
        </KitTooltip>
    );
};
