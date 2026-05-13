import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';

export const useAttributeInformations = (attribute: RecordFormAttributeFragment) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const attributeInformations = [];
    if (attribute.format) {
        attributeInformations.push({
            title: t('record_summary.attribute_format'),
            value: t(`attributes.format_${attribute.format}`),
        });
    }

    if (attribute.description) {
        attributeInformations.push({
            title: t('record_summary.descriptive'),
            value: localizedTranslation(attribute.description, lang),
        });
    }

    return attributeInformations;
};
