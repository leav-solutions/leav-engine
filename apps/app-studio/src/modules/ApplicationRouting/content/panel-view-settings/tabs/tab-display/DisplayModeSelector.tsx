import {useTranslation} from 'react-i18next';
import {KitCheckableTile, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faList, faTable, faGrip} from '@fortawesome/free-solid-svg-icons';
import {section, tiles} from './displayModeSelector.module.css';

export const DisplayModeSelector = () => {
    const {t} = useTranslation();

    return (
        <section className={section}>
            <KitTypography.Text weight="bold" size="fontSize5">
                {t('view_settings.display.mode.title')}
            </KitTypography.Text>
            <div className={tiles}>
                <KitCheckableTile
                    label={t('view_settings.display.mode.table')}
                    icon={<FontAwesomeIcon icon={faTable} />}
                    checked
                />
                <KitCheckableTile
                    label={t('view_settings.display.mode.list')}
                    icon={<FontAwesomeIcon icon={faList} />}
                    disabled
                />
                <KitCheckableTile
                    label={t('view_settings.display.mode.mosaic')}
                    icon={<FontAwesomeIcon icon={faGrip} />}
                    disabled
                />
            </div>
        </section>
    );
};
