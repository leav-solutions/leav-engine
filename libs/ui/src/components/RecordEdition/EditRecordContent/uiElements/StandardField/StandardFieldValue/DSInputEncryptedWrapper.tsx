// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ChangeEvent, FocusEvent, FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import {IStandFieldValueContentProps} from './_types';
import {IKitPassword} from 'aristid-ds/dist/Kit/DataEntry/Input/types';
import {KitInput} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const DSInputEncryptedWrapper: FunctionComponent<IStandFieldValueContentProps<IKitPassword>> = ({
    value,
    onChange,
    attribute,
    handleSubmit,
    readonly
}) => {
    if (!onChange) {
        throw Error('DSInputEncryptedWrapper should be used inside a antd Form.Item');
    }

    const [hasChanged, setHasChanged] = useState(false);

    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;

    const _handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
        setHasChanged(false);
        if (hasChanged) {
            const valueToSubmit = event.target.value;
            handleSubmit(valueToSubmit, attribute.id);
        }

        onChange(event);
    };

    const _handleOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);
        onChange(event);
    };

    return (
        <KitInput.Password
            id={attribute.id}
            autoComplete="new-password"
            data-testid="kit-input-password"
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={value}
            placeholder={t('record_edition.placeholder.enter_a_password')}
            disabled={readonly}
            allowClear
            onChange={_handleOnChange}
            onBlur={_handleOnBlur}
        />
    );
};
