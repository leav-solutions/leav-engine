// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AntForm, KitButton, KitGrid, KitIdCard, KitModal, KitSpace} from 'aristid-ds';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackButton} from '../../ui/button/BackButton';
import {PageContainer} from '../../ui/page/PageContainer';
import {PageHeader} from '../../ui/page/PageHeader';
import {type AutomationFormType, type AutomationFormValues} from './types';
import {AutomationInfoSection} from './section/AutomationInfoSection';
import {BREAK_TWO_LINES, COL_RESPONSIVE_CONFIG} from './constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faSave} from '@fortawesome/free-solid-svg-icons';

type AutomationFormProps = {
    initialValues: AutomationFormValues;
    loading: boolean;
    formType: AutomationFormType;
    onSubmit: (values: AutomationFormValues) => Promise<void>;
    onCancel: () => void;
};

export const AutomationForm = ({initialValues, loading, formType, onSubmit, onCancel}: AutomationFormProps) => {
    const {t} = useTranslation();
    const [form] = AntForm.useForm<AutomationFormValues>();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const isCreationForm = formType === 'creation';

    const title = isCreationForm ? t('automation.form.create.title') : t('automation.form.edit.title');
    const submitLabel = isCreationForm ? t('admin.create') : t('admin.save');
    const submitIcon = isCreationForm ? <FontAwesomeIcon icon={faPlus} /> : <FontAwesomeIcon icon={faSave} />;

    const handleValuesChange = (_, allValues: AutomationFormValues) => {
        const dirty = Object.keys(allValues).some(key => allValues[key] !== initialValues[key]);
        setHasUnsavedChanges(dirty);
    };

    const handleCancel = () => {
        if (!hasUnsavedChanges) {
            onCancel();
            return;
        }

        KitModal.confirm({
            width: '100%',
            style: {content: {width: '90vw', maxWidth: '656px'}},
            type: 'confirm',
            icon: false,
            title: t('automation.form.unsaved_changes.title'),
            content: t('automation.form.unsaved_changes.content') + BREAK_TWO_LINES + t('admin.are_you_sure'),
            okText: t('admin.confirm') ?? undefined,
            cancelText: t('admin.cancel') ?? undefined,
            onOk: onCancel,
        });
    };

    // Note: useBlocker (react-router-dom) would be the idiomatic way to intercept all navigations,
    // but it requires a data router (createBrowserRouter). Until the admin router is migrated,
    // we fall back to the native popstate event to catch browser back/forward navigation.
    useEffect(() => {
        window.addEventListener('popstate', handleCancel);
        return () => window.removeEventListener('popstate', handleCancel);
    }, [hasUnsavedChanges, handleCancel, t]);

    return (
        <KitGrid.KitRow>
            <KitGrid.KitCol
                xs={{span: COL_RESPONSIVE_CONFIG.xs.span, push: COL_RESPONSIVE_CONFIG.xs.push}}
                sm={{span: COL_RESPONSIVE_CONFIG.sm.span, push: COL_RESPONSIVE_CONFIG.sm.push}}
                md={{span: COL_RESPONSIVE_CONFIG.md.span, push: COL_RESPONSIVE_CONFIG.md.push}}
                xl={{span: COL_RESPONSIVE_CONFIG.xl.span, push: COL_RESPONSIVE_CONFIG.xl.push}}
                xxl={{span: COL_RESPONSIVE_CONFIG.xxl.span, push: COL_RESPONSIVE_CONFIG.xxl.push}}
            >
                <AntForm
                    form={form}
                    initialValues={initialValues}
                    onFinish={onSubmit}
                    onValuesChange={handleValuesChange}
                    noValidate
                >
                    <PageContainer>
                        <PageHeader
                            extraAlignLeft={
                                <KitSpace direction="horizontal" size="xs">
                                    <BackButton onClick={handleCancel} />
                                    <KitIdCard title={title} size="s" />
                                </KitSpace>
                            }
                            extraAlignRight={
                                <KitSpace direction="horizontal" size="xs">
                                    <KitButton size="m" onClick={handleCancel}>
                                        {t('admin.cancel')}
                                    </KitButton>
                                    <KitButton
                                        size="m"
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        disabled={!hasUnsavedChanges || loading}
                                        icon={submitIcon}
                                    >
                                        {submitLabel}
                                    </KitButton>
                                </KitSpace>
                            }
                        />
                        <KitSpace direction="vertical" size="xs">
                            <AutomationInfoSection formType={formType} loading={loading} />
                        </KitSpace>
                    </PageContainer>
                </AntForm>
            </KitGrid.KitCol>
        </KitGrid.KitRow>
    );
};
