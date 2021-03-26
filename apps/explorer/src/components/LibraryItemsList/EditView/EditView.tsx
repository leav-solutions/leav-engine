// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {Divider, Form, Input, Modal, Spin} from 'antd';
import {isEqual} from 'lodash';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {viewSettingsField} from '../../../constants/constants';
import {useStateItem} from '../../../Context/StateItemsContext';
import addViewMutation, {
    IAddViewMutation,
    IAddViewMutationVariables,
    IAddViewMutationVariablesFilter,
    IAddViewMutationVariablesView
} from '../../../graphQL/mutations/views/addViewMutation';
import {
    getViewsListQuery,
    IGetViewListQuery,
    IGetViewListVariables
} from '../../../graphQL/queries/views/getViewsListQuery';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar';
import {localizedLabel} from '../../../utils';
import {ILabel, IView, ViewType} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

interface IFormValues {
    [x: string]: string;
}

interface IEditViewProps {
    visible: boolean;
    onClose: () => void;
    id: string;
}

function EditView({visible, onClose, id}: IEditViewProps): JSX.Element {
    const {t} = useTranslation();
    const [activeLibrary] = useActiveLibrary();
    const [{lang, availableLangs, defaultLang}] = useLang();
    const [form] = Form.useForm();
    const {stateItems, dispatchItems} = useStateItem();
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    const {data, loading, error} = useQuery<IGetViewListQuery, IGetViewListVariables>(getViewsListQuery, {
        variables: {
            libraryId: activeLibrary?.id || ''
        }
    });

    const currentView = data?.views.list.find(view => view.id === id);

    const [addView] = useMutation<IAddViewMutation, IAddViewMutationVariables>(addViewMutation);

    const [formValues, setFormValues] = useState<IFormValues>();

    useEffect(() => {
        if (!loading) {
            const activeView = data?.views.list.find(view => view.id === id);

            const label = Object.keys(activeView?.label ?? {})?.reduce((acc, labelLang) => {
                if (activeView?.label[labelLang]) {
                    acc[`viewName-${labelLang}`] = activeView?.label[labelLang];
                }
                return acc;
            }, {} as ILabel);

            const description = Object.keys(activeView?.description ?? {})?.reduce((acc, descrLang) => {
                if (activeView?.description && activeView?.description[descrLang]) {
                    acc[`description-${descrLang}`] = activeView?.description[descrLang];
                }
                return acc;
            }, {} as ILabel);

            const newFormValues: IFormValues = {
                ...label,
                ...description,
                color: activeView?.color ?? ''
            };

            setFormValues(currentFormsValues =>
                !isEqual(newFormValues, currentFormsValues) ? newFormValues : currentFormsValues
            );
        }
    }, [loading, data, setFormValues, lang, id, form]);

    // reset form if formValue set
    useEffect(() => {
        if (formValues && Object.keys(formValues).length) {
            form.resetFields();
        }
    }, [formValues, form]);

    const _handleOk = async () => {
        form.submit();
    };

    const _handleCancel = () => {
        form.resetFields();
        onClose();
    };

    const _handleSubmit = async (values: IFormValues) => {
        setConfirmLoading(true);
        if (currentView && activeLibrary && formValues) {
            const label = availableLangs.reduce((acc, availableLang) => {
                acc[availableLang] = values[`viewName-${availableLang}`];
                return acc;
            }, {} as ILabel);

            const description = availableLangs.reduce((acc, availableLang) => {
                if (values[`description-${availableLang}`]) {
                    acc[availableLang] = values[`description-${availableLang}`];
                }
                return acc;
            }, {} as ILabel);

            // Fields
            let viewFields: string[] = [];
            if (currentView.type === ViewType.list) {
                viewFields = stateItems.fields.map(field => {
                    const settingsField = field.key;
                    return settingsField;
                });
            }

            const viewFilters = stateItems.queryFilters.reduce((acc, queryFilter) => {
                return [...acc, queryFilter];
            }, [] as IAddViewMutationVariablesFilter[]);

            const color = values.color ?? currentView.color ?? themingVar['@primary-color'];

            const sort = {
                field: stateItems.itemsSort.field,
                order: stateItems.itemsSort.order
            };

            const newView: IAddViewMutationVariablesView = {
                id,
                library: activeLibrary.id,
                shared: currentView.shared,
                type: currentView.type,
                label,
                description,
                color,
                filters: viewFilters,
                sort,
                settings: [
                    {
                        name: viewSettingsField,
                        value: viewFields
                    }
                ]
            };

            try {
                // save view in backend
                await addView({variables: {view: newView}});
            } catch (e) {
                console.error(e);
            }

            // update current view
            const newCurrentView: IView = {
                id,
                label: localizedLabel(newView.label, lang),
                description: localizedLabel(newView.description, lang),
                type: newView.type,
                color: newView.color,
                shared: newView.shared,
                fields: newView.settings?.find(setting => setting.name === viewSettingsField)?.value ?? [],
                filters: stateItems.queryFilters,
                sort
            };

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_VIEW,
                view: {
                    current: newCurrentView
                }
            });

            // refetch views
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_RELOAD_VIEW,
                reload: true
            });
        }
        setConfirmLoading(false);
        onClose();
    };

    if (error) {
        return (
            <Modal title={t('view.add-view.edit-view')} visible={visible}>
                <Form form={form} />
                error
            </Modal>
        );
    }

    if (loading || !currentView) {
        return (
            <Modal title={t('view.add-view.edit-view')} visible={visible}>
                <Form form={form} />
                <Spin />
            </Modal>
        );
    }

    return (
        <Modal
            forceRender
            title={t('view.add-view.edit-view')}
            visible={visible}
            onCancel={_handleCancel}
            onOk={_handleOk}
            confirmLoading={confirmLoading}
        >
            <Form
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                form={form}
                onFinish={_handleSubmit}
                initialValues={formValues}
            >
                {availableLangs.map(availableLang => (
                    <div key={availableLang}>
                        <h2>{t(`language.${availableLang}`)}</h2>

                        <Form.Item
                            label={t('view.add-view.view-name')}
                            name={`viewName-${availableLang}`}
                            rules={defaultLang === availableLang ? [{required: true}] : []}
                            data-testid={`viewName-input-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label={t('view.add-view.view-description')}
                            name={`description-${availableLang}`}
                            data-testid={`description-input-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Divider />
                    </div>
                ))}

                <Form.Item label={t('view.add-view.view-color')} name="color" data-testid="color-input">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditView;
