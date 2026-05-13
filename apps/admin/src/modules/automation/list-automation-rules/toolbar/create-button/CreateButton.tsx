import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitTooltip} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';
import {generatePath, useNavigate} from 'react-router-dom';
import {AdminUnreachablePaths} from '../../../../routes/paths';

export const CreateButton = () => {
    const {t} = useTranslation();

    const navigate = useNavigate();

    return (
        <KitTooltip title={t('admin.create')} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
            <KitButton
                type="primary"
                size="m"
                icon={<FontAwesomeIcon icon={faPlus} />}
                onClick={() => {
                    navigate(generatePath(AdminUnreachablePaths.create));
                }}
            />
        </KitTooltip>
    );
};
