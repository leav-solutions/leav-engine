// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import React, {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, DropdownProps, Form, Icon, Message, Ref} from 'semantic-ui-react';
import {CUSTOM_EXPIRATION_DATE, NEVER_EXPIRATION_DATE} from '../EditApiKeyForm';

function ExpirationSelector({onChange, label, value, ...dropdownProps}: DropdownProps): JSX.Element {
    const {t} = useTranslation();
    const dropdownRef = useRef();
    const [isSelectorVisible, setIsSelectorVisible] = React.useState(false);
    const [isCustomDateSelectorVisible, setIsCustomDateSelectorVisible] = React.useState(false);

    const _handleEditExpirationChange = () => {
        setIsSelectorVisible(true);
    };

    const _handleExpirationChange = (e, data) => {
        if (data.value === CUSTOM_EXPIRATION_DATE) {
            setIsCustomDateSelectorVisible(true);
        } else {
            setIsSelectorVisible(false);
            setIsCustomDateSelectorVisible(false);

            if (data.value === NEVER_EXPIRATION_DATE) {
                data.value = null;
            }

            onChange(e, data);
        }
    };

    const _handleCustomDateChange = (e, data) => {
        const timestampValue = dayjs(data.value).unix();
        onChange(e, {...data, value: timestampValue});
    };

    const now = dayjs();
    const expirationPresets = [
        {text: t('api_keys.one_week'), value: now.add(1, 'week').unix()},
        {text: t('api_keys.one_month'), value: now.add(1, 'month').unix()},
        {text: t('api_keys.six_months'), value: now.add(6, 'months').unix()},
        {text: t('api_keys.one_year'), value: now.add(1, 'year').unix()}
    ];

    const expirationDropdownOptions = [
        {
            text: t('api_keys.never'),
            value: NEVER_EXPIRATION_DATE
        },
        ...expirationPresets,
        {
            text: t('api_keys.custom') + '...',
            value: CUSTOM_EXPIRATION_DATE
        }
    ];

    const hasExpired = value && Number(value) < Date.now() / 1000;

    return (
        <>
            <label>{label}</label>
            <Message info visible>
                <p>
                    <Icon name="info circle" />
                    {value
                        ? hasExpired
                            ? t('api_keys.expiration_reminder_expired', {
                                  date: new Date(Number(value) * 1000).toLocaleString(),
                                  interpolation: {escapeValue: false}
                              })
                            : t('api_keys.expiration_reminder', {
                                  date: new Date(Number(value) * 1000).toLocaleString(),
                                  interpolation: {escapeValue: false}
                              })
                        : t('api_keys.expiration_reminder_never')}
                </p>
            </Message>
            {isSelectorVisible && (
                <>
                    <Ref innerRef={dropdownRef}>
                        <Form.Dropdown
                            {...dropdownProps}
                            onChange={_handleExpirationChange}
                            options={expirationDropdownOptions}
                        />
                    </Ref>
                    {isCustomDateSelectorVisible && (
                        <Form.Input
                            data-testid="custom-date-input"
                            type="date"
                            aria-label="expiresAt"
                            title="expiresAt"
                            onChange={_handleCustomDateChange}
                            width={4}
                            name="expiresAt"
                        />
                    )}
                </>
            )}
            {!isSelectorVisible && (
                <Button onClick={_handleEditExpirationChange} size="small" basic>
                    {t('api_keys.edit_expiration')}
                </Button>
            )}
        </>
    );
}

export default ExpirationSelector;
