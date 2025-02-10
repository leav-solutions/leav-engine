// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';

export const useAttributeInformations = (attribute: RecordFormAttributeFragment) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const attributeInformations = [];
    if (attribute.format) {
        attributeInformations.push({
            title: t('record_summary.attribute_format'),
            value: attribute.format
        });
    }

    if (attribute.description) {
        attributeInformations.push({
            title: t('record_summary.descriptive'),
            value: localizedTranslation(attribute.description, lang)
        });
    }

    return attributeInformations;
};
