import {faDownLeftAndUpRightToCenter, faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitTooltip} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import {useTranslation} from 'react-i18next';
import {useFullscreen} from '../../../../hooks/useFullscreen';
import {fullscreenToggleButtonBackdrop} from './fullscreenToggleButton.module.css';

interface IFullscreenToggleButtonProps {
    panelId: string;
}

export const FullscreenToggleButton: FunctionComponent<IFullscreenToggleButtonProps> = ({panelId}) => {
    const {t} = useTranslation();
    const {fullscreenPanelId, enterFullscreen, exitFullscreen} = useFullscreen();

    const isFullscreen = fullscreenPanelId === panelId;
    const label = isFullscreen ? t('fullscreen.exit') : t('fullscreen.enter');

    const handleClick = () => {
        if (isFullscreen) {
            exitFullscreen();
            return;
        }
        enterFullscreen(panelId);
    };

    return (
        <div className={fullscreenToggleButtonBackdrop}>
            <KitTooltip title={label}>
                <KitButton
                    type="secondary"
                    size="m"
                    aria-label={label}
                    icon={
                        <FontAwesomeIcon
                            icon={isFullscreen ? faDownLeftAndUpRightToCenter : faUpRightAndDownLeftFromCenter}
                        />
                    }
                    onClick={handleClick}
                />
            </KitTooltip>
        </div>
    );
};
