// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {FaTimes, FaSave} from 'react-icons/fa';
import {KitModal, KitButton, AntForm, KitInputWrapper, KitInput} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';

interface ISaveViewProps {
    viewData?: Record<string, string> | null;
    isOpen: boolean;
    onSubmit: (label: Record<string, string>, id?: string | undefined) => void;
    onClose: () => void;
}

const sortWithDefaultAtFirst = defaultLang => (a, b) => (b === defaultLang ? 1 : 0) - (a === defaultLang ? 1 : 0);

export const LabelViewFormModal: FunctionComponent<ISaveViewProps> = ({viewData, isOpen, onSubmit, onClose}) => {
    const {t} = useSharedTranslation();
    const {defaultLang, availableLangs} = useLang();
    const {view} = useViewSettingsContext();

    const [form] = AntForm.useForm();
    const initialValues = viewData?.label ? viewData.label : view.viewId ? view.viewLabels : {};

    const _toggleModal = () => {
        onClose();
    };

    const _handleSaveView = () => {
        form.submit();
    };

    const _onSubmit = values => {
        onSubmit(values);
        onClose();
    };

    const _preventCloseSettingsPanel = e => e.stopPropagation();

    return (
        <KitModal
            // TODO: remove appElement and put in the test : "KitModal.setAppElement(document.body) once exposed"
            appElement={document.body}
            title={t('explorer.save-view-as')}
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
            <AntForm name="label" form={form} initialValues={initialValues} onFinish={_onSubmit}>
                <KitInputWrapper label={String(t('explorer.view-name'))}>
                    {[...availableLangs].sort(sortWithDefaultAtFirst(defaultLang)).map(lang => (
                        <AntForm.Item
                            key={lang}
                            name={lang}
                            validateTrigger="onBlur"
                            rules={[
                                {
                                    required: lang === defaultLang,
                                    message: String(t('errors.standard_field_required'))
                                }
                            ]}
                        >
                            <KitInput
                                label={lang}
                                required={lang === defaultLang}
                                onMouseDown={_preventCloseSettingsPanel}
                            />
                        </AntForm.Item>
                    ))}
                </KitInputWrapper>
            </AntForm>
        </KitModal>
    );
};
