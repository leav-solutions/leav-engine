import {type ComponentProps, type FunctionComponent} from 'react';
import {KitSelect} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IFilterChildrenDropDownProps} from './_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';

export const EncryptedAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
}) => {
    const {t} = useSharedTranslation();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition =>
        onFilterChange({...filter, condition});

    return (
        <KitSelect
            options={conditionOptionsByType}
            onChange={_onConditionChanged}
            value={filter.condition}
            getPopupContainer={() => selectDropDownRef?.current ?? document.body}
            placeholder={t('explorer.select-condition')}
        />
    );
};
