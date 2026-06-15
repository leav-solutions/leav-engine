import {useTranslation} from 'react-i18next';
import {KitTypography} from 'aristid-ds';
import {sharedBy} from './sharedByLabel.module.css';

export const SharedByLabel = ({createdByLabel}: {createdByLabel: string}) => {
    const {t} = useTranslation();

    return (
        <div className={sharedBy}>
            <KitTypography.Text>
                {t('view_settings.current-view.shared-by', {name: createdByLabel ?? ''})}
            </KitTypography.Text>
        </div>
    );
};
