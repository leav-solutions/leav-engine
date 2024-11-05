// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, PlusOutlined} from '@ant-design/icons';
import {idFormatRegex} from '@leav/utils';
import {Form, Input, InputNumber, Popconfirm, Table} from 'antd';
import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '../../../../../../hooks/useSharedTranslation';
import {LibraryPreviewsSettingsFragment} from '../../../../../../_gqlTypes';
import {BasicButton} from '../../../../../BasicButton';

const SizeEditorFormItem = styled(Form.Item)`
    margin: 0;
`;

interface ISizesEditorProps {
    sizes: LibraryPreviewsSettingsFragment['versions']['sizes'];
    onChange: (sizes: LibraryPreviewsSettingsFragment['versions']['sizes']) => void;
    readOnly: boolean;
}

function SizesEditor({sizes, readOnly, onChange}: ISizesEditorProps): JSX.Element {
    const {t} = useSharedTranslation();
    const [sizesList, setSizesList] = useState(sizes);

    useEffect(() => {
        setSizesList(sizes);
    }, [sizes]);

    const sizesColumns = [
        {
            key: 'name',
            dataIndex: 'name',
            title: t('libraries.previews_settings.size_name'),
            render: (name, item, index) => {
                const _handleChange = e => {
                    const newSizes = [...sizesList];
                    newSizes[index] = {...newSizes[index], name: e.target.value};
                    onChange(newSizes);
                    setSizesList(newSizes);
                };

                return (
                    <SizeEditorFormItem
                        rules={[
                            {
                                pattern: idFormatRegex,
                                message: t('errors.invalid_id_format')
                            },
                            {
                                required: true,
                                message: t('errors.field_required', {
                                    interpolation: {escapeValue: false},
                                    fieldName: t('libraries.previews_settings.size_name')
                                })
                            },
                            {
                                validator: (_, value) => {
                                    const names = sizesList.map(size => size.name);
                                    const isNotUnique = names.find((sizeName, i) => sizeName === value && i !== index);
                                    if (isNotUnique) {
                                        return Promise.reject(t('libraries.previews_settings.duplicate_size_name'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        validateTrigger={['onBlur']}
                        name={['versions', 'sizes', index, 'name']}
                    >
                        <Input disabled={readOnly} type="text" onChange={_handleChange} aria-label="size_name" />
                    </SizeEditorFormItem>
                );
            }
        },
        {
            key: 'size',
            dataIndex: 'size',
            title: t('libraries.previews_settings.size'),
            render: (size, item, index) => {
                const _handleChange = value => {
                    const newSizes = [...sizesList];
                    newSizes[index] = {...newSizes[index], size: value};
                    onChange(newSizes);
                    setSizesList(newSizes);
                };

                return (
                    <SizeEditorFormItem
                        rules={[
                            {
                                required: true,
                                message: t('errors.field_required', {
                                    interpolation: {escapeValue: false},
                                    fieldName: t('libraries.previews_settings.size')
                                })
                            }
                        ]}
                        validateTrigger={['onBlur']}
                        name={['versions', 'sizes', index, 'size']}
                    >
                        <InputNumber
                            min={1}
                            disabled={readOnly}
                            addonAfter="px"
                            onChange={_handleChange}
                            aria-label="size"
                        />
                    </SizeEditorFormItem>
                );
            }
        }
    ];

    if (!readOnly) {
        sizesColumns.push({
            key: 'actions',
            dataIndex: null,
            title: null,
            render: (_, item, index) => {
                const _handleRemoveSize = () => {
                    const newSizes = [...sizesList];
                    newSizes.splice(index, 1);
                    onChange(newSizes);
                    setSizesList(newSizes);
                };

                return (
                    <Popconfirm
                        onConfirm={_handleRemoveSize}
                        title={t('libraries.previews_settings.delete_size_confirm')}
                        okText={t('global.submit')}
                        cancelText={t('global.cancel')}
                        okButtonProps={{'aria-label': 'delete-confirm'}}
                    >
                        <BasicButton
                            shape="circle"
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            centered
                            aria-label="delete"
                        />
                    </Popconfirm>
                );
            }
        });
    }

    const sizesData = sizesList.map((size, index) => ({
        key: index,
        name: size.name,
        size: size.size
    }));

    const _handleAddSize = () => {
        const newSizes = [...sizesList];
        newSizes.push({name: '', size: null});
        setSizesList(newSizes);
    };

    const footer = () => (
        <BasicButton size="small" icon={<PlusOutlined />} onClick={_handleAddSize}>
            {t('libraries.previews_settings.add_size')}
        </BasicButton>
    );

    return (
        <Table
            size="small"
            bordered
            data-testid="sizes-table"
            columns={sizesColumns}
            dataSource={sizesData}
            pagination={false}
            footer={!readOnly ? footer : null}
        />
    );
}

export default SizesEditor;
