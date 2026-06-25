import {useTranslation} from 'react-i18next';
import {KitInput} from 'aristid-ds';
import {useLang} from '@leav/ui';
import {useCurrentView} from '../store-current-view/useCurrentView';

export const CurrentViewLabel = () => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, isOwner, isEmptyView, setLabel} = useCurrentView();

    if (!view && !isEmptyView) {
        return null;
    }

    if (isEmptyView) {
        return <KitInput readonly value={String(t('view_settings.current_view.default_view_label'))} />;
    }

    const value = view.label?.[lang[0]] ?? '';
    const isLabelEmpty = value.trim() === '';

    // Non-owner: the label is read-only ("save as" is needed to rename a copy).
    if (!isOwner) {
        return <KitInput readonly value={value} />;
    }

    return (
        <KitInput
            value={value}
            status={isLabelEmpty ? 'error' : undefined}
            helper={isLabelEmpty ? String(t('view_settings.current_view.label_required')) : undefined}
            placeholder={String(t('view_settings.current_view.label_placeholder'))}
            onChange={event => setLabel(event.target.value)}
        />
    );
};
