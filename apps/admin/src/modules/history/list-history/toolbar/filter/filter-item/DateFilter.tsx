import {KitDatePicker, KitDivider, KitFilter} from 'aristid-ds';
import dayjs, {type Dayjs} from 'dayjs';
import {type ComponentProps, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    filterDropdownContainer,
    rangePickerInput,
    dateFilterDivider,
    rangePickerDropdownContainer,
} from './dateFilter.module.css';
import {FilterDropdownFooter} from './shared/FilterDropdownFooter';
import {type DateFilterValue} from '../../types';

type DateFilterProps = {
    loading: boolean;
    value: DateFilterValue;
    onChange: (value: DateFilterValue) => void;
    onReset: () => void;
};

export const DateFilter = ({loading, value, onChange, onReset}: DateFilterProps) => {
    const {t} = useTranslation();
    const datePickerContainerRef = useRef<HTMLDivElement>(null);
    const [pendingDates, setPendingDates] = useState<[Dayjs, Dayjs]>([dayjs.unix(value.from), dayjs.unix(value.to)]);

    const presets: ComponentProps<typeof KitDatePicker.RangePicker>['presets'] = [
        {
            label: t('logs.filters.date.today'),
            value: [dayjs().startOf('day'), dayjs().endOf('day')],
        },
        {
            label: t('logs.filters.date.last_hour'),
            value: [dayjs().subtract(1, 'hour').startOf('hour'), dayjs().endOf('hour')],
        },
        {
            label: t('logs.filters.date.last_7_days'),
            value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
        },
        {
            label: t('logs.filters.date.last_30_days'),
            value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')],
        },
    ];

    const _handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            // Sync pending dates with current committed value when reopening
            setPendingDates([dayjs.unix(value.from), dayjs.unix(value.to)]);
        }
    };

    const _handleRangeChange: ComponentProps<typeof KitDatePicker.RangePicker>['onChange'] = dates => {
        if (!dates || !dates[0] || !dates[1]) {
            return;
        }
        const [from, to] = dates;
        setPendingDates([from, to]);

        const matchingPreset = presets.find(
            p =>
                dayjs.isDayjs(p.value[0]) &&
                dayjs.isDayjs(p.value[1]) &&
                p.value[0].isSame(from, 'day') &&
                p.value[1].isSame(to, 'day'),
        );
        onChange({
            from: from.startOf('day').unix(),
            to: to.endOf('day').unix(),
            label: matchingPreset
                ? String(matchingPreset.label)
                : `${from.format('DD/MM/YYYY')} – ${to.format('DD/MM/YYYY')}`,
        });
    };

    const displayLabel = value.label.startsWith('logs.filters.date.') ? t(value.label) : value.label;

    return (
        <span>
            <KitFilter
                label={t('logs.filters.date.label')}
                active
                expandable
                showSingleValue
                disabled={loading}
                values={[displayLabel]}
                dropDownProps={{
                    classNames: {root: filterDropdownContainer},
                    onOpenChange: _handleOpenChange,
                    popupRender: () => (
                        <>
                            <KitDatePicker.RangePicker
                                open
                                className={rangePickerInput}
                                value={pendingDates}
                                presets={presets}
                                size="middle"
                                getPopupContainer={() => datePickerContainerRef.current ?? document.body}
                                renderExtraFooter={() => <FilterDropdownFooter onReset={onReset} hideDivider />}
                                onChange={_handleRangeChange}
                            />
                            <KitDivider className={dateFilterDivider} />
                            <div className={rangePickerDropdownContainer} ref={datePickerContainerRef} />
                        </>
                    ),
                }}
            />
        </span>
    );
};
