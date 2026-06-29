import {type ComponentProps, type FunctionComponent, useRef} from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {KitAvatar, KitDatePicker, KitTypography} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {type IFilterChildrenDropDownProps} from './_types';
import {dateValuesSeparator} from '_ui/components/Explorer/_queries/useExplorerData';
import {type RecordFilterCondition} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faCircleExclamation} from '@fortawesome/free-solid-svg-icons';
import {type IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';

const DatePickerContainerStyledDiv = styled.div`
    .ant-picker {
        width: 100%;
    }

    padding-left: calc(var(--general-spacing-xs) * 1px);
`;

const DatePickerDropdowncontainerStyledDiv = styled.div`
    .ant-picker-dropdown {
        position: initial;

        .ant-picker-panel-container {
            box-shadow: none;
        }
    }
`;

const ContainerStyledDiv = styled.div`
    display: flex;
`;

const DatePickerOptionsContainerStyledDiv = styled.div`
    display: inline-block;
    border-right: 1px solid var(--general-utilities-border);
    padding: calc(var(--general-spacing-s) * 1px) calc(var(--general-spacing-s) * 1px)
        calc(var(--general-spacing-s) * 1px) calc(var(--general-spacing-xs) * 1px);

    & + div {
        display: inline-block;
    }

    ul {
        padding: 0;
        margin: 0;

        li {
            display: flex;
            justify-content: space-between;
            gap: calc(var(--general-spacing-xs) * 1px);
            border-radius: calc(var(--general-spacing-xs) * 1px);
            padding: calc(var(--general-spacing-xs) * 1px);
            list-style-type: none;
            cursor: pointer;
            height: 100%;

            & > span {
                display: inline-flex;
                gap: calc(var(--general-spacing-xs) * 1px);
            }

            .active-icon {
                color: var(--general-utilities-main-default);
            }

            &.active {
                background: var(--general-utilities-main-light);
            }
        }
    }
`;

const PresetItem: FunctionComponent<{
    filter: IFilterChildrenDropDownProps['filter'];
    condition: RecordFilterCondition;
    leftIcon?: IKitAvatar['icon'];
    title: string;
    onClick: () => void;
}> = ({filter, condition, title, leftIcon, onClick}) => (
    <li className={filter.condition === condition ? 'active' : ''} onClick={onClick}>
        <span>
            {leftIcon && <KitAvatar size="xs" shape="square" icon={leftIcon} />}
            <KitTypography.Text size="fontSize7" weight="regular">
                {title}
            </KitTypography.Text>
        </span>
        {filter.condition === condition && <FontAwesomeIcon icon={faCheck} className="active-icon" />}
    </li>
);

export const DateAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
}) => {
    const datePickerRef = useRef<HTMLDivElement>(null);
    const {t} = useSharedTranslation();

    const onClickPreset = (presetCondition: RecordFilterCondition) => () => {
        if (filter.condition === presetCondition) {
            return;
        }
        onFilterChange({
            ...filter,
            condition: presetCondition,
            value: null,
            formattedValue: null,
        });
    };

    const _onDateChanged: ComponentProps<typeof KitDatePicker>['onChange'] = date => {
        const formattedToday = dayjs().format('YYYY-MM-DD');
        const formattedValue = date ? date.format('YYYY-MM-DD') : null;
        const condition =
            filter.condition === AttributeConditionFilter.TODAY && formattedValue !== formattedToday
                ? AttributeConditionFilter.EQUAL
                : filter.condition;

        onFilterChange({
            ...filter,
            condition,
            value: date ? String(date.unix()) : null,
            formattedValue: date ? date.format('YYYY-MM-DD') : null, //TODO: Date format should come from the backend (will be adress in a later ticket)
        });
    };

    const _onDateRangeChanged: ComponentProps<typeof KitDatePicker.RangePicker>['onChange'] = dates => {
        let value: string | null = null;
        let formattedValue: string | null = null;

        if (dates && dates.length === 2) {
            let [dateFrom, dateTo] = dates;

            if (dateFrom && dateTo) {
                dateFrom = dateFrom.startOf('day');
                dateTo = dateTo.endOf('day');

                value = dateFrom.unix() + dateValuesSeparator + dateTo.unix();
                formattedValue = dateFrom.format('YYYY-MM-DD') + ' -> ' + dateTo.format('YYYY-MM-DD'); //TODO: Date format should come from the backend (will be adress in a later ticket)
            }
        }

        onFilterChange({...filter, value, formattedValue});
    };

    const getDateRangeValue = (dates: string): [dayjs.Dayjs, dayjs.Dayjs] => {
        const [dateFrom, dateTo] = dates.split(dateValuesSeparator).map(date => dayjs.unix(Number(date)));
        return [dateFrom, dateTo];
    };

    return (
        <ContainerStyledDiv>
            <DatePickerOptionsContainerStyledDiv>
                <ul>
                    <PresetItem
                        filter={filter}
                        condition={AttributeConditionFilter.TODAY}
                        onClick={onClickPreset(AttributeConditionFilter.TODAY)}
                        title={t('explorer.date_presets.today')}
                    />
                    <PresetItem
                        filter={filter}
                        condition={AttributeConditionFilter.EQUAL}
                        onClick={onClickPreset(AttributeConditionFilter.EQUAL)}
                        title={t('explorer.date_presets.some_day')}
                    />
                    <PresetItem
                        filter={filter}
                        condition={AttributeConditionFilter.LESS_THAN}
                        onClick={onClickPreset(AttributeConditionFilter.LESS_THAN)}
                        title={t('filters.before')}
                    />
                    <PresetItem
                        filter={filter}
                        condition={AttributeConditionFilter.GREATER_THAN}
                        onClick={onClickPreset(AttributeConditionFilter.GREATER_THAN)}
                        title={t('filters.after')}
                    />
                    <PresetItem
                        filter={filter}
                        condition={AttributeConditionFilter.BETWEEN}
                        onClick={onClickPreset(AttributeConditionFilter.BETWEEN)}
                        title={t('explorer.date_presets.between_dates')}
                    />
                    <PresetItem
                        filter={filter}
                        condition={AttributeConditionFilter.IS_EMPTY}
                        onClick={onClickPreset(AttributeConditionFilter.IS_EMPTY)}
                        title={t('explorer.date_presets.undefined')}
                        leftIcon={<FontAwesomeIcon icon={faCircleExclamation} />}
                    />
                </ul>
            </DatePickerOptionsContainerStyledDiv>
            <div>
                <DatePickerContainerStyledDiv>
                    {filter.condition === AttributeConditionFilter.BETWEEN ? (
                        <KitDatePicker.RangePicker
                            open
                            getPopupContainer={() => datePickerRef.current ?? document.body}
                            value={filter.value ? getDateRangeValue(filter.value) : null}
                            onChange={_onDateRangeChanged}
                        />
                    ) : (
                        <KitDatePicker
                            open
                            getPopupContainer={() => datePickerRef.current ?? document.body}
                            value={
                                filter.value
                                    ? dayjs.unix(Number(filter.value))
                                    : filter.condition === AttributeConditionFilter.TODAY
                                      ? dayjs()
                                      : null
                            }
                            showNow={false}
                            onChange={_onDateChanged}
                        />
                    )}
                    <DatePickerDropdowncontainerStyledDiv ref={datePickerRef} />
                </DatePickerContainerStyledDiv>
            </div>
        </ContainerStyledDiv>
    );
};
