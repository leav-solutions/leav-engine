// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AntForm, KitCollapse, KitIdCard, KitSpace} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {BooleanField} from '../field/BooleanField';
import {TextField} from '../field/TextField';
import {type AutomationFormType} from '../types';

const AUTOMATION_INFO_STEP = '1';
const AUTOMATION_INFO_KEY = 'automation-info';

type AutomationInfoSectionProps = {
    formType: AutomationFormType;
    loading: boolean;
};

export const AutomationInfoSection = ({formType, loading}: AutomationInfoSectionProps) => {
    const {t} = useTranslation();

    return (
        <KitCollapse
            defaultActiveKey={[AUTOMATION_INFO_KEY]}
            items={[
                {
                    key: AUTOMATION_INFO_KEY,
                    label: (
                        <KitIdCard
                            avatarProps={{label: AUTOMATION_INFO_STEP, shape: 'square'}}
                            title={t('automation.form.sections.info')}
                            size="m"
                        />
                    ),
                    children: (
                        <KitSpace direction="vertical" size="s" style={{width: '100%'}}>
                            {/* Active field is only displayed on edition form. When creating a new automation, it is always set to false. */}
                            {formType === 'edition' && (
                                <AntForm.Item name="active" valuePropName="checked" noStyle>
                                    <BooleanField label={t('automation.form.fields.active')} disabled={loading} />
                                </AntForm.Item>
                            )}
                            <AntForm.Item
                                name="label"
                                rules={[{required: true, message: t('automation.form.fields.label_required')}]}
                                noStyle
                            >
                                <TextField
                                    name="label"
                                    label={t('automation.form.fields.label')}
                                    placeholder={t('automation.form.fields.label_placeholder')}
                                    disabled={loading}
                                    required
                                />
                            </AntForm.Item>
                            <AntForm.Item name="description" noStyle>
                                <TextField
                                    name="description"
                                    label={t('automation.form.fields.description')}
                                    placeholder={t('automation.form.fields.description_placeholder')}
                                    disabled={loading}
                                />
                            </AntForm.Item>
                        </KitSpace>
                    ),
                },
            ]}
        />
    );
};
