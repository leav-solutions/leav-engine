import {useTranslation} from 'react-i18next';
import {KitSwitch, KitTypography} from 'aristid-ds';
import {shared as sharedClassname} from './shareControl.module.css';

export const ShareControl = ({
    shared,
    onToggleShared,
    disabled,
}: {
    shared: boolean;
    onToggleShared: (shared: boolean) => void;
    disabled: boolean;
}) => {
    const {t} = useTranslation();

    return (
        <div className={sharedClassname}>
            <KitSwitch checked={shared} disabled={disabled} onChange={onToggleShared} />
            <KitTypography.Text>{t('view_settings.current-view.shared')}</KitTypography.Text>
        </div>
    );
};
