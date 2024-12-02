// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ChangeEvent, FocusEvent, FunctionComponent} from 'react';
import {Form} from 'antd';
import {IStandFieldValueContentProps} from './_types';
import {IKitPassword} from 'aristid-ds/dist/Kit/DataEntry/Input/types';
import {KitInput} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const DSInputEncryptedWrapper: FunctionComponent<IStandFieldValueContentProps<IKitPassword>> = ({
    'data-testid': dataTestId,
    value,
    onChange,
    state,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSInputEncryptedWrapper should be used inside a antd Form.Item');
    }

    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;

    const _handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
        const valueToSubmit = event.target.value;
        handleSubmit(valueToSubmit, state.attribute.id);

        onChange(event);
    };

    const _handleOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        onChange(event);
        if (inputValue === '' && event.type === 'click') {
            await handleSubmit(null, state.attribute.id);
        }
    };

    return (
        <KitInput.Password
            data-testid={dataTestId}
            autoComplete="new-password"
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={value}
            placeholder={t('record_edition.placeholder.enter_a_password')}
            disabled={state.isReadOnly}
            allowClear
            onChange={_handleOnChange}
            onBlur={_handleOnBlur}
        />
    );
};
