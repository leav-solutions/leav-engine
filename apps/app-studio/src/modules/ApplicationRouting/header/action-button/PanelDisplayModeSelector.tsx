import {useState, type FunctionComponent} from 'react';
import {faExpand, faTableColumns, faWindowRestore} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitDropDown, KitTooltip} from 'aristid-ds';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {RelativePaths} from '../../router/paths';
import {useTranslation} from 'react-i18next';
import {DisplayModeItem} from './DisplayModeItem';
import {type Where} from '_ui/hooks/useIFrameMessenger/types';

export const PanelDisplayModeSelector: FunctionComponent = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} = useParams();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const hasFlapAlreadyOpen = flapPanelId !== undefined;

    const displayModeItems = [
        {
            key: 'slider',
            label: (
                <DisplayModeItem
                    icon={faTableColumns}
                    label={t('display_mode.lateral_panel')}
                    isSelected={where === 'slider'}
                />
            ),
        },
        {
            key: 'popup',
            label: (
                <DisplayModeItem
                    icon={faWindowRestore}
                    label={t('display_mode.floating_window')}
                    isSelected={where === 'popup'}
                />
            ),
        },
        {
            key: 'fullpage',
            label: (
                <DisplayModeItem
                    icon={faExpand}
                    label={t('display_mode.fullpage_window')}
                    isSelected={where === 'fullpage'}
                />
            ),
        },
    ];

    const handleDisplayModeChange = (key: Where) => {
        const changeCurrentPanelWhere = RelativePaths.closeCurrentPanel + '/' + RelativePaths.nextLevelPanel;

        if (hasFlapAlreadyOpen) {
            return navigate(
                generatePath(
                    RelativePaths.closeFlapPanel + '/' + changeCurrentPanelWhere + '/' + RelativePaths.openFlap,
                    {
                        recordId,
                        where: key,
                        recordPanelId,
                        flapRecordId,
                        flapLibraryId,
                        flapPanelId,
                    },
                ),
                {relative: 'path'},
            );
        }

        return navigate(generatePath(changeCurrentPanelWhere, {recordId, where: key, recordPanelId}), {
            relative: 'path',
        });
    };

    return (
        <KitDropDown
            key={where}
            open={isDropdownOpen}
            menu={{
                items: displayModeItems,
                selectable: true,
                selectedKeys: [where],
                onSelect: selectInfo => {
                    handleDisplayModeChange(selectInfo.key as Where);
                },
            }}
            trigger={['click']}
            placement="bottomRight"
            onOpenChange={open => {
                setIsDropdownOpen(open);
            }}
        >
            <KitTooltip title={t('display_mode.select_display')}>
                <KitButton
                    size="m"
                    aria-label={t('display_mode.select_display')}
                    icon={
                        <FontAwesomeIcon
                            icon={where === 'slider' ? faTableColumns : where === 'popup' ? faWindowRestore : faExpand}
                        />
                    }
                    active={isDropdownOpen}
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                />
            </KitTooltip>
        </KitDropDown>
    );
};
