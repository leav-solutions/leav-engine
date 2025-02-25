// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {idFormatRegex, slugifyString} from '@leav/utils';
import {Form, FormInstance, Input, Select} from 'antd';
import React, {useState} from 'react';
import {useLang} from '../../../../../hooks';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import {TreeBehavior, TreeDetailsFragment} from '../../../../../_gqlTypes';
import FieldsGroup from '../../../../FieldsGroup';
import {SubmitStateNotifier} from '../../../../SubmitStateNotifier';
import {TreeLibrariesForm} from './TreeLibrariesForm';

export type FormValues = Partial<TreeDetailsFragment>;

interface IEditTreeInfoFormProps {
    form: FormInstance;
    tree: TreeDetailsFragment;
    loading: boolean;
    onSubmitField: (field: string, value: any) => Promise<void>;
    onCheckTreeUniqueness: (value: string) => Promise<boolean>;
    readOnly?: boolean;
}

function EditTreeInfoForm({
    form,
    tree,
    onSubmitField,
    onCheckTreeUniqueness,
    loading,
    readOnly: isReadOnly
}: IEditTreeInfoFormProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {availableLangs, defaultLang} = useLang();
    const [hasIdBeenEdited, setHasIdBeenEdited] = useState(false);
    const [runningFieldsSubmit, setRunningFieldsSubmit] = useState<string[]>([]);
    const [processedFieldsSubmit, setProcessedFieldsSubmit] = useState<string[]>([]);

    const isEditing = !!tree;

    const _getRequiredMessage = (field: string) =>
        t('errors.field_required', {
            interpolation: {escapeValue: false},
            fieldName: t(`trees.${field}`)
        });

    const _handleLabelChange = (labelLang: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // If ID hasn't been edited manually, generate it from label
        if (!isEditing && labelLang === defaultLang && !hasIdBeenEdited) {
            form.setFieldsValue({id: slugifyString(e.target.value)});
        }
    };

    const _handleIdChange = () => {
        setHasIdBeenEdited(true);
    };

    const _handleTreeUniquenessValidation = async (rule, value) => {
        if (value && (!isEditing || value !== formInitValues.id)) {
            const isTreeUnique = await onCheckTreeUniqueness(value);

            if (!isTreeUnique) {
                throw new Error();
            }
        }
    };

    const _handleFieldSubmit = async (field: string, value: any) => {
        if (!isEditing) {
            return;
        }

        // Consider boolean fields as always touched
        if (!form.isFieldTouched(field) && typeof value !== 'boolean') {
            return;
        }

        setRunningFieldsSubmit([...runningFieldsSubmit, field]);

        await onSubmitField(field, value);
        setProcessedFieldsSubmit([...processedFieldsSubmit, field]);

        setRunningFieldsSubmit(runningFieldsSubmit.filter(f => f !== field));
    };

    const _handleLibrariesChange = (libraries: TreeDetailsFragment['libraries']) => {
        _handleFieldSubmit('libraries', libraries);
    };

    const _handleBlur = (field: string) => async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        _handleFieldSubmit(field, e.target.value);
    };

    const _handleSubmitOnEnter =
        (field: string) => (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            // If shift is pressed, don't submit
            if (e.shiftKey || !isEditing) {
                return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();

            _handleFieldSubmit(field, e.currentTarget.value);
        }
    };

    const {label: treeLabel, ...treeSettings} = tree ?? {};
    const label = treeLabel
        ? {
              ...availableLangs.reduce((acc, availableLang) => {
                  acc[`label_${availableLang}`] = tree.label[availableLang] ?? '';
                  return acc;
              }, {})
          }
        : {};

    const formInitValues: FormValues = {
        behavior: TreeBehavior.standard,
        ...treeSettings,
        ...label
    };

    const behaviorSelectOptions = Object.values(TreeBehavior).map(b => ({
        key: b,
        value: b,
        label: t(`trees.behavior_${b}`)
    }));

    const _getFieldState = (field: string) => {
        if (runningFieldsSubmit.find(f => f === field)) {
            return 'processing';
        } else if (processedFieldsSubmit.find(f => f === field)) {
            return 'success';
        } else if (form.getFieldError(field).length) {
            return 'error';
        } else {
            return 'idle';
        }
    };

    return (
        <Form
            aria-label="tree_form"
            form={form}
            labelCol={{span: 6}}
            wrapperCol={{span: 24}}
            initialValues={formInitValues}
            labelWrap
            disabled={!isEditing && loading}
        >
            <FieldsGroup label={t('trees.label')} key="tree_label">
                {availableLangs.map(availableLang => (
                    <Form.Item
                        key={`label_${availableLang}`}
                        name={`label_${availableLang}`}
                        label={availableLang.toLowerCase()}
                        labelCol={{span: 2}}
                        wrapperCol={{span: 22}}
                        rules={[
                            {required: availableLang === defaultLang, message: t('errors.default_language_required')}
                        ]}
                        style={{marginBottom: '0.5rem'}}
                    >
                        <Input
                            aria-label={`label_${availableLang}`}
                            onChange={_handleLabelChange(availableLang)}
                            onBlur={_handleBlur(`label_${availableLang}`)}
                            onKeyPress={_handleSubmitOnEnter(`label_${availableLang}`)}
                            disabled={isReadOnly || !!runningFieldsSubmit.find(f => f === `label_${availableLang}`)}
                            suffix={<SubmitStateNotifier state={_getFieldState(`label_${availableLang}`)} />}
                        />
                    </Form.Item>
                ))}
            </FieldsGroup>
            <Form.Item
                name="id"
                key="id"
                label={t('global.id')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                rules={[
                    {required: true, message: _getRequiredMessage('id')},
                    {pattern: idFormatRegex, message: t('errors.invalid_id_format')},
                    {
                        validateTrigger: ['onBlur', 'onSubmit'],
                        validator: _handleTreeUniquenessValidation,
                        message: t('errors.id_already_exists')
                    }
                ]}
                hasFeedback
            >
                <Input disabled={isReadOnly || isEditing} onChange={_handleIdChange} />
            </Form.Item>
            <Form.Item
                name="behavior"
                key="behavior"
                label={t('trees.behavior')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                rules={[{required: true, message: _getRequiredMessage('behavior')}]}
                hasFeedback
            >
                <Select options={behaviorSelectOptions} disabled={isReadOnly || isEditing} aria-label="" />
            </Form.Item>
            <Form.Item name="libraries" key="libraries">
                <TreeLibrariesForm
                    readOnly={isReadOnly}
                    onChange={_handleLibrariesChange}
                    extra={<SubmitStateNotifier state={_getFieldState('libraries')} />}
                />
            </Form.Item>
        </Form>
    );
}

export default EditTreeInfoForm;
