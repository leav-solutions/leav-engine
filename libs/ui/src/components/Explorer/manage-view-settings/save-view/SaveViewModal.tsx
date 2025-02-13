// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {FaTimes, FaSave} from 'react-icons/fa';
import {KitModal, KitButton, AntForm, KitInputWrapper, KitInput} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useManageViews} from '../useManageViews';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';

interface ISaveViewProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SaveViewModal: FunctionComponent<ISaveViewProps> = ({isOpen, onClose}) => {
    const {t} = useSharedTranslation();
    const {defaultLang, availableLangs} = useLang();

    const {view} = useViewSettingsContext();
    const {handleSaveView} = useManageViews();

    const [form] = AntForm.useForm();

    const _toggleModal = () => {
        if (isOpen) {
            form.resetFields();
        }
        onClose();
    };

    const _handleSaveView = () => {
        form.validateFields();
        const hasError = form.getFieldsError().filter(field => field.errors.length > 0).length > 0;
        const hasOnlyEmptyField =
            Object.entries(form.getFieldsValue()).filter(field => field[0] === defaultLang && !!field[1]).length === 0;
        if (hasError || hasOnlyEmptyField) {
            return;
        }
        handleSaveView(form.getFieldsValue());
        onClose();
    };

    const _onCheck = () => {
        form.validateFields();
    };

    const _preventCloseSettingsPanel = e => e.stopPropagation();

    return (
        <KitModal
            // TODO: remove appElement and put in the test : "KitModal.setAppElement(document.body) once exposed"
            appElement={document.body}
            title={t('explorer.save-view')}
            showCloseIcon={false}
            close={_toggleModal}
            isOpen={isOpen}
            footer={
                <>
                    <KitButton type="secondary" onClick={_toggleModal} icon={<FaTimes />}>
                        {t('global.close')}
                    </KitButton>
                    <KitButton type="primary" onClick={_handleSaveView} icon={<FaSave />}>
                        {t('global.save')}
                    </KitButton>
                </>
            }
        >
            <AntForm name="label" form={form} initialValues={{...view.viewLabels}}>
                <KitInputWrapper label={String(t('explorer.view-name'))}>
                    {availableLangs.map((lang, index) => (
                        <AntForm.Item
                            key={index}
                            name={lang}
                            rules={[
                                {required: lang === defaultLang, message: String(t('errors.standard_field_required'))}
                            ]}
                        >
                            <KitInput
                                label={lang}
                                required={lang === defaultLang}
                                onMouseDown={_preventCloseSettingsPanel}
                                onBlur={_onCheck}
                            />
                        </AntForm.Item>
                    ))}
                </KitInputWrapper>
            </AntForm>
        </KitModal>
    );
};
