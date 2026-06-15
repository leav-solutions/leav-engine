import {useTranslation} from 'react-i18next';
import {KitInput} from 'aristid-ds';
import {useLang} from '@leav/ui';
import {useCurrentView} from '../store-current-view/useCurrentView';

export const CurrentViewLabel = () => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, isOwner, setLabel} = useCurrentView();

    if (!view) {
        return null;
    }

    const value = view.label?.[lang[0]] ?? '';
    const isLabelEmpty = value.trim() === '';

    // Non-owner: the label is read-only (a fork is needed to rename).
    if (!isOwner) {
        return <KitInput readonly value={value} />;
    }

    return (
        <KitInput
            value={value}
            status={isLabelEmpty ? 'error' : undefined}
            helper={isLabelEmpty ? String(t('view_settings.current-view.label-required')) : undefined}
            placeholder={String(t('view_settings.current-view.label-placeholder'))}
            onChange={event => setLabel(event.target.value)}
        />
    );
};
