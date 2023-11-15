// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {useLang} from '@leav/ui';
import {Checkbox, Divider, Form, Input, Modal, Select} from 'antd';
import useUpdateViewsOrderMutation from 'graphQL/mutations/views/hooks/useUpdateViewsOrderMutation';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ViewTypes} from '_gqlTypes/globalTypes';
import {PREFIX_SHARED_VIEWS_ORDER_KEY, PREFIX_USER_VIEWS_ORDER_KEY} from '../../../../constants';
import saveViewMutation, {
    IAddViewMutation,
    IAddViewMutationVariables,
    IAddViewMutationVariablesView
} from '../../../../graphQL/mutations/views/saveViewMutation';
import {getRequestFromFilters} from '../../../../utils/getRequestFromFilter';
import {ISystemTranslation, IView} from '../../../../_types/types';

interface IFormValues {
    label: ISystemTranslation;
    description: ISystemTranslation | null;
    type: ViewTypes;
    shared: boolean;
}

interface IEditViewProps {
    view: IView;
    libraryId: string;
    onClose: () => void;
    visible: boolean;
}

function EditView({visible, onClose, view, libraryId}: IEditViewProps): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const {availableLangs, defaultLang} = useLang();
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

    const [addView] = useMutation<IAddViewMutation, IAddViewMutationVariables>(saveViewMutation);
    const {updateViewsOrder} = useUpdateViewsOrderMutation(libraryId);

    const _handleOk = async () => {
        form.submit();
    };

    const _handleCancel = () => {
        form.resetFields();
        onClose();
    };

    const _handleSubmit = async (values: IFormValues) => {
        setConfirmLoading(true);

        const upView: IAddViewMutationVariablesView = {
            id: view.id,
            library: libraryId,
            display: {type: values.type, size: view.display.size},
            shared: values.shared,
            label: values.label,
            description: !Object.values(values.description).every(x => x === '') ? values.description : null,
            settings: view.settings,
            filters: getRequestFromFilters(view.filters),
            sort: view.sort
        };

        try {
            // save view in backend
            await addView({variables: {view: upView}});
        } catch (e) {
            console.error(e);
        }

        if (view.shared !== values.shared) {
            const userViewsOrder = !values.shared
                ? [...searchState.userViewsOrder, view.id]
                : searchState.userViewsOrder.filter(id => id !== view.id);

            await updateViewsOrder({
                key: PREFIX_USER_VIEWS_ORDER_KEY + searchState.library.id,
                value: userViewsOrder,
                global: false
            });

            const sharedViewsOrder = !values.shared
                ? searchState.sharedViewsOrder.filter(id => id !== view.id)
                : [...searchState.sharedViewsOrder, view.id];

            await updateViewsOrder({
                key: PREFIX_SHARED_VIEWS_ORDER_KEY + searchState.library.id,
                value: sharedViewsOrder,
                global: false
            });
        }

        if (view.id === searchState.view.current.id) {
            searchDispatch({
                type: SearchActionTypes.CHANGE_VIEW,
                view: {
                    ...searchState.view.current,
                    label: values.label,
                    description: !Object.values(values.description).every(x => x === '') ? values.description : null,
                    display: {type: values.type, size: view.display.size},
                    shared: values.shared
                }
            });
        }

        setConfirmLoading(false);
        onClose();
    };

    return (
        <Modal
            forceRender
            title={t('view.edit-view.title')}
            open={visible}
            onCancel={_handleCancel}
            onOk={_handleOk}
            confirmLoading={confirmLoading}
        >
            <Form labelCol={{span: 8}} wrapperCol={{span: 16}} form={form} onFinish={_handleSubmit}>
                {availableLangs.map(availableLang => (
                    <div key={availableLang}>
                        <h2>{t(`language.${availableLang}`)}</h2>

                        <Form.Item
                            label={t('view.edit-view.label')}
                            name={['label', availableLang]}
                            initialValue={view.label[availableLang]}
                            rules={defaultLang === availableLang ? [{required: true}] : []}
                            data-testid={`viewName-input-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label={t('view.edit-view.description')}
                            initialValue={!!view.description ? view.description[availableLang] || '' : ''}
                            name={['description', availableLang]}
                            data-testid={`description-input-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Divider />
                    </div>
                ))}

                <Form.Item
                    label={t('view.edit-view.type')}
                    name="type"
                    data-testid="input-type"
                    initialValue={view.display.type}
                >
                    <Select>
                        <Select.Option value={ViewTypes.list}>{t('view.type-list')}</Select.Option>
                        <Select.Option value={ViewTypes.cards}>{t('view.type-cards')}</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="shared"
                    initialValue={view.shared}
                    valuePropName="checked"
                    data-testid="input-shared"
                    wrapperCol={{offset: 8, span: 16}}
                >
                    <Checkbox>{t('view.edit-view.shared')}</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditView;
