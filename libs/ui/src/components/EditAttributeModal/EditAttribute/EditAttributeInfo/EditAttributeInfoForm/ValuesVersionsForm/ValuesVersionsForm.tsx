// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Form, Select, Space, Switch} from 'antd';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {ValueVersionMode, useGetVersionProfilesQuery} from '../../../../../../_gqlTypes';
import {useLang} from '../../../../../../hooks';
import FieldsGroup from '../../../../../FieldsGroup';
import {Loading} from '../../../../../Loading';

interface IValuesVersionsFormProps {
    onChange: (field: string | string[], value: string | boolean) => void;
    isReadOnly: boolean;
    isEditing: boolean;
    extra?: ReactNode;
}

function ValuesVersionsForm({isReadOnly, onChange, extra}: IValuesVersionsFormProps): JSX.Element {
    const form = Form.useFormInstance();
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const isVersionable = Form.useWatch(['versions_conf', 'versionable'], form);

    const {loading: profilesLoading, error: profilesError, data: profilesData} = useGetVersionProfilesQuery({
        skip: !isVersionable
    });

    const modeSelectOptions = Object.values(ValueVersionMode).map(mode => ({
        key: mode,
        label: t(`attributes.versions_mode_${mode}`),
        value: mode
    }));

    const profilesSelectOptions = (profilesData?.versionProfiles?.list ?? []).map(profile => ({
        key: profile.id,
        label: localizedTranslation(profile.label, lang),
        value: profile.id
    }));

    const _handleChange = (value: string | boolean) => {
        onChange('versions_conf', value);
    };

    const groupLabel = (
        <Space>
            {t('attributes.values_versions')}
            {extra}
        </Space>
    );

    return (
        <FieldsGroup label={groupLabel} key="attribute_values_versions">
            <Form.Item
                name={['versions_conf', 'versionable']}
                key="versions_versionable"
                label={t('attributes.versionable')}
                validateTrigger={['onChange', 'onSubmit']}
                valuePropName="checked"
            >
                <Switch disabled={isReadOnly} onChange={_handleChange} />
            </Form.Item>
            {isVersionable && (
                <>
                    {profilesLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <Form.Item
                                name={['versions_conf', 'profile']}
                                key="versions_profile"
                                label={t('attributes.versions_profile')}
                                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                            >
                                <Select
                                    onChange={_handleChange}
                                    options={profilesSelectOptions}
                                    disabled={isReadOnly}
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item
                                name={['versions_conf', 'mode']}
                                key="versions_mode"
                                label={t('attributes.versions_mode')}
                                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                            >
                                <Select
                                    onChange={_handleChange}
                                    options={modeSelectOptions}
                                    disabled={isReadOnly}
                                    allowClear
                                />
                            </Form.Item>
                        </>
                    )}
                </>
            )}
        </FieldsGroup>
    );
}

export default ValuesVersionsForm;
