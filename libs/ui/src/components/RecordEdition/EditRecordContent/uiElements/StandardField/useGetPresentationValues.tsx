// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const _isDateRangeValue = (value: any): value is {from: string; to: string} =>
    !!value && typeof value === 'object' && 'from' in value && 'to' in value;

interface IUseGetPresentationValues {
    presentationValues: string[];
}

export const useGetPresentationValues = ({
    values,
    format,
    calculatedValue,
    inheritedValue
}: {
    values: ValueDetailsValueFragment[];
    format: AttributeFormat;
    calculatedValue: RecordFormElementsValueStandardValue;
    inheritedValue: RecordFormElementsValueStandardValue;
}): IUseGetPresentationValues => {
    const {t} = useSharedTranslation();

    const presentationValues = values.map(value => {
        let presentationValue = value.payload || calculatedValue?.payload || inheritedValue?.payload || '';

        switch (format) {
            case AttributeFormat.date_range:
                if (_isDateRangeValue(presentationValue)) {
                    const {from, to} = presentationValue;
                    presentationValue = t('record_edition.date_range_value', {
                        from,
                        to,
                        interpolation: {
                            escapeValue: false
                        }
                    });
                } else {
                    presentationValue = '';
                }
                break;
            case AttributeFormat.color:
                if (presentationValue) {
                    presentationValue = '#' + presentationValue;
                }
                break;
        }

        return presentationValue;
    });

    return {presentationValues};
};
