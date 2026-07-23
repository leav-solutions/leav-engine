import {type ComponentProps, type FunctionComponent} from 'react';
import {type KitSelect} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IFilterChildrenDropDownProps} from './_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {FilterSelect} from './FilterSelect';

export const EncryptedAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
    allowClearCondition,
}) => {
    const {t} = useSharedTranslation();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition =>
        onFilterChange({...filter, condition});

    return (
        <FilterSelect
            options={conditionOptionsByType}
            onChange={_onConditionChanged}
            value={filter.condition}
            allowClear={allowClearCondition}
            getPopupContainer={() => selectDropDownRef?.current ?? document.body}
            placeholder={t('explorer.select-condition')}
        />
    );
};
