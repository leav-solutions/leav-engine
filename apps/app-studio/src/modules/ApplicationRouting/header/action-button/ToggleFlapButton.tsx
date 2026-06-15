import {faComment, faInfo} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitTooltip} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import {generatePath, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {RelativePaths} from '../../router/paths';
import {useTranslation} from 'react-i18next';
import {type FLAP_THREAD_PANEL_ID, FLAP_INFO_AND_HISTORY_PANEL_ID, BLANK_PANEL_ID} from '../../../../constants';
import {REDIRECT_URL_QUERY_PARAM} from '../../content/panel-custom/message-handlers/useNavigateToPanel';
import {matomo} from '../../../../services/analytics';
import {matomoEvents} from '../../../../services/analytics/constants/matomoEvents';

interface IToggleFlapButtonProps {
    targetFlapPanelId: typeof FLAP_THREAD_PANEL_ID | typeof FLAP_INFO_AND_HISTORY_PANEL_ID;
    targetRecordId: string;
    targetLibraryId: string;
}

export const ToggleFlapButton: FunctionComponent<IToggleFlapButtonProps> = ({
    targetFlapPanelId,
    targetRecordId,
    targetLibraryId,
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get(REDIRECT_URL_QUERY_PARAM);
    const {recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId, panelId} = useParams();
    const {t} = useTranslation();

    const isInfoAndHistoryFlap = targetFlapPanelId === FLAP_INFO_AND_HISTORY_PANEL_ID;
    const buttonTitle = isInfoAndHistoryFlap ? t('global.information') : t('global.discussion');
    const buttonIcon = isInfoAndHistoryFlap ? faInfo : faComment;

    const hasFlapAlreadyOpen = flapPanelId !== undefined;
    const isTargetFlapAlreadyOpen =
        targetRecordId === flapRecordId && targetLibraryId === flapLibraryId && targetFlapPanelId === flapPanelId;
    const shouldPreventClose = isTargetFlapAlreadyOpen && recordPanelId === BLANK_PANEL_ID;
    const isToggleFromThreadsToInfoHistoryFlap =
        (!hasFlapAlreadyOpen && isInfoAndHistoryFlap) || flapPanelId === 'thread';

    return (
        <KitTooltip title={buttonTitle}>
            <KitButton
                size="m"
                aria-label={buttonTitle}
                icon={<FontAwesomeIcon icon={buttonIcon} />}
                active={isTargetFlapAlreadyOpen}
                onClick={() => {
                    if (isToggleFromThreadsToInfoHistoryFlap) {
                        matomo.trackNavigationEvent(matomoEvents.actions.history_panel_opened, targetLibraryId);
                    }
                    if (shouldPreventClose) {
                        return;
                    }

                    if (isTargetFlapAlreadyOpen) {
                        return navigate(RelativePaths.closeFlapPanel, {relative: 'path'});
                    }

                    navigate(
                        generatePath(
                            hasFlapAlreadyOpen
                                ? RelativePaths.closeFlapPanel + '/' + RelativePaths.openFlap
                                : RelativePaths.openFlap,
                            {
                                flapRecordId: targetRecordId,
                                flapLibraryId: targetLibraryId,
                                flapPanelId: targetFlapPanelId,
                            },
                        ) + (redirectUrl ? `?${REDIRECT_URL_QUERY_PARAM}=${encodeURIComponent(redirectUrl)}` : ''),
                        {relative: 'path'},
                    );
                }}
            />
        </KitTooltip>
    );
};
