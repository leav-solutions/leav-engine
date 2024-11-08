// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputWrapper, KitSwitch, KitTypography} from 'aristid-ds';
import {FunctionComponent, MouseEvent} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {IKitSwitch} from 'aristid-ds/dist/Kit/DataEntry/Switch/types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons';

interface IDSBooleanWrapperProps extends IProvidedByAntFormItem<IKitSwitch> {
    state: IStandardFieldReducerState;
    handleSubmit: (value: string, id?: string) => void;
}

const KitTypographyTextStyled = styled(KitTypography.Text)<{$shouldHighlightColor: boolean}>`
    vertical-align: middle;
    margin-left: calc(var(--general-spacing-xs) * 1px);
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

const FontAwesomeIconStyled = styled(FontAwesomeIcon)`
    vertical-align: middle;
    margin-left: calc(var(--general-spacing-xs) * 1px);
    color: var(--general-utilities-text-primary);
    cursor: pointer;
`;

const _getBooleanValueAsStringForTranslation = (value: boolean): string => (value ? 'global.yes' : 'global.no');

export const DSBooleanWrapper: FunctionComponent<IDSBooleanWrapperProps> = ({value, onChange, state, handleSubmit}) => {
    if (!onChange) {
        throw Error('DSBooleanWrapper should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const {lang: availableLang} = useLang();

    const _resetToInheritedOrCalculatedValue = () => {
        if (state.isInheritedValue) {
            onChange(state.inheritedValue.raw_value, undefined);
        } else if (state.isCalculatedValue) {
            onChange(state.calculatedValue.raw_value, undefined);
        }
        handleSubmit('', state.attribute.id);
    };

    const _handleOnChange: (checked: boolean, event: MouseEvent<HTMLButtonElement>) => void = (checked, event) => {
        handleSubmit(String(checked), state.attribute.id);
        onChange(checked, event);
    };

    const _getHelper = () => {
        if (state.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {
                inheritedValue: t(_getBooleanValueAsStringForTranslation(state.inheritedValue.raw_value))
            });
        } else if (state.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {
                calculatedValue: t(_getBooleanValueAsStringForTranslation(state.calculatedValue.raw_value))
            });
        }
        return undefined;
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitInputWrapper
            label={label}
            helper={_getHelper()}
            status={errors.length > 0 ? 'error' : undefined}
            disabled={state.isReadOnly}
        >
            <label>
                <KitSwitch checked={value} disabled={state.isReadOnly} onChange={_handleOnChange} />
                <KitTypographyTextStyled
                    size="fontSize5"
                    weight="medium"
                    $shouldHighlightColor={state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue}
                >
                    {t(_getBooleanValueAsStringForTranslation(value))}
                </KitTypographyTextStyled>
            </label>
            {(state.isInheritedOverrideValue || state.isCalculatedOverrideValue) && (
                <span role="button" onClick={_resetToInheritedOrCalculatedValue}>
                    <FontAwesomeIconStyled aria-label="clear" icon={faCircleXmark} />
                </span>
            )}
        </KitInputWrapper>
    );
};
