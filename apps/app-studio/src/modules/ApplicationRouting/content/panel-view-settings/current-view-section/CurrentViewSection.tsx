import {useTranslation} from 'react-i18next';
import {KitButton, KitInput, KitSwitch, KitTooltip, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClone, faSave, faTrash, faXmark} from '@fortawesome/free-solid-svg-icons';
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useCurrentView} from '../store-current-view/useCurrentView';
import {header, currentView, shared, actions, actionButtons} from './currentViewSection.module.css';

/**
 * TODO:
 * - plug useEditLabelView to make the label editable when admin (or owner)
 * - plug useUpdateView / useCreateNewView (clone) / useDeleteView
 */
export const CurrentViewSection = ({onViewSettingsClose}: {onViewSettingsClose: () => void}) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view} = useCurrentView();

    if (!view) {
        return null;
    }

    const currentViewLabel = localizedTranslation(view.label, lang);

    return (
        <section className={currentView}>
            <header className={header}>
                <KitTypography.Text weight="bold" size="fontSize5">
                    {t('view_settings.current-view.title')}
                </KitTypography.Text>
                <KitTooltip title={String(t('view_settings.current-view.close'))}>
                    <KitButton
                        type="secondary"
                        size="m"
                        aria-label={String(t('view_settings.current-view.close'))}
                        icon={<FontAwesomeIcon icon={faXmark} />}
                        onClick={onViewSettingsClose}
                    />
                </KitTooltip>
            </header>
            <KitInput readonly value={currentViewLabel} />
            <div className={actions}>
                <div className={shared}>
                    <KitSwitch checked={view.shared} disabled />
                    <KitTypography.Text>{t('view_settings.current-view.shared')}</KitTypography.Text>
                </div>
                <div className={actionButtons}>
                    <KitTooltip title={String(t('view_settings.current-view.save'))}>
                        <KitButton
                            type="secondary"
                            size="m"
                            disabled
                            aria-label={String(t('view_settings.current-view.save'))}
                            icon={<FontAwesomeIcon icon={faSave} />}
                        />
                    </KitTooltip>
                    <KitTooltip title={String(t('view_settings.current-view.clone'))}>
                        <KitButton
                            type="secondary"
                            size="m"
                            disabled
                            aria-label={String(t('view_settings.current-view.clone'))}
                            icon={<FontAwesomeIcon icon={faClone} />}
                        />
                    </KitTooltip>
                    <KitTooltip title={String(t('view_settings.current-view.delete'))}>
                        <KitButton
                            type="secondary"
                            size="m"
                            disabled
                            danger
                            aria-label={String(t('view_settings.current-view.delete'))}
                            icon={<FontAwesomeIcon icon={faTrash} />}
                        />
                    </KitTooltip>
                </div>
            </div>
        </section>
    );
};
