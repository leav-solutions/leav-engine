// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {Checkbox, Divider, Form, Input, Modal, Select} from 'antd';
import useStateFilters from 'hooks/FiltersStateHook/FiltersStateHook';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {localizedLabel} from 'utils';
import {defaultSort, viewSettingsField} from '../../../constants/constants';
import {useStateItem} from '../../../Context/StateItemsContext';
import addViewMutation, {
    IAddViewMutation,
    IAddViewMutationVariables,
    IAddViewMutationVariablesView
} from '../../../graphQL/mutations/views/addViewMutation';
import {IActiveLibrary} from '../../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar';
import {ILabel, ViewType} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

type IFormValues = {
    [x: string]: string;
} & {type: ViewType; shared: boolean};

interface IAddViewProps {
    visible: boolean;
    onClose: () => void;
    activeLibrary?: IActiveLibrary; // use activeLibrary props instead of hook useActiveLibrary to avoid apollo warning
}

function AddView({visible, onClose, activeLibrary}: IAddViewProps): JSX.Element {
    const {t} = useTranslation();

    const {stateItems, dispatchItems} = useStateItem();
    const {stateFilters} = useStateFilters();
    const [{availableLangs, defaultLang, lang}] = useLang();

    const [form] = Form.useForm();

    const [confirmLoading, setConfirmLoading] = useState(false);

    const [addView] = useMutation<IAddViewMutation, IAddViewMutationVariables>(addViewMutation, {
        ignoreResults: true
    });

    const _handleSubmit = async (formValues: IFormValues) => {
        setConfirmLoading(true);
        if (activeLibrary) {
            const label = availableLangs.reduce((acc, availableLang) => {
                acc[availableLang] = formValues[`viewName-${availableLang}`];
                return acc;
            }, {} as ILabel);

            const description = availableLangs.reduce((acc, availableLang) => {
                acc[availableLang] = formValues[`description-${availableLang}`];
                return acc;
            }, {} as ILabel);

            // Fields
            let viewFields: string[] = [];
            if (formValues.type === ViewType.list) {
                viewFields = stateItems.fields.map(field => {
                    const settingsField = field.key;
                    return settingsField;
                });
            }

            const color = formValues.color ?? themingVar['@primary-color'];

            const newView: IAddViewMutationVariablesView = {
                library: activeLibrary?.id,
                type: formValues.type,
                shared: !!formValues.shared,
                label,
                description,
                color,
                filters: stateFilters.queryFilters,
                sort: defaultSort,
                settings: [
                    {
                        name: viewSettingsField,
                        value: viewFields
                    }
                ]
            };

            try {
                // save view in backend
                const newViewRes = await addView({variables: {view: newView}});

                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_VIEW,
                    view: {
                        ...stateItems.view,
                        current: {
                            id: newViewRes.data.saveView.id,
                            label: localizedLabel(label, lang),
                            type: formValues.type,
                            shared: !!formValues.shared,
                            sort: defaultSort
                        }
                    }
                });
            } catch (e) {
                console.error(e);
            }

            // refetch views
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_RELOAD_VIEW,
                reload: true
            });
        }

        // reset form fields values
        form.resetFields();

        setConfirmLoading(false);

        onClose();
    };

    const _handleOk = () => {
        form.submit();
    };

    const _handleCancel = () => {
        onClose();
    };

    return (
        <Modal
            title={t('view.add-view.new-view')}
            visible={visible}
            onOk={_handleOk}
            onCancel={_handleCancel}
            destroyOnClose={true}
            confirmLoading={confirmLoading}
        >
            <Form
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                form={form}
                onFinish={_handleSubmit}
                initialValues={{type: ViewType.list}}
            >
                {availableLangs.map(availableLang => (
                    <div key={availableLang}>
                        <h2>{t(`language.${availableLang}`)}</h2>

                        <Form.Item
                            label={t('view.add-view.view-name')}
                            name={`viewName-${availableLang}`}
                            rules={defaultLang === availableLang ? [{required: true}] : []}
                            data-testid={`input-viewName-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label={t('view.add-view.view-description')}
                            name={`description-${availableLang}`}
                            data-testid={`input-description-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Divider />
                    </div>
                ))}

                <Form.Item label={t('view.add-view.view-type')} name="type" data-testid="input-type">
                    <Select>
                        <Select.Option value={ViewType.list}>{t('view.type-list')}</Select.Option>
                        <Select.Option value={ViewType.cards}>{t('view.type-cards')}</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="shared"
                    valuePropName="checked"
                    data-testid="input-shared"
                    wrapperCol={{offset: 8, span: 16}}
                >
                    <Checkbox>{t('view.add-view.view-shared')}</Checkbox>
                </Form.Item>

                <Form.Item label={t('view.add-view.view-color')} name="color" data-testid="input-color">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddView;
