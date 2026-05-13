import {AttributeFormat, type ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {type RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const _isDateRangeValue = (value: any): value is {from: string; to: string} =>
    !!value && typeof value === 'object' && 'from' in value && 'to' in value;

interface IUseGetPresentationValues {
    presentationValues: string[];
}

export const useGetPresentationValues = ({
    values,
    format,
    calculatedValues,
    inheritedValues,
}: {
    values: ValueDetailsValueFragment[];
    format: AttributeFormat;
    calculatedValues: RecordFormElementsValueStandardValue[];
    inheritedValues: RecordFormElementsValueStandardValue[];
}): IUseGetPresentationValues => {
    const {t} = useSharedTranslation();

    const effectiveValues =
        values?.length > 0
            ? values
            : calculatedValues?.length > 0
              ? calculatedValues
              : inheritedValues?.length > 0
                ? inheritedValues
                : [];

    const presentationValues = effectiveValues.map(value => {
        let presentationValue = value.payload || '';

        switch (format) {
            case AttributeFormat.date_range:
                if (_isDateRangeValue(presentationValue)) {
                    const {from, to} = presentationValue;
                    presentationValue = t('record_edition.date_range_value', {
                        from,
                        to,
                        interpolation: {
                            escapeValue: false,
                        },
                    });
                } else {
                    presentationValue = '';
                }
                break;
        }

        return presentationValue;
    });

    return {presentationValues};
};
