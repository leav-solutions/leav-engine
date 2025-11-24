// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {faComment, faInfo} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitTooltip} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {RelativePaths} from '../router/paths';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '@leav/ui';
import {useTranslation} from 'react-i18next';
import {type FLAP_THREAD_PANEL_ID, FLAP_INFO_AND_HISTORY_PANEL_ID} from '../../../constants';

interface IToggleFlapButtonProps {
    targetFlapPanelId: typeof FLAP_THREAD_PANEL_ID | typeof FLAP_INFO_AND_HISTORY_PANEL_ID;
    libraryId: string;
}

export const ToggleFlapButton: FunctionComponent<IToggleFlapButtonProps> = ({targetFlapPanelId, libraryId}) => {
    const navigate = useNavigate();
    const {recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} = useParams();
    const {t} = useTranslation();

    const isInfoAndHistoryFlap = targetFlapPanelId === FLAP_INFO_AND_HISTORY_PANEL_ID;
    const buttonTitle = isInfoAndHistoryFlap ? t('global.information') : t('global.discussion');
    const buttonIcon = isInfoAndHistoryFlap ? faInfo : faComment;

    const hasFlapAlreadyOpen = flapPanelId !== undefined;
    const isTargetFlapAlreadyOpen = targetFlapPanelId === flapPanelId;

    return (
        <KitTooltip title={buttonTitle} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
            <KitButton
                size="m"
                aria-label={buttonTitle}
                icon={<FontAwesomeIcon icon={buttonIcon} />}
                active={isTargetFlapAlreadyOpen}
                onClick={() => {
                    if (isTargetFlapAlreadyOpen) {
                        return navigate(RelativePaths.closeFlapPanel, {relative: 'path'});
                    }

                    navigate(
                        generatePath(hasFlapAlreadyOpen ? RelativePaths.changeLastFlapPanel : RelativePaths.openFlap, {
                            flapRecordId: recordId,
                            flapLibraryId: libraryId,
                            flapPanelId: targetFlapPanelId,
                        }),
                        {relative: 'path'},
                    );
                }}
            />
        </KitTooltip>
    );
};
